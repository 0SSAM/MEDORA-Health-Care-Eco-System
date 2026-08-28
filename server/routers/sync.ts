/**
 * sync.ts — موجّه مزامنة عدم الاتصال (Outbox + LWW) — تنفيذ تصميم SYNC-DESIGN.
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";

const changeSchema = z.object({
  entityType: z.string().min(1).max(64),
  entityId: z.string().min(1).max(128),
  op: z.enum(["upsert", "delete"]),
  payload: z.unknown().nullable(),
  version: z.number().int().nonnegative(),
  deviceId: z.string().min(1).max(128),
  ts: z.number().int().nonnegative(),
});

async function dbOrThrow(): Promise<any> {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
  return db;
}

async function ensureTables(db: any): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS sync_outbox (
      id INT AUTO_INCREMENT PRIMARY KEY,
      entity_type VARCHAR(64) NOT NULL,
      entity_id VARCHAR(128) NOT NULL,
      op VARCHAR(8) NOT NULL,
      payload JSON NULL,
      version BIGINT NOT NULL,
      device_id VARCHAR(128) NOT NULL,
      ts BIGINT NOT NULL,
      created_at DATETIME NOT NULL,
      INDEX idx_sync_ts (ts),
      UNIQUE KEY uq_sync_key (entity_type, entity_id, device_id, ts)
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS sync_meta (
      device_id VARCHAR(128) PRIMARY KEY,
      last_pulled_at BIGINT NOT NULL DEFAULT 0,
      updated_at DATETIME NOT NULL
    )
  `);
}

export const syncRouter = router({
  /** سحب التغييرات منذ طابع زمني (باستثناء تغييرات الجهاز نفسه) */
  pullChanges: protectedProcedure
    .input(z.object({ deviceId: z.string().min(1).max(128), since: z.number().int().min(0).default(0) }))
    .query(async ({ input }) => {
      const db = await dbOrThrow();
      await ensureTables(db);
      const rows: any = await db.execute(
        sql`SELECT entity_type, entity_id, op, payload, version, device_id, ts
            FROM sync_outbox WHERE ts > ${input.since} AND device_id <> ${input.deviceId}
            ORDER BY ts ASC LIMIT 1000`,
      );
      await db.execute(
        sql`INSERT INTO sync_meta (device_id, last_pulled_at, updated_at) VALUES (${input.deviceId}, ${Date.now()}, NOW())
            ON DUPLICATE KEY UPDATE last_pulled_at=VALUES(last_pulled_at), updated_at=NOW()`,
      );
      return (rows?.[0] ?? []).map((r: any) => ({
        entityType: r.entity_type,
        entityId: r.entity_id,
        op: r.op,
        payload: r.payload,
        version: Number(r.version),
        deviceId: r.device_id,
        ts: Number(r.ts),
      }));
    }),

  /** دفع دفعة تغييرات (تطبيق LWW عبر ON DUPLICATE KEY) */
  pushChanges: protectedProcedure
    .input(z.object({ deviceId: z.string().min(1).max(128), changes: z.array(changeSchema).max(500) }))
    .mutation(async ({ input }) => {
      const db = await dbOrThrow();
      await ensureTables(db);
      let accepted = 0;
      for (const c of input.changes) {
        const payloadJson = c.payload == null ? null : JSON.stringify(c.payload);
        const res: any = await db.execute(
          sql`INSERT INTO sync_outbox (entity_type, entity_id, op, payload, version, device_id, ts, created_at)
              VALUES (${c.entityType}, ${c.entityId}, ${c.op}, ${payloadJson}, ${c.version}, ${c.deviceId}, ${c.ts}, NOW())
              ON DUPLICATE KEY UPDATE id=id`,
        );
        accepted += Number(res?.[0]?.affectedRows ?? 0);
      }
      return { accepted, total: input.changes.length };
    }),

  /** إحصاءات المزامنة */
  stats: protectedProcedure.query(async () => {
    const db = await dbOrThrow();
    await ensureTables(db);
    const out: any = await db.execute(sql`SELECT COUNT(*) AS n FROM sync_outbox`);
    const meta: any = await db.execute(sql`SELECT device_id, last_pulled_at FROM sync_meta ORDER BY updated_at DESC LIMIT 20`);
    return {
      outboxCount: Number(out?.[0]?.[0]?.n ?? 0),
      devices: (meta?.[0] ?? []).map((m: any) => ({ deviceId: m.device_id, lastPulledAt: Number(m.last_pulled_at) })),
      resolver: "LWW",
      engine: "shared/sync-engine.ts",
    };
  }),
});

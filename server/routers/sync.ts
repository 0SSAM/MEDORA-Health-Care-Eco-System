/**
 * sync.ts — موجّه مزامنة عدم الاتصال (Outbox + LWW) — tenant-scoped.
 *
 * Every synchronization stream is bound to an organization membership. The
 * client-supplied organizationId is a scope selector, never an authorization
 * grant: the server verifies the caller's active membership before reading or
 * writing the stream.
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

async function assertOrganizationMember(db: any, userId: number, organizationId: number): Promise<void> {
  const rows = (await db.execute(sql`
    SELECT id
    FROM organization_memberships
    WHERE organizationId=${organizationId} AND userId=${userId} AND active=1
    LIMIT 1
  `)) as any;
  if (!rows?.[0]?.[0]) {
    throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك عضوية فعّالة في هذه المنظمة." });
  }
}

async function ensureTables(db: any): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS sync_outbox (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organization_id INT NULL,
      entity_type VARCHAR(64) NOT NULL,
      entity_id VARCHAR(128) NOT NULL,
      op VARCHAR(8) NOT NULL,
      payload JSON NULL,
      version BIGINT NOT NULL,
      device_id VARCHAR(128) NOT NULL,
      ts BIGINT NOT NULL,
      created_at DATETIME NOT NULL,
      INDEX idx_sync_org_ts (organization_id, ts),
      UNIQUE KEY uq_sync_key (entity_type, entity_id, device_id, ts)
    )
  `);

  // Upgrade the legacy table in-place when it already exists. Existing rows
  // remain NULL-scoped and are deliberately excluded by all tenant queries;
  // they can never become visible to an authenticated organization by accident.
  try {
    await db.execute(sql`ALTER TABLE sync_outbox ADD COLUMN IF NOT EXISTS organization_id INT NULL`);
  } catch {
    // Older MySQL-compatible engines may not support IF NOT EXISTS here. The
    // initial CREATE TABLE path still provides the column for fresh installs.
  }
  try {
    await db.execute(sql`ALTER TABLE sync_outbox DROP INDEX uq_sync_key`);
  } catch {
    // Already migrated / legacy schema without the expected index.
  }
  try {
    await db.execute(sql`ALTER TABLE sync_outbox ADD UNIQUE KEY uq_sync_key (organization_id, entity_type, entity_id, device_id, ts)`);
  } catch {
    // The index may already exist after a concurrent/previous migration.
  }
  try {
    await db.execute(sql`ALTER TABLE sync_outbox ADD INDEX idx_sync_org_ts (organization_id, ts)`);
  } catch {
    // The index may already exist after a concurrent/previous migration.
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS sync_meta (
      organization_id INT NOT NULL,
      device_id VARCHAR(128) NOT NULL,
      last_pulled_at BIGINT NOT NULL DEFAULT 0,
      updated_at DATETIME NOT NULL,
      PRIMARY KEY (organization_id, device_id)
    )
  `);
  try {
    await db.execute(sql`ALTER TABLE sync_meta ADD COLUMN IF NOT EXISTS organization_id INT NULL`);
  } catch {
    // Fresh installs already include organization_id; retain compatibility with
    // older engines where ALTER ... IF NOT EXISTS is unavailable.
  }
}

export const syncRouter = router({
  /** سحب التغييرات منذ طابع زمني (باستثناء تغييرات الجهاز نفسه) */
  pullChanges: protectedProcedure
    .input(z.object({
      organizationId: z.number().int().positive(),
      deviceId: z.string().min(1).max(128),
      since: z.number().int().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await dbOrThrow();
      await assertOrganizationMember(db, ctx.user.id, input.organizationId);
      await ensureTables(db);
      const rows: any = await db.execute(
        sql`SELECT entity_type, entity_id, op, payload, version, device_id, ts
            FROM sync_outbox
            WHERE organization_id=${input.organizationId}
              AND ts > ${input.since}
              AND device_id <> ${input.deviceId}
            ORDER BY ts ASC LIMIT 1000`,
      );
      await db.execute(
        sql`INSERT INTO sync_meta (organization_id, device_id, last_pulled_at, updated_at)
            VALUES (${input.organizationId}, ${input.deviceId}, ${Date.now()}, NOW())
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
    .input(z.object({
      organizationId: z.number().int().positive(),
      deviceId: z.string().min(1).max(128),
      changes: z.array(changeSchema).max(500),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await dbOrThrow();
      await assertOrganizationMember(db, ctx.user.id, input.organizationId);
      await ensureTables(db);
      let accepted = 0;
      for (const c of input.changes) {
        const payloadJson = c.payload == null ? null : JSON.stringify(c.payload);
        const res: any = await db.execute(
          sql`INSERT INTO sync_outbox (organization_id, entity_type, entity_id, op, payload, version, device_id, ts, created_at)
              VALUES (${input.organizationId}, ${c.entityType}, ${c.entityId}, ${c.op}, ${payloadJson}, ${c.version}, ${c.deviceId}, ${c.ts}, NOW())
              ON DUPLICATE KEY UPDATE id=id`,
        );
        accepted += Number(res?.[0]?.affectedRows ?? 0);
      }
      return { accepted, total: input.changes.length };
    }),

  /** إحصاءات المزامنة */
  stats: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await dbOrThrow();
      await assertOrganizationMember(db, ctx.user.id, input.organizationId);
      await ensureTables(db);
      const out: any = await db.execute(sql`
        SELECT COUNT(*) AS n FROM sync_outbox WHERE organization_id=${input.organizationId}
      `);
      const meta: any = await db.execute(sql`
        SELECT device_id, last_pulled_at
        FROM sync_meta
        WHERE organization_id=${input.organizationId}
        ORDER BY updated_at DESC LIMIT 20
      `);
      return {
        outboxCount: Number(out?.[0]?.[0]?.n ?? 0),
        devices: (meta?.[0] ?? []).map((m: any) => ({ deviceId: m.device_id, lastPulledAt: Number(m.last_pulled_at) })),
        resolver: "LWW",
        engine: "shared/sync-engine.ts",
      };
    }),
});

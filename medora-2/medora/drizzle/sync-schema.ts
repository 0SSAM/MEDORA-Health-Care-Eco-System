// sync-schema.ts — Outbox/State tables for offline-first sync (LWW).
import { mysqlTable, varchar, int, bigint, json, datetime, index, unique } from "drizzle-orm/mysql-core";

export const SyncOutbox = mysqlTable(
  "sync_outbox",
  {
    id: int("id").autoincrement().primaryKey(),
    entityType: varchar("entity_type", { length: 64 }).notNull(),
    entityId: varchar("entity_id", { length: 128 }).notNull(),
    op: varchar("op", { length: 8 }).notNull(),
    payload: json("payload"),
    version: bigint("version", { mode: "number" }).notNull(),
    deviceId: varchar("device_id", { length: 128 }).notNull(),
    ts: bigint("ts", { mode: "number" }).notNull(),
    createdAt: datetime("created_at").notNull(),
  },
  (t) => [
    index("idx_sync_ts").on(t.ts),
    unique("uq_sync_key").on(t.entityType, t.entityId, t.deviceId, t.ts),
  ],
);

export const SyncMeta = mysqlTable("sync_meta", {
  deviceId: varchar("device_id", { length: 128 }).primaryKey(),
  lastPulledAt: bigint("last_pulled_at", { mode: "number" }).notNull().default(0),
  updatedAt: datetime("updated_at").notNull(),
});

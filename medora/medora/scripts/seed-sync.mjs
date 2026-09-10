#!/usr/bin/env node
// seed-sync.mjs — يضمن وجود جداول المزامنة (sync_outbox, sync_meta) في قاعدة بيانات حية.
import mysql from "mysql2/promise";
const url = process.env.DATABASE_URL || "mysql://medora:medora@127.0.0.1:3306/medora";
const conn = await mysql.createConnection(url);
await conn.query(`CREATE TABLE IF NOT EXISTS sync_outbox (
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
)`);
await conn.query(`CREATE TABLE IF NOT EXISTS sync_meta (
  device_id VARCHAR(128) PRIMARY KEY,
  last_pulled_at BIGINT NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL
)`);
console.log("SYNC_TABLES_READY");
await conn.end();

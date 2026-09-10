#!/usr/bin/env node
// seed-dispensing.mjs — إنشاء جدول صرف الوصفات (يسدّ فجوة P0 في تدقيق التعاقدات الطبية).
// Usage: DATABASE_URL="mysql://user:pass@127.0.0.1:3306/medora" node scripts/seed-dispensing.mjs
import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL || "mysql://medora:medora@127.0.0.1:3306/medora";

const DDL = `
CREATE TABLE IF NOT EXISTS prescription_dispenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  prescription_id INT NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(64),
  drug_code VARCHAR(64),
  drug_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price_egp DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_egp DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(16) NOT NULL DEFAULT 'dispensed',
  notes TEXT,
  dispensed_by_id INT NULL,
  created_at DATETIME NOT NULL,
  dispensed_at DATETIME NULL,
  INDEX idx_disp_org (organization_id),
  INDEX idx_disp_status (status)
)`;

async function main() {
  const conn = await mysql.createConnection(url);
  await conn.query(DDL);
  console.log("prescription_dispenses table ready");
  await conn.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(2);
}

const migrationPath = resolve(process.cwd(), "drizzle/0047_enterprise_erp_completion.sql");
const sql = await readFile(migrationPath, "utf8");
const statements = sql
  .split(/;\s*(?:\r?\n|$)/)
  .map(statement => statement.trim())
  .filter(statement => statement && !statement.startsWith("--"));

const connection = await mysql.createConnection(databaseUrl);
try {
  await connection.beginTransaction();
  for (const statement of statements) {
    await connection.query(statement);
  }
  await connection.commit();
  console.log(`Enterprise ERP completion migration applied: ${statements.length} statements`);
} catch (error) {
  await connection.rollback();
  console.error("Enterprise ERP migration rolled back:", error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await connection.end();
}

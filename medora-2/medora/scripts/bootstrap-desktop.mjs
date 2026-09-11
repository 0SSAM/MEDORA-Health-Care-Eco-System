import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { provisionDesktopAdmin } from "../electron/provision-admin.cjs";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const pool = mysql.createPool(databaseUrl);
try {
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: new URL("../drizzle", import.meta.url).pathname.replace(/^\//, "") });
  await provisionDesktopAdmin(databaseUrl);
  console.log("MEDORA desktop database initialized; system manager is ready.");
} finally {
  await pool.end();
}

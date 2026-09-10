import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export function getRawPool(): mysql.Pool {
  if (pool) return pool;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required for channel persistence");
  const u = new URL(url);
  pool = mysql.createPool({
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
    charset: "utf8mb4",
    supportBigNumbers: true,
    bigNumberStrings: false,
  });
  return pool;
}

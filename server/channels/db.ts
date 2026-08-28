import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export function getRawPool(): mysql.Pool {
  if (pool) return pool;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required for channel persistence");
  pool = mysql.createPool(url);
  return pool;
}

/**
 * Adapt Wasmer's managed MySQL environment to MEDORA's DATABASE_URL contract.
 * This module is imported before the application bootstrap so the value exists
 * before database-backed modules are evaluated.
 */

if (!process.env.DATABASE_URL) {
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || "3306";
  const name = process.env.DB_NAME;
  const username = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;

  if (host && name && username) {
    process.env.DATABASE_URL = `mysql://${encodeURIComponent(username)}:${encodeURIComponent(password ?? "")}@${host}:${port}/${encodeURIComponent(name)}`;
  }
}

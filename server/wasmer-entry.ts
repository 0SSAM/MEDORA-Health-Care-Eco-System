/**
 * Wasmer Edge production bootstrap.
 *
 * Wasmer's managed MySQL capability exposes DB_HOST/DB_PORT/DB_NAME/
 * DB_USERNAME/DB_PASSWORD, while MEDORA's existing database layer expects
 * DATABASE_URL. Build the URL before loading the application so every module
 * sees the same database configuration during ESM initialization.
 */

function configureWasmerDatabase() {
  if (process.env.DATABASE_URL) return;

  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || "3306";
  const name = process.env.DB_NAME;
  const username = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;

  if (!host || !name || !username) return;

  const user = encodeURIComponent(username);
  const secret = encodeURIComponent(password ?? "");
  process.env.DATABASE_URL = `mysql://${user}:${secret}@${host}:${port}/${encodeURIComponent(name)}`;
}

configureWasmerDatabase();
await import("./_core/index.js");

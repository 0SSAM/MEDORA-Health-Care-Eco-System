/**
 * Adapt Wasmer's managed MySQL environment to MEDORA's DATABASE_URL contract.
 * This module is imported before the application bootstrap so the value exists
 * before database-backed modules are evaluated.
 */

export function configureWasmerDatabaseUrl(env: NodeJS.ProcessEnv = process.env): void {
  if (env.DATABASE_URL) return;

  const host = env.DB_HOST;
  const port = env.DB_PORT || "3306";
  const name = env.DB_NAME;
  const username = env.DB_USERNAME;
  const password = env.DB_PASSWORD;

  if (host && name && username) {
    env.DATABASE_URL = `mysql://${encodeURIComponent(username)}:${encodeURIComponent(password ?? "")}@${host}:${port}/${encodeURIComponent(name)}`;
  }
}

configureWasmerDatabaseUrl();

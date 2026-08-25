import { spawnSync } from "node:child_process";
import { createConnection } from "mysql2/promise";
import { isIsolatedTestDatabaseLifecycleEnabled } from "../server/integration/test-database-safety";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const databaseUrl = process.env.DATABASE_URL;
const lifecycleEnabled = isIsolatedTestDatabaseLifecycleEnabled(
  testDatabaseUrl,
  process.env.TEST_DATABASE_ISOLATED,
  process.env.TEST_DATABASE_LIFECYCLE
);

if (!lifecycleEnabled || !databaseUrl || databaseUrl !== testDatabaseUrl) {
  throw new Error(
    "Refusing test database migration: DATABASE_URL must exactly match an explicitly isolated TEST_DATABASE_URL and TEST_DATABASE_LIFECYCLE must be enabled."
  );
}

const result = spawnSync(
  process.platform === "win32" ? "pnpm.cmd" : "pnpm",
  ["exec", "drizzle-kit", "migrate"],
  {
    stdio: "inherit",
    env: process.env,
  }
);

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

// Keep the disposable CI schema fail-closed and self-healing for this known
// historical drift. This path is reachable only after the strict isolation
// gate above; production migrations never execute this repair.
const connection = await createConnection(testDatabaseUrl);
try {
  const requiredJurisdictionTables = [
    "branches",
    "customer_profiles",
    "call_tickets",
  ] as const;
  for (const tableName of requiredJurisdictionTables) {
    const [rows] = await connection.query(
      `SELECT COUNT(*) AS count
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = ?
         AND COLUMN_NAME = 'jurisdictionId'`,
      [tableName]
    );
    const count = Number((rows as Array<{ count: number }>)[0]?.count ?? 0);
    if (count === 0) {
      await connection.query(
        `ALTER TABLE \`${tableName}\` ADD \`jurisdictionId\` int`
      );
    }

    const [verifiedRows] = await connection.query(
      `SELECT COUNT(*) AS count
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = ?
         AND COLUMN_NAME = 'jurisdictionId'`,
      [tableName]
    );
    const verifiedCount = Number(
      (verifiedRows as Array<{ count: number }>)[0]?.count ?? 0
    );
    if (verifiedCount !== 1) {
      throw new Error(
        `Isolated schema verification failed: ${tableName}.jurisdictionId is missing after migrations.`
      );
    }
  }
} finally {
  await connection.end();
}

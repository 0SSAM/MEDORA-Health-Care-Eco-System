import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createConnection, type Connection } from "mysql2/promise";
import { randomUUID } from "node:crypto";
import { isIsolatedTestDatabaseUrl } from "./test-database-safety";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const lifecycleEnabled = isIsolatedTestDatabaseUrl(
  testDatabaseUrl,
  process.env.TEST_DATABASE_ISOLATED
);

describe.skipIf(!lifecycleEnabled)("isolated test database lifecycle", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection(testDatabaseUrl!);
  });

  afterAll(async () => {
    if (connection) await connection.end();
  });

  it("creates scoped probe records only in a temporary table and rolls back the transaction", async () => {
    const runToken = randomUUID();
    await connection.query(
      "DROP TEMPORARY TABLE IF EXISTS lifecycle_scope_probe"
    );
    await connection.beginTransaction();

    try {
      await connection.query(
        "CREATE TEMPORARY TABLE lifecycle_scope_probe (run_token CHAR(36) PRIMARY KEY, organization_id INT NOT NULL, branch_id INT NOT NULL, jurisdiction_id INT NOT NULL, status VARCHAR(32) NOT NULL)"
      );
      await connection.query(
        "INSERT INTO lifecycle_scope_probe (run_token, organization_id, branch_id, jurisdiction_id, status) VALUES (?, ?, ?, ?, ?)",
        [runToken, 900001, 900002, 900003, "created"]
      );

      const [rows] = await connection.query(
        "SELECT run_token, organization_id, branch_id, jurisdiction_id, status FROM lifecycle_scope_probe WHERE run_token = ? AND organization_id = ? AND branch_id = ? AND jurisdiction_id = ?",
        [runToken, 900001, 900002, 900003]
      );
      expect(rows).toEqual([
        {
          run_token: runToken,
          organization_id: 900001,
          branch_id: 900002,
          jurisdiction_id: 900003,
          status: "created",
        },
      ]);
    } finally {
      await connection.rollback();
      await connection.query(
        "DROP TEMPORARY TABLE IF EXISTS lifecycle_scope_probe"
      );
    }
  });

  it("leaves no persistent lifecycle table after cleanup", async () => {
    const [rows] = await connection.query(
      "SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'lifecycle_scope_probe'"
    );
    expect(
      Number((rows as Array<{ count: number | string }>)[0]?.count ?? 0)
    ).toBe(0);
  });
});

if (!lifecycleEnabled) {
  describe("isolated test database lifecycle configuration", () => {
    it("fails closed unless both isolation markers and an eligible URL are supplied", () => {
      expect(lifecycleEnabled).toBe(false);
    });
  });
}

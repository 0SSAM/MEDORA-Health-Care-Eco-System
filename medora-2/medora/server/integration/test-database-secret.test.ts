import { describe, expect, it } from "vitest";
import mysql from "mysql2/promise";
import { isIsolatedTestDatabaseUrl } from "./test-database-safety";

describe("TEST_DATABASE_URL secret", () => {
  it("connects to the isolated test database and closes cleanly when configured", async () => {
    const url = process.env.TEST_DATABASE_URL;
    const isConfigured = isIsolatedTestDatabaseUrl(url, process.env.TEST_DATABASE_ISOLATED);
    if (!isConfigured) {
      expect(isConfigured).toBe(false);
      return;
    }

    const connection = await mysql.createConnection(url);
    try {
      const [rows] = await connection.query("SELECT 1 AS ok");
      expect((rows as Array<{ ok: number }>)[0]?.ok).toBe(1);
    } finally {
      await connection.end();
    }
  });
});

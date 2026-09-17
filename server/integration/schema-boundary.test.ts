import { createConnection, type Connection } from "mysql2/promise";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { isIsolatedTestDatabaseUrl } from "./test-database-safety";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const hasTestDatabase = isIsolatedTestDatabaseUrl(testDatabaseUrl, process.env.TEST_DATABASE_ISOLATED);

describe.skipIf(!hasTestDatabase)("regulated database boundary contract", () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createConnection(testDatabaseUrl!);
  });

  afterAll(async () => {
    if (connection) await connection.end();
  });

  it("requires organization scope on implemented regulated tables", async () => {
    const [rows] = await connection.query(
      `SELECT TABLE_NAME, IS_NULLABLE
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND COLUMN_NAME = 'organizationId'
         AND TABLE_NAME IN ('branches', 'customer_profiles', 'call_tickets', 'prescription_intakes', 'products', 'inventory_batches', 'catalog_items', 'sales')`,
    );

    const byTable = new Map(
      (rows as Array<{ TABLE_NAME: string; IS_NULLABLE: string }>).map(row => [row.TABLE_NAME, row.IS_NULLABLE]),
    );

    for (const table of [
      "branches",
      "customer_profiles",
      "call_tickets",
      "prescription_intakes",
      "products",
      "inventory_batches",
      "catalog_items",
      "sales",
    ]) {
      expect(byTable.get(table)).toBe("NO");
    }
  });

  it("requires jurisdiction scope columns on implemented regulated tables", async () => {
    const [rows] = await connection.query(
      `SELECT TABLE_NAME, COLUMN_NAME, IS_NULLABLE
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND COLUMN_NAME IN ('organizationId', 'jurisdictionId')
         AND TABLE_NAME IN ('branches', 'customer_profiles', 'call_tickets', 'prescription_intakes', 'products', 'inventory_batches', 'catalog_items', 'sales')`,
    );

    const columns = new Map((rows as Array<{ TABLE_NAME: string; COLUMN_NAME: string; IS_NULLABLE: string }>).map(row => [`${row.TABLE_NAME}.${row.COLUMN_NAME}`, row.IS_NULLABLE]));
    for (const table of ["branches", "customer_profiles", "call_tickets", "prescription_intakes", "products", "inventory_batches", "catalog_items", "sales"]) {
      expect(columns.has(`${table}.organizationId`)).toBe(true);
      expect(columns.has(`${table}.jurisdictionId`)).toBe(true);
    }
  });

  it("keeps global-capable records explicitly nullable", async () => {
    const [rows] = await connection.query(
      `SELECT TABLE_NAME, IS_NULLABLE
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND COLUMN_NAME = 'organizationId'
         AND TABLE_NAME IN ('notifications', 'audit_logs')`,
    );

    for (const row of rows as Array<{ TABLE_NAME: string; IS_NULLABLE: string }>) {
      expect(row.IS_NULLABLE).toBe("YES");
    }
  });
});

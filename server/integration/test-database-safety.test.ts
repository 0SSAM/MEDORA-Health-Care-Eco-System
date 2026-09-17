import { describe, expect, it } from "vitest";
import { isIsolatedTestDatabaseUrl } from "./test-database-safety";

describe("test database safety", () => {
  it("requires an explicit isolation marker", () => {
    expect(isIsolatedTestDatabaseUrl("mysql://user:pass@test-db.local/app", undefined)).toBe(false);
    expect(isIsolatedTestDatabaseUrl("mysql://user:pass@test-db.local/app", "false")).toBe(false);
  });

  it("rejects production-like hosts even when marked", () => {
    expect(isIsolatedTestDatabaseUrl("mysql://user:pass/production", "true")).toBe(false);
    expect(isIsolatedTestDatabaseUrl("mysql://user:pass@prod-db.local/app", "true")).toBe(false);
  });

  it("accepts only supported, explicitly isolated test URLs", () => {
    expect(isIsolatedTestDatabaseUrl("mysql://user:pass@test-db.local/app", "true")).toBe(true);
    expect(isIsolatedTestDatabaseUrl("postgres://user:pass@test-db.local/app", "true")).toBe(false);
  });
});

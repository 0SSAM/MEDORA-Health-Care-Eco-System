import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const source = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), "verify-auth-integrity.ts"),
  "utf8",
);

describe("auth integrity verification query", () => {
  it("uses the Drizzle null predicate for orphaned-user detection", () => {
    expect(source).toContain('import { eq, and, isNull } from "drizzle-orm"');
    expect(source).toContain("isNull(organizationMemberships.id)");
    expect(source).not.toContain("eq(organizationMemberships.id, null)");
  });
});

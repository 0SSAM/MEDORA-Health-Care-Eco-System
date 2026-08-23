import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("showcase branding regression guard", () => {
  it("keeps all persisted showcase identities on MEDORA after bootstrap", () => {
    const source = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
    expect(source).toContain('const SHOWCASE_ORGANIZATION_NAME = "MEDORA Investor Showcase"');
    expect(source).toContain('name: "MEDORA Showcase Manager"');
    expect(source).toContain('name: "MEDORA Showcase Pharmacist"');
    expect(source).toContain('name: "MEDORA Showcase Cashier"');
    expect(source).toContain('name: identity.name, role: identity.role');
    expect(source).toContain('displayName: SHOWCASE_ORGANIZATION_NAME');
  });

  it("retains legacy lookup only as a migration path, not as the active identity", () => {
    const source = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
    expect(source).toContain('eq(organizations.displayName, "ALDORA Investor Showcase")');
    expect(source).toContain('await tx.update(organizations).set({ displayName: SHOWCASE_ORGANIZATION_NAME');
  });
});

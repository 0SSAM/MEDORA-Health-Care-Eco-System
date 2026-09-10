import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/BranchAnalyticsDashboard.tsx"), "utf8");

describe("BranchAnalyticsDashboard jurisdiction scope contract", () => {
  it("forwards legal jurisdiction 0 and omits only a null jurisdiction", () => {
    expect(source).toContain("jurisdictionId !== null ? { jurisdictionId } : {}");
    expect(source).not.toContain("jurisdictionId ? { jurisdictionId } : {}");
  });

  it("keeps analytics unavailable only when the branch scope is absent", () => {
    expect(source).toContain("branchId ? { branchId");
    expect(source).toContain("if (!branchId)");
  });
});

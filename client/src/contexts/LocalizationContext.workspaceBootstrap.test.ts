import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(import.meta.dirname, "LocalizationContext.tsx"), "utf8");

describe("workspace bootstrap scope states", () => {
  it("keeps branch scope unavailable until the current agreement is accepted", () => {
    expect(source).toContain('const hasAcceptedCurrentNda = ndaStatusQuery.data?.accepted === true;');
    expect(source).toContain('enabled: Boolean(user) && hasAcceptedCurrentNda');
    expect(source).toContain(': "nda_required";');
  });

  it("distinguishes agreement and branch-registry reads from a missing scope", () => {
    expect(source).toContain('type WorkspaceBootstrapStatus = "ready" | "nda_loading" | "nda_error" | "nda_required" | "branch_loading" | "branch_error" | "branch_missing";');
    expect(source).toContain('? "nda_loading"');
    expect(source).toContain('? "nda_error"');
    expect(source).toContain('? "branch_loading"');
    expect(source).toContain('? "branch_error"');
    expect(source).toContain(': "branch_missing"');
  });

  it("retries only the bootstrap read whose error is currently displayed", () => {
    expect(source).toContain('if (workspaceBootstrapStatus === "nda_error") {');
    expect(source).toContain('await ndaStatusQuery.refetch();');
    expect(source).toContain('if (workspaceBootstrapStatus === "branch_error") await branchRegistry.refetch();');
    expect(source).not.toContain('setSelectedBranchId(0)');
  });
});

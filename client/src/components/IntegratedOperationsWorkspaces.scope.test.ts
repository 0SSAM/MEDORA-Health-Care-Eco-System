import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { hasOrganizationJurisdictionScope } from "@/lib/scope";

describe("IntegratedOperationsWorkspaces jurisdiction scope contract", () => {
  const source = readFileSync(new URL("./IntegratedOperationsWorkspaces.tsx", import.meta.url), "utf8");

  it("requires a positive legal jurisdiction for an organization scope", () => {
    expect(hasOrganizationJurisdictionScope(1, 1)).toBe(true);
    expect(hasOrganizationJurisdictionScope(1, 0)).toBe(false);
    expect(hasOrganizationJurisdictionScope(1, null)).toBe(false);
  });

  it("uses the shared positive-scope helper for the scope notice and scoped workspaces", () => {
    expect(source).toContain('import { hasOrganizationJurisdictionScope } from "@/lib/scope";');
    expect(source).toContain("if (hasOrganizationJurisdictionScope(organizationId, jurisdictionId)) return null;");
    expect(source).toContain("const enabled = hasOrganizationJurisdictionScope(organizationId, jurisdictionId);");
    expect(source).toContain("if (!hasOrganizationJurisdictionScope(organizationId, jurisdictionId)) return setStatus");
  });
});

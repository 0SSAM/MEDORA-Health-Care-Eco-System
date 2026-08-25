import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { ROLE_CAPABILITIES } from "./domain/organization-access";

describe("employee account management contract", () => {
  const routerSource = readFileSync(new URL("./routers/organizations.ts", import.meta.url), "utf8");

  it("keeps privileged organization-admin assignment behind the platform boundary", () => {
    expect(routerSource).toContain('input.organizationRole === "org_admin"');
    expect(routerSource).toContain("Only platform administration can create organization administrators");
    expect(routerSource).toContain("Only platform administration can assign organization administrators");
  });

  it("uses server-side scope checks for employee mutations", () => {
    expect(routerSource).toContain("requireOrganizationManager(ctx, input.organizationId)");
    expect(routerSource).toContain("assertBranchScope(db, input.organizationId, input.branchId, input.jurisdictionId)");
    expect(routerSource).toContain("You cannot deactivate your own account");
  });

  it("exposes capabilities from the single role policy and never returns password hashes", () => {
    expect(ROLE_CAPABILITIES.staff).toContain("view_workspace");
    expect(ROLE_CAPABILITIES.operations_manager).toContain("view_workspace");
    expect(ROLE_CAPABILITIES.operations_manager).not.toContain("manage_members");
    expect(ROLE_CAPABILITIES.auditor).toContain("view_audit");
    expect(routerSource).toContain("capabilities: ROLE_CAPABILITIES");
    expect(routerSource).not.toContain("passwordHash: internalCredentials.passwordHash");
  });
});

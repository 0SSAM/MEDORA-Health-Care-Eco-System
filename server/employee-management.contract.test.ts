import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { ROLE_CAPABILITIES } from "./domain/organization-access";
import { createEmployeeDirectoryCsv, escapeEmployeeCsvCell } from "./domain/employee-directory-export";
import { employeeDirectoryExportInput, employeeDirectoryPageInput } from "./routers/organizations";

describe("employee account management contract", () => {
  const routerSource = readFileSync(new URL("./routers/organizations.ts", import.meta.url), "utf8");

  it("keeps privileged organization-admin assignment behind the platform boundary", () => {
    expect(routerSource).toContain('input.organizationRole === "org_admin"');
    expect(routerSource).toContain("Only platform administration can create organization administrators");
    expect(routerSource).toContain("Only platform administration can assign organization administrators");
    expect(routerSource).toContain("Protected organization roles must be changed through platform administration");
  });

  it("uses server-side scope checks for employee mutations", () => {
    expect(routerSource).toContain("requireOrganizationManager(ctx, input.organizationId)");
    expect(routerSource).toContain("assertShowcaseOrganizationScope(ctx, organizationId)");
    expect(routerSource).toContain("Showcase sessions can access only their isolated organization");
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

  it("bounds paginated employee-directory inputs and keeps filtering inside the organization-scoped procedure", () => {
    expect(employeeDirectoryPageInput.parse({ organizationId: 8, page: 2, pageSize: 20, query: "nora", role: "staff", branchId: 4 })).toMatchObject({ organizationId: 8, page: 2, pageSize: 20, role: "staff", branchId: 4 });
    expect(() => employeeDirectoryPageInput.parse({ organizationId: 8, pageSize: 51 })).toThrow();
    expect(routerSource).toContain("employeeDirectoryPage: protectedProcedure.input(employeeDirectoryPageInput)");
    expect(routerSource).toContain("eq(organizationMemberships.organizationId, input.organizationId)");
    expect(routerSource).toContain("orderBy(asc(users.name), asc(users.id))");
    expect(routerSource).toContain("limit(input.pageSize).offset((page - 1) * input.pageSize)");
  });

  it("exports only a bounded, organization-scoped operational CSV with the active filters", () => {
    expect(employeeDirectoryExportInput.parse({ organizationId: 8, query: "nora", role: "staff", branchId: 4 })).toMatchObject({ organizationId: 8, query: "nora", role: "staff", branchId: 4 });
    expect(routerSource).toContain("exportEmployeeDirectoryCsv: protectedProcedure.input(employeeDirectoryExportInput)");
    expect(routerSource).toContain("const EMPLOYEE_DIRECTORY_EXPORT_LIMIT = 1_000");
    expect(routerSource).toContain("requireOrganizationManager(ctx, input.organizationId)");
    expect(routerSource).toContain("limit(EMPLOYEE_DIRECTORY_EXPORT_LIMIT + 1)");
    expect(routerSource).toContain("medora-employee-directory-org-${input.organizationId}");
    expect(routerSource).not.toContain("passwordHash: internalCredentials.passwordHash");
  });

  it("escapes quoted and spreadsheet-formula CSV values while omitting email and credentials from output columns", () => {
    expect(escapeEmployeeCsvCell('=SUM(1,1)')).toBe("\"'=SUM(1,1)\"");
    expect(escapeEmployeeCsvCell('Nora "A"')).toBe('"Nora ""A"""');
    const csv = createEmployeeDirectoryCsv([{ name: "Nora", username: "nora", organizationRole: "staff", branchName: "Main", active: 1 }]);
    expect(csv).toContain('"employee_name","username","organization_role","branch_name","account_status"');
    expect(csv).toContain('"Nora","nora","staff","Main","active"');
    expect(csv).not.toContain("email");
    expect(csv).not.toContain("password");
  });
});

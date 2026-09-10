import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("Admin Console source contract", () => {
  const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
  const consoleSource = readFileSync(new URL("./AdminConsole.tsx", import.meta.url), "utf8");
  const workspaceSource = readFileSync(new URL("../components/EmployeeAdministrationWorkspace.tsx", import.meta.url), "utf8");

  it("registers an independent admin route inside the existing guarded app shell", () => {
    expect(appSource).toContain('const AdminConsole = lazy(() => import("@/pages/AdminConsole"))');
    expect(appSource).toContain('<Route path={"/admin"} component={AdminConsole} />');
    expect(consoleSource).toContain("EmployeeAdministrationWorkspace");
  });

  it("keeps employee editing constrained to a confirmed branch and role-derived privileges", () => {
    expect(workspaceSource).toContain("EDITABLE_ROLES");
    expect(workspaceSource).toContain("PROTECTED_ROLES");
    expect(workspaceSource).toContain("jurisdictionId: selectedBranch.jurisdictionId");
    expect(workspaceSource).toContain("organizationRole: editRole");
    expect(workspaceSource).toContain("The server re-validates organization, branch, and jurisdiction on save");
  });

  it("renders the role capability matrix as a read-only explanation rather than a permission override editor", () => {
    expect(workspaceSource).toContain("ROLE_CAPABILITY_MATRIX");
    expect(workspaceSource).toContain("Read-only view. Privileges are fixed and role-derived");
    expect(workspaceSource).not.toContain("permissionOverride");
  });

  it("keeps employee discovery inside the authorized paginated directory with accessible role and branch filters", () => {
    expect(workspaceSource).toContain("employeeDirectoryPage.useQuery");
    expect(workspaceSource).toContain("pageSize: EMPLOYEE_PAGE_SIZE");
    expect(workspaceSource).toContain("directoryPage");
    expect(workspaceSource).toContain('aria-label={t("ترقيم دليل الموظفين", "Employee directory pagination")}');
    expect(workspaceSource).toContain('role="search"');
    expect(workspaceSource).toContain("directoryRole");
    expect(workspaceSource).toContain("directoryBranchId");
    expect(workspaceSource).toContain("clearDirectoryFilters");
  });

  it("exports only the active scoped directory filters as CSV and explains its privacy boundary", () => {
    expect(workspaceSource).toContain("trpc.organizations.exportEmployeeDirectoryCsv.useMutation()");
    expect(workspaceSource).toContain("query: appliedDirectoryQuery");
    expect(workspaceSource).toContain("role: directoryRole");
    expect(workspaceSource).toContain("branchId: directoryBranchId === \"all\" ? undefined : Number(directoryBranchId)");
    expect(workspaceSource).toContain('id="employee-export-scope"');
    expect(workspaceSource).toContain("It excludes email, credential, and password data");
  });
});

export type EmployeeDirectoryFilterRecord = {
  name: string | null;
  email: string | null;
  username: string;
  organizationRole: string;
  branchId: number;
};

export type EmployeeDirectoryFilters = {
  query: string;
  role: string;
  branchId: string;
};

export function normalizeEmployeeDirectoryQuery(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function filterEmployeeDirectory<T extends EmployeeDirectoryFilterRecord>(directory: readonly T[], filters: EmployeeDirectoryFilters): T[] {
  const query = normalizeEmployeeDirectoryQuery(filters.query);
  const selectedRole = filters.role === "all" ? null : filters.role;
  const selectedBranchId = filters.branchId === "all" ? null : Number(filters.branchId);

  return directory.filter(member => {
    const searchableValues = [member.name ?? "", member.email ?? "", member.username]
      .map(normalizeEmployeeDirectoryQuery);
    const textMatches = !query || searchableValues.some(value => value.includes(query));
    const roleMatches = !selectedRole || member.organizationRole === selectedRole;
    const branchMatches = selectedBranchId === null || (Number.isInteger(selectedBranchId) && member.branchId === selectedBranchId);

    return textMatches && roleMatches && branchMatches;
  });
}

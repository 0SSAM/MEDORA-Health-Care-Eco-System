export function canAccessBranch(role: string, assignedBranchIds: number[], branchId: number): boolean {
  return role === "admin" || assignedBranchIds.includes(branchId);
}

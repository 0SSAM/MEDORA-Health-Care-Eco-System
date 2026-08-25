export type ActiveBranchJurisdiction = {
  active: number;
  jurisdictionId: number;
};

export function canAccessJurisdiction(
  role: string,
  assignments: ActiveBranchJurisdiction[],
  jurisdictionId: number,
): boolean {
  if (role === "admin") return true;
  return assignments.some(
    (assignment) => assignment.active === 1 && assignment.jurisdictionId === jurisdictionId,
  );
}

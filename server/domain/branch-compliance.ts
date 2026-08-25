export type BranchJurisdictionAssignment = {
  branchId: number;
  jurisdictionId: number;
  locationSource: "admin_confirmed" | "manual_override" | "device";
  confirmedByUserId: number;
};

export function assertBranchAssignmentReady(assignment: BranchJurisdictionAssignment | null | undefined): asserts assignment is BranchJurisdictionAssignment {
  if (!assignment) throw new Error("Branch has no confirmed jurisdiction");
  if (assignment.branchId <= 0 || assignment.jurisdictionId <= 0) throw new Error("Branch jurisdiction identifiers are invalid");
  if (assignment.confirmedByUserId <= 0) throw new Error("Branch jurisdiction requires an approving administrator");
  if (assignment.locationSource === "device") throw new Error("Device location cannot establish legal jurisdiction");
  return;
}

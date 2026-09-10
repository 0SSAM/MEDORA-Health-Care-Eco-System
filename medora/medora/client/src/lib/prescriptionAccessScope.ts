export type PrescriptionAccessScope = {
  branchId: string | number;
  jurisdictionId: number | null | undefined;
  patientId: string | number;
};

export function hasAssignedPrescriptionJurisdiction(jurisdictionId: number | null | undefined): jurisdictionId is number {
  return typeof jurisdictionId === "number" && Number.isInteger(jurisdictionId) && jurisdictionId > 0;
}

/**
 * Builds the read-only prescription lookup input only for an explicit active
 * operational scope. Server-side membership assertions remain the authority
 * for every accepted scope.
 */
export function buildPrescriptionAccessInput({ branchId, jurisdictionId, patientId }: PrescriptionAccessScope) {
  const parsedBranchId = Number(branchId);
  const parsedPatientId = Number(patientId);
  if (
    !Number.isInteger(parsedBranchId) || parsedBranchId <= 0 ||
    !Number.isInteger(parsedPatientId) || parsedPatientId <= 0 ||
    !hasAssignedPrescriptionJurisdiction(jurisdictionId)
  ) return null;

  return {
    branchId: parsedBranchId,
    jurisdictionId,
    patientId: parsedPatientId,
    includePending: true,
  };
}

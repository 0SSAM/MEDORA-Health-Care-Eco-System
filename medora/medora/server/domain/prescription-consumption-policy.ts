export type PrescriptionConsumptionContext = {
  organizationId: string;
  jurisdictionCode: string;
  branchId: string;
  catalogOrganizationId: string;
  catalogJurisdictionCode: string;
  catalogBranchId: string;
  catalogApproved: boolean;
  catalogEvidenceVerified: boolean;
};

export function prescriptionConsumptionReadiness(context: PrescriptionConsumptionContext | null) {
  if (!context) return "BLOCKED" as const;
  const sameScope = context.organizationId === context.catalogOrganizationId && context.jurisdictionCode === context.catalogJurisdictionCode && context.branchId === context.catalogBranchId;
  return sameScope && context.catalogApproved && context.catalogEvidenceVerified ? "READY" as const : "BLOCKED" as const;
}

export function assertPrescriptionConsumptionReady(context: PrescriptionConsumptionContext | null) {
  if (prescriptionConsumptionReadiness(context) !== "READY") throw new Error("Prescription product consumption is not ready for activation");
  return true as const;
}

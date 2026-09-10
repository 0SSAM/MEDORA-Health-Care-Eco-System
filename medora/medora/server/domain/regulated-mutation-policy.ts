export type RegulatedMutationContext = {
  branchJurisdictionAssigned: boolean;
  compliancePackApproved: boolean;
  compliancePackStale: boolean;
  productInvolved: boolean;
  catalogEvidenceVerified: boolean;
};

export function regulatedMutationReadiness(context: RegulatedMutationContext | null) {
  if (!context) return "BLOCKED" as const;
  const packReady = context.branchJurisdictionAssigned && context.compliancePackApproved && !context.compliancePackStale;
  const productReady = !context.productInvolved || context.catalogEvidenceVerified;
  return packReady && productReady ? "READY" as const : "BLOCKED" as const;
}

export function assertRegulatedMutationReady(context: RegulatedMutationContext | null) {
  if (regulatedMutationReadiness(context) !== "READY") throw new Error("Regulated mutation is not ready for activation");
  return true as const;
}

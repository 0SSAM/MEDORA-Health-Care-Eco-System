export type InventoryMutationContext = {
  branchJurisdictionAssigned: boolean;
  compliancePackApproved: boolean;
  compliancePackStale: boolean;
  batchEvidenceVerified: boolean;
  fefoSelected: boolean;
  resultingStock: number;
};

export function inventoryMutationReadiness(context: InventoryMutationContext | null) {
  if (!context) return "BLOCKED" as const;
  const ready = context.branchJurisdictionAssigned && context.compliancePackApproved && !context.compliancePackStale && context.batchEvidenceVerified && context.fefoSelected && context.resultingStock >= 0;
  return ready ? "READY" as const : "BLOCKED" as const;
}

export function assertInventoryMutationReady(context: InventoryMutationContext | null) {
  if (inventoryMutationReadiness(context) !== "READY") throw new Error("Inventory mutation is not ready");
  return true as const;
}

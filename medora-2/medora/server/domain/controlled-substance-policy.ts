export type ControlledSubstanceContext = {
  jurisdictionEvidenceVerified: boolean;
  facilityLicenceVerified: boolean;
  prescriberAuthorized: boolean;
  pharmacistAuthorized: boolean;
  prescriptionVerified: boolean;
  dualReviewCompleted: boolean;
};

export function controlledSubstanceReadiness(context: ControlledSubstanceContext | null) {
  if (!context) return "BLOCKED" as const;
  return Object.values(context).every(Boolean) ? "READY" as const : "BLOCKED" as const;
}

export function assertControlledSubstanceReady(context: ControlledSubstanceContext | null) {
  if (controlledSubstanceReadiness(context) !== "READY") throw new Error("Controlled-substance dispensing is not ready");
  return true as const;
}

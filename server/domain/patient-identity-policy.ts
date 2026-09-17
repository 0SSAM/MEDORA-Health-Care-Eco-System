export type PatientIdentityContext = {
  trustedInternalIdentifier: boolean;
  minimumDemographicConfirmation: boolean;
  ambiguityCleared: boolean;
  manualReviewCompletedWhenNeeded: boolean;
};

export function patientIdentityReadiness(context: PatientIdentityContext | null) {
  if (!context) return "BLOCKED" as const;
  return Object.values(context).every(Boolean) ? "READY" as const : "BLOCKED" as const;
}

export function assertPatientIdentityReady(context: PatientIdentityContext | null) {
  if (patientIdentityReadiness(context) !== "READY") throw new Error("Patient identity match is not ready");
  return true as const;
}

export type ClinicalAccessContext = {
  roleAuthorized: boolean;
  purposeDeclared: boolean;
  organizationScopeVerified: boolean;
  branchJurisdictionScopeVerified: boolean;
  consentVerifiedOrNotRequired: boolean;
  breakGlassAudited: boolean;
};

export function clinicalAccessReadiness(context: ClinicalAccessContext | null) {
  if (!context) return "BLOCKED" as const;
  return Object.values(context).every(Boolean) ? "READY" as const : "BLOCKED" as const;
}

export function assertClinicalAccessReady(context: ClinicalAccessContext | null) {
  if (clinicalAccessReadiness(context) !== "READY") throw new Error("Clinical data access is not ready");
  return true as const;
}

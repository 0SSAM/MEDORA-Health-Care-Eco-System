export type InsuranceTransportProfile = {
  payerId: string;
  endpointSpecificationUrl: string;
  credentialsConfigured: boolean;
  claimMappingVerified: boolean;
  eligibilityMappingVerified: boolean;
  sandboxVerified: boolean;
  acceptanceCriteriaVerified: boolean;
};

export function insuranceTransportReadiness(profile: InsuranceTransportProfile | null) {
  if (!profile) return "BLOCKED" as const;
  return Boolean(profile.payerId && profile.endpointSpecificationUrl && profile.credentialsConfigured && profile.claimMappingVerified && profile.eligibilityMappingVerified && profile.sandboxVerified && profile.acceptanceCriteriaVerified) ? "READY" as const : "BLOCKED" as const;
}

export function assertInsuranceTransportReady(profile: InsuranceTransportProfile | null) {
  if (insuranceTransportReadiness(profile) !== "READY") throw new Error("Insurance payer transport is not ready for activation");
  return true as const;
}

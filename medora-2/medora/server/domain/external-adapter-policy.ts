export type AdapterReadiness = "READY" | "BLOCKED";

export type ExternalAdapterReadinessInput = {
  specificationsVerified: boolean;
  credentialsConfigured: boolean;
  organizationRegistered: boolean;
  humanAccepted: boolean;
  endpointContractVerified: boolean;
  acknowledgementContractVerified: boolean;
  retrySafetyVerified: boolean;
  auditMetadataVerified: boolean;
};

export function externalAdapterReadiness(input: ExternalAdapterReadinessInput): AdapterReadiness {
  const requiredGates = [
    input.specificationsVerified,
    input.credentialsConfigured,
    input.organizationRegistered,
    input.humanAccepted,
    input.endpointContractVerified,
    input.acknowledgementContractVerified,
    input.retrySafetyVerified,
    input.auditMetadataVerified,
  ];

  return requiredGates.every(Boolean) ? "READY" : "BLOCKED";
}

export function assertExternalAdapterReady(input: ExternalAdapterReadinessInput) {
  if (externalAdapterReadiness(input) !== "READY") {
    throw new Error("External adapter is not ready for production submission");
  }
  return true as const;
}

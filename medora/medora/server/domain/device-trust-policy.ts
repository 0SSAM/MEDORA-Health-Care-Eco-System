export type DeviceTrustContext = {
  deviceIdentityVerified: boolean;
  localStorageEncrypted: boolean;
  supportedAppVersion: boolean;
  screenLockAssured: boolean;
  deviceRevocationChecked: boolean;
  sessionScopeVerified: boolean;
};

export type TrustedAttestation = {
  deviceId: string;
  nonce: string;
  issuedAtMs: number;
  expiresAtMs: number;
  revoked: boolean;
  organizationId: number;
  jurisdictionId: number;
};

export type AttestationValidationInput = {
  attestation: TrustedAttestation | null;
  expectedNonce: string;
  nowMs: number;
  organizationId: number;
  jurisdictionId: number;
};

export function deviceTrustReadiness(context: DeviceTrustContext | null) {
  if (!context) return "BLOCKED" as const;
  return Object.values(context).every(Boolean) ? "READY" as const : "BLOCKED" as const;
}

export function assertDeviceTrustReady(context: DeviceTrustContext | null) {
  if (deviceTrustReadiness(context) !== "READY") throw new Error("Device trust is not ready");
  return true as const;
}

export function validateTrustedAttestation(input: AttestationValidationInput) {
  const { attestation, expectedNonce, nowMs, organizationId, jurisdictionId } = input;
  if (!attestation) return "BLOCKED" as const;
  if (!attestation.deviceId.trim() || !expectedNonce.trim() || attestation.nonce !== expectedNonce) return "BLOCKED" as const;
  if (!Number.isFinite(attestation.issuedAtMs) || !Number.isFinite(attestation.expiresAtMs) || !Number.isFinite(nowMs)) return "BLOCKED" as const;
  if (attestation.issuedAtMs > nowMs || attestation.expiresAtMs <= nowMs || attestation.expiresAtMs <= attestation.issuedAtMs) return "BLOCKED" as const;
  if (attestation.revoked) return "BLOCKED" as const;
  if (!Number.isInteger(organizationId) || !Number.isInteger(jurisdictionId)) return "BLOCKED" as const;
  if (attestation.organizationId !== organizationId || attestation.jurisdictionId !== jurisdictionId) return "BLOCKED" as const;
  return "READY" as const;
}

export function assertTrustedAttestation(input: AttestationValidationInput) {
  if (validateTrustedAttestation(input) !== "READY") throw new Error("Trusted attestation is invalid or stale");
  return true as const;
}

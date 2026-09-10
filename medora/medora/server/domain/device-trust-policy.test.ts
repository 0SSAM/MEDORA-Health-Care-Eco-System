import { describe, expect, it } from "vitest";
import {
  assertDeviceTrustReady,
  assertTrustedAttestation,
  deviceTrustReadiness,
  validateTrustedAttestation,
  type DeviceTrustContext,
} from "./device-trust-policy";

const complete: DeviceTrustContext = {
  deviceIdentityVerified: true,
  localStorageEncrypted: true,
  supportedAppVersion: true,
  screenLockAssured: true,
  deviceRevocationChecked: true,
  sessionScopeVerified: true,
};

const attestation = {
  deviceId: "device-1",
  nonce: "nonce-1",
  issuedAtMs: 1_000,
  expiresAtMs: 10_000,
  revoked: false,
  organizationId: 7,
  jurisdictionId: 4,
} as const;

const validationInput = {
  attestation,
  expectedNonce: "nonce-1",
  nowMs: 5_000,
  organizationId: 7,
  jurisdictionId: 4,
};

describe("device trust policy", () => {
  it("blocks missing or incomplete device context", () => {
    expect(deviceTrustReadiness(null)).toBe("BLOCKED");
    const gates: Array<keyof DeviceTrustContext> = [
      "deviceIdentityVerified",
      "localStorageEncrypted",
      "supportedAppVersion",
      "screenLockAssured",
      "deviceRevocationChecked",
      "sessionScopeVerified",
    ];
    for (const gate of gates) {
      expect(deviceTrustReadiness({ ...complete, [gate]: false })).toBe("BLOCKED");
      expect(() => assertDeviceTrustReady({ ...complete, [gate]: false })).toThrow(/not ready/);
    }
  });

  it("allows access only when every device trust gate is verified", () => {
    expect(deviceTrustReadiness(complete)).toBe("READY");
    expect(assertDeviceTrustReady(complete)).toBe(true);
  });

  it("accepts a fresh, non-revoked, scope-matched attestation", () => {
    expect(validateTrustedAttestation(validationInput)).toBe("READY");
    expect(assertTrustedAttestation(validationInput)).toBe(true);
  });

  it.each([
    ["missing attestation", { attestation: null }],
    ["wrong nonce", { expectedNonce: "other" }],
    ["expired", { nowMs: 10_000 }],
    ["issued in the future", { nowMs: 500 }],
    ["revoked", { attestation: { ...attestation, revoked: true } }],
    ["wrong organization", { organizationId: 8 }],
    ["wrong jurisdiction", { jurisdictionId: 5 }],
  ])("blocks %s", (_reason, override) => {
    const input = { ...validationInput, ...override };
    expect(validateTrustedAttestation(input)).toBe("BLOCKED");
    expect(() => assertTrustedAttestation(input)).toThrow(/invalid or stale/);
  });
});

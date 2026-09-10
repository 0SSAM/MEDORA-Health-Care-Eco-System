import { describe, expect, it } from "vitest";
import {
  assertHardwareReady,
  browserCapabilityNote,
  hardwareReadiness,
  type HardwareAdapterContext,
} from "./hardware-adapter-policy";

const base: HardwareAdapterContext = {
  kind: "printer",
  transport: "browser-download",
  deviceId: "browser-output-1",
  organizationId: 10,
  branchId: 20,
  jurisdictionId: 30,
  protocolVerified: true,
  scopeVerified: true,
  secureChannelVerified: false,
  healthCheckPassed: true,
  operatorAuthorized: true,
  externalCredentialsVerified: false,
};

describe("hardware adapter readiness", () => {
  it("allows browser-safe output without claiming direct printer control", () => {
    expect(hardwareReadiness(base)).toBe("READY");
    expect(browserCapabilityNote("printer", "browser-download")).toContain("direct device control is not claimed");
    expect(() => assertHardwareReady(base)).not.toThrow();
  });

  it("blocks an unscoped or unverified direct printer adapter", () => {
    expect(hardwareReadiness({ ...base, transport: "network-ipps", secureChannelVerified: false })).toBe("BLOCKED");
    expect(hardwareReadiness({ ...base, scopeVerified: false })).toBe("BLOCKED");
  });

  it("permits keyboard-wedge scanning but keeps regulated submission separate", () => {
    const scanner = {
      ...base,
      kind: "scanner" as const,
      transport: "keyboard-wedge" as const,
      deviceId: "scanner-1",
    };
    expect(hardwareReadiness(scanner)).toBe("READY");
    expect(browserCapabilityNote("scanner", "keyboard-wedge")).toContain("regulated submission remain separate");
  });

  it("requires secure credentials and channel for monitoring adapters", () => {
    const monitor = {
      ...base,
      kind: "monitor" as const,
      transport: "sensor-api" as const,
      deviceId: "sensor-1",
      secureChannelVerified: true,
      externalCredentialsVerified: true,
      monitoringGovernanceApproved: true,
      monitoringPurpose: "safety" as const,
    };
    expect(hardwareReadiness(monitor)).toBe("READY");
    expect(hardwareReadiness({ ...monitor, externalCredentialsVerified: false })).toBe("BLOCKED");
    expect(hardwareReadiness({ ...monitor, monitoringGovernanceApproved: false })).toBe("BLOCKED");
    expect(() => assertHardwareReady({ ...monitor, scopeVerified: false })).toThrow();
  });
});

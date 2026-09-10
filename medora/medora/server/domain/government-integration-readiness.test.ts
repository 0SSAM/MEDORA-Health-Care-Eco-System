import { describe, expect, it } from "vitest";
import { buildGovernmentIntegrationReadinessPacket, GOVERNMENT_INTEGRATION_GATE_DEFINITIONS } from "./government-integration-readiness";

describe("government integration readiness packet", () => {
  it("starts fail-closed with every evidence gate missing and no external submission path", () => {
    const packet = buildGovernmentIntegrationReadinessPacket();

    expect(packet.activationState).toBe("blocked");
    expect(packet.readinessPercent).toBe(0);
    expect(packet.missingGateIds).toHaveLength(GOVERNMENT_INTEGRATION_GATE_DEFINITIONS.length);
    expect(packet.gates.every(gate => gate.state === "missing")).toBe(true);
    expect(packet.externalSubmissionAllowed).toBe(false);
    expect(packet.limitation).toMatch(/لا ينفذ/);
  });

  it("marks a packet ready only for a separately authorized activation while external submission remains disabled", () => {
    const allVerified = Object.fromEntries(GOVERNMENT_INTEGRATION_GATE_DEFINITIONS.map(gate => [gate.id, true]));
    const packet = buildGovernmentIntegrationReadinessPacket(allVerified);

    expect(packet.activationState).toBe("ready-for-authorized-activation");
    expect(packet.readinessPercent).toBe(100);
    expect(packet.missingGateIds).toEqual([]);
    expect(packet.externalSubmissionAllowed).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { assertExternalAdapterReady, externalAdapterReadiness } from "./external-adapter-policy";

describe("external adapter readiness", () => {
  const ready = {
    specificationsVerified: true,
    credentialsConfigured: true,
    organizationRegistered: true,
    humanAccepted: true,
    endpointContractVerified: true,
    acknowledgementContractVerified: true,
    retrySafetyVerified: true,
    auditMetadataVerified: true,
  };

  it("blocks until every production submission gate is complete", () => {
    const gates = Object.keys(ready) as Array<keyof typeof ready>;
    for (const gate of gates) {
      expect(externalAdapterReadiness({ ...ready, [gate]: false })).toBe("BLOCKED");
    }
    expect(() => assertExternalAdapterReady({ ...ready, specificationsVerified: false })).toThrow(/not ready/);
  });

  it("allows production submission only after all readiness gates pass", () => {
    expect(externalAdapterReadiness(ready)).toBe("READY");
    expect(assertExternalAdapterReady(ready)).toBe(true);
  });
});

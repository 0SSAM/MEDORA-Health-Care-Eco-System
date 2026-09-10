import { describe, expect, it } from "vitest";
import { assertInsuranceTransportReady, insuranceTransportReadiness, type InsuranceTransportProfile } from "./insurance-transport-policy";

const complete: InsuranceTransportProfile = {
  payerId: "payer-eg-01",
  endpointSpecificationUrl: "https://official.example/payer-spec",
  credentialsConfigured: true,
  claimMappingVerified: true,
  eligibilityMappingVerified: true,
  sandboxVerified: true,
  acceptanceCriteriaVerified: true,
};

describe("insurance payer transport readiness", () => {
  it("blocks an unprepared payer transport", () => {
    expect(insuranceTransportReadiness(null)).toBe("BLOCKED");
    expect(insuranceTransportReadiness({ ...complete, sandboxVerified: false })).toBe("BLOCKED");
    expect(() => assertInsuranceTransportReady({ ...complete, credentialsConfigured: false })).toThrow(/not ready/);
  });

  it("allows activation only after all transport gates pass", () => {
    expect(insuranceTransportReadiness(complete)).toBe("READY");
    expect(assertInsuranceTransportReady(complete)).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { assertPatientIdentityReady, patientIdentityReadiness, type PatientIdentityContext } from "./patient-identity-policy";

const complete: PatientIdentityContext = {
  trustedInternalIdentifier: true,
  minimumDemographicConfirmation: true,
  ambiguityCleared: true,
  manualReviewCompletedWhenNeeded: true,
};

describe("patient identity readiness", () => {
  it("blocks unresolved or ambiguous identity matches", () => {
    expect(patientIdentityReadiness(null)).toBe("BLOCKED");
    expect(patientIdentityReadiness({ ...complete, trustedInternalIdentifier: false })).toBe("BLOCKED");
    expect(patientIdentityReadiness({ ...complete, ambiguityCleared: false })).toBe("BLOCKED");
    expect(() => assertPatientIdentityReady({ ...complete, manualReviewCompletedWhenNeeded: false })).toThrow(/not ready/);
  });

  it("allows a match only when every identity gate is verified", () => {
    expect(patientIdentityReadiness(complete)).toBe("READY");
    expect(assertPatientIdentityReady(complete)).toBe(true);
  });
});

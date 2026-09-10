import { describe, expect, it } from "vitest";
import { assertControlledSubstanceReady, controlledSubstanceReadiness, type ControlledSubstanceContext } from "./controlled-substance-policy";

const complete: ControlledSubstanceContext = {
  jurisdictionEvidenceVerified: true,
  facilityLicenceVerified: true,
  prescriberAuthorized: true,
  pharmacistAuthorized: true,
  prescriptionVerified: true,
  dualReviewCompleted: true,
};

describe("controlled-substance dispensing readiness", () => {
  it("blocks missing evidence, licences, roles, prescription, or review", () => {
    expect(controlledSubstanceReadiness(null)).toBe("BLOCKED");
    expect(controlledSubstanceReadiness({ ...complete, facilityLicenceVerified: false })).toBe("BLOCKED");
    expect(controlledSubstanceReadiness({ ...complete, dualReviewCompleted: false })).toBe("BLOCKED");
    expect(() => assertControlledSubstanceReady({ ...complete, prescriptionVerified: false })).toThrow(/not ready/);
  });

  it("allows dispensing only when every controlled-substance gate is ready", () => {
    expect(controlledSubstanceReadiness(complete)).toBe("READY");
    expect(assertControlledSubstanceReady(complete)).toBe(true);
  });
});

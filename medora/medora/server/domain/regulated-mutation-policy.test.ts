import { describe, expect, it } from "vitest";
import { assertRegulatedMutationReady, regulatedMutationReadiness, type RegulatedMutationContext } from "./regulated-mutation-policy";

const complete: RegulatedMutationContext = {
  branchJurisdictionAssigned: true,
  compliancePackApproved: true,
  compliancePackStale: false,
  productInvolved: true,
  catalogEvidenceVerified: true,
};

describe("regulated mutation readiness", () => {
  it("blocks missing, stale, unapproved, or evidence-incomplete mutations", () => {
    expect(regulatedMutationReadiness(null)).toBe("BLOCKED");
    expect(regulatedMutationReadiness({ ...complete, branchJurisdictionAssigned: false })).toBe("BLOCKED");
    expect(regulatedMutationReadiness({ ...complete, compliancePackStale: true })).toBe("BLOCKED");
    expect(() => assertRegulatedMutationReady({ ...complete, catalogEvidenceVerified: false })).toThrow(/not ready/);
  });

  it("allows a mutation when branch, pack, and product evidence are ready", () => {
    expect(regulatedMutationReadiness(complete)).toBe("READY");
    expect(assertRegulatedMutationReady(complete)).toBe(true);
    expect(regulatedMutationReadiness({ ...complete, productInvolved: false, catalogEvidenceVerified: false })).toBe("READY");
  });
});

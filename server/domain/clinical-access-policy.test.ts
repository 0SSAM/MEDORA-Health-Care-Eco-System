import { describe, expect, it } from "vitest";
import { assertClinicalAccessReady, clinicalAccessReadiness, type ClinicalAccessContext } from "./clinical-access-policy";

const complete: ClinicalAccessContext = {
  roleAuthorized: true,
  purposeDeclared: true,
  organizationScopeVerified: true,
  branchJurisdictionScopeVerified: true,
  consentVerifiedOrNotRequired: true,
  breakGlassAudited: true,
};

describe("clinical data access readiness", () => {
  it("blocks access when authorization, purpose, scope, consent, or break-glass audit is missing", () => {
    expect(clinicalAccessReadiness(null)).toBe("BLOCKED");
    expect(clinicalAccessReadiness({ ...complete, purposeDeclared: false })).toBe("BLOCKED");
    expect(clinicalAccessReadiness({ ...complete, consentVerifiedOrNotRequired: false })).toBe("BLOCKED");
    expect(() => assertClinicalAccessReady({ ...complete, breakGlassAudited: false })).toThrow(/not ready/);
  });

  it("allows access only when every clinical-data gate is verified", () => {
    expect(clinicalAccessReadiness(complete)).toBe("READY");
    expect(assertClinicalAccessReady(complete)).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { assertPrescriptionConsumptionReady, prescriptionConsumptionReadiness, type PrescriptionConsumptionContext } from "./prescription-consumption-policy";

const complete: PrescriptionConsumptionContext = {
  organizationId: "org-1",
  jurisdictionCode: "EG",
  branchId: "branch-1",
  catalogOrganizationId: "org-1",
  catalogJurisdictionCode: "EG",
  catalogBranchId: "branch-1",
  catalogApproved: true,
  catalogEvidenceVerified: true,
};

describe("prescription product consumption readiness", () => {
  it("blocks missing, cross-scope, unapproved, or unverified catalog links", () => {
    expect(prescriptionConsumptionReadiness(null)).toBe("BLOCKED");
    expect(prescriptionConsumptionReadiness({ ...complete, catalogJurisdictionCode: "JO" })).toBe("BLOCKED");
    expect(() => assertPrescriptionConsumptionReady({ ...complete, catalogEvidenceVerified: false })).toThrow(/not ready/);
  });

  it("allows a fully matching approved catalog link", () => {
    expect(prescriptionConsumptionReadiness(complete)).toBe("READY");
    expect(assertPrescriptionConsumptionReady(complete)).toBe(true);
  });
});

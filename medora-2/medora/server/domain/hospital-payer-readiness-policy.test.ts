import { describe, expect, it } from "vitest";
import { buildHospitalPayerReadinessPacket, type HospitalPayerReadinessInput } from "./hospital-payer-readiness-policy";

const internallyReviewedHospitalContract: HospitalPayerReadinessInput = {
  facilityType: "private_hospital",
  organizationId: 17,
  jurisdictionId: 818,
  branchId: 4,
  facilityId: 29,
  payerCode: "PAYER-LOCAL-ONLY",
  contractReference: "CONTRACT-REFERENCE-ONLY",
  contractStatus: "active",
  localContractReviewed: true,
  effectiveFrom: "2026-01-01",
  effectiveTo: "2026-12-31",
  asOfDate: "2026-08-26",
};

describe("hospital payer readiness policy", () => {
  it("fails closed with explicit missing reasons when a hospital-payer context is incomplete", () => {
    const packet = buildHospitalPayerReadinessPacket({
      facilityType: "private_hospital",
      organizationId: 17,
      jurisdictionId: 818,
      branchId: 4,
    });

    expect(packet.readinessState).toBe("blocked");
    expect(packet.externalOperationAllowed).toBe(false);
    expect(packet.externalOperationState).toBe("blocked");
    expect(packet.missingGateIds).toEqual(expect.arrayContaining(["complete_scope", "payer_contract_reference", "local_contract_review", "local_effective_window"]));
  });

  it("treats incomplete scope and unsupported facility labels as blocked rather than inferring them", () => {
    const packet = buildHospitalPayerReadinessPacket({
      ...internallyReviewedHospitalContract,
      facilityType: "primary_care",
      facilityId: 0,
    });

    expect(packet.facilityType).toBeNull();
    expect(packet.readinessState).toBe("blocked");
    expect(packet.missingGateIds).toEqual(expect.arrayContaining(["facility_context", "complete_scope"]));
  });

  it("requires an explicit coherent local window and never treats an internally complete packet as external authorization", () => {
    const expiredPacket = buildHospitalPayerReadinessPacket({
      ...internallyReviewedHospitalContract,
      asOfDate: "2027-01-01",
    });
    const packet = buildHospitalPayerReadinessPacket(internallyReviewedHospitalContract);

    expect(expiredPacket.missingGateIds).toContain("local_effective_window");
    expect(packet.readinessState).toBe("internal-preparation-ready");
    expect(packet.missingGateIds).toEqual([]);
    expect(packet.externalOperationAllowed).toBe(false);
    expect(packet.externalOperationState).toBe("blocked");
    expect(packet.limitation).toMatch(/لا تقرر هذه السياسة أهلية/);
  });
});

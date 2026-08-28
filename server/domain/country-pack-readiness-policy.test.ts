import { describe, expect, it } from "vitest";
import { buildCountryPackReadinessPacket, type CountryPackReadinessInput } from "./country-pack-readiness-policy";

const egyptPreparationInput: CountryPackReadinessInput = {
  countryCode: "EG",
  recordCountryCode: "EG",
  organizationId: 12,
  recordOrganizationId: 12,
  jurisdictionId: 818,
  recordJurisdictionId: 818,
  branchId: 4,
  recordBranchId: 4,
  packVersion: "egypt-evidence-register-v1",
  authoritySourceRegisterReference: "docs/research/egypt-country-pack-source-register-2026-08-26.md",
  effectiveFrom: "2026-08-01",
  effectiveTo: "2026-12-31",
  asOfDate: "2026-08-26",
  accountableOwnerUserId: 7,
  approvalState: "approved",
  officialContractReference: "PENDING-SCOPED-CONTRACT-REFERENCE",
  isolatedAcceptanceEvidence: true,
};

describe("country pack readiness policy", () => {
  it("fails closed with explicit reasons for missing or cross-scope country-pack evidence", () => {
    const packet = buildCountryPackReadinessPacket({
      ...egyptPreparationInput,
      recordCountryCode: "SA",
      recordBranchId: 5,
      officialContractReference: null,
    });

    expect(packet.readinessState).toBe("blocked");
    expect(packet.regulatedMutationAllowed).toBe(false);
    expect(packet.externalOperationAllowed).toBe(false);
    expect(packet.submissionAllowed).toBe(false);
    expect(packet.missingGateIds).toEqual(expect.arrayContaining([
      "supported_country_context",
      "matched_organization_scope",
      "official_contract_reference",
    ]));
  });

  it("rejects unsupported countries and stale evidence windows rather than inferring country rules", () => {
    const packet = buildCountryPackReadinessPacket({
      ...egyptPreparationInput,
      countryCode: "XX",
      recordCountryCode: "XX",
      asOfDate: "2027-01-01",
    });

    expect(packet.countryCode).toBeNull();
    expect(packet.readinessState).toBe("blocked");
    expect(packet.missingGateIds).toEqual(expect.arrayContaining([
      "supported_country_context",
      "matched_organization_scope",
      "effective_window",
    ]));
  });

  it("never authorizes operations even when the Egypt preparation packet is locally complete", () => {
    const packet = buildCountryPackReadinessPacket(egyptPreparationInput);

    expect(packet.countryCode).toBe("EG");
    expect(packet.readinessState).toBe("internal-preparation-ready");
    expect(packet.missingGateIds).toEqual([]);
    expect(packet.regulatedMutationAllowed).toBe(false);
    expect(packet.externalOperationAllowed).toBe(false);
    expect(packet.submissionAllowed).toBe(false);
    expect(packet.limitation).toMatch(/لا تقرر هذه السياسة الامتثال/);
  });
});

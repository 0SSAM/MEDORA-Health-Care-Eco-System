import { describe, expect, it } from "vitest";
import { assessConsumerReturn, assertReturnPolicyConfigured } from "./consumer-returns-policy";

const verifiedRules = {
  countryCode: "EG",
  returnWindowDays: 14,
  requireInvoiceReference: true,
  requireApprovalForRefund: true,
  allowDispensedMedicineReturn: false,
  allowRecallReturnWithoutInvoice: true,
  rulesVerified: true,
  sourceReference: "docs/egypt-returns-tax-source-notes.md",
} as const;

const baseRequest = {
  reason: "wrong_item" as const,
  daysSinceSale: 2,
  itemSealed: true,
  itemDispensed: false,
  invoiceReferencePresent: true,
  evidencePresent: true,
};

describe("consumer returns policy", () => {
  it("fails closed when jurisdiction rules are not verified", () => {
    expect(assessConsumerReturn(baseRequest, { ...verifiedRules, rulesVerified: false })).toBe("REQUIRES_AUTHORITY_REVIEW");
    expect(() => assertReturnPolicyConfigured({ ...verifiedRules, sourceReference: null })).toThrow(/not verified/);
  });

  it("blocks requests without invoice evidence when required", () => {
    expect(assessConsumerReturn({ ...baseRequest, invoiceReferencePresent: false }, verifiedRules)).toBe("BLOCKED");
    expect(assessConsumerReturn({ ...baseRequest, evidencePresent: false }, verifiedRules)).toBe("BLOCKED");
  });

  it("allows a verified recall to enter controlled review without invoice", () => {
    expect(assessConsumerReturn({ ...baseRequest, reason: "recall", invoiceReferencePresent: false }, verifiedRules)).toBe("ELIGIBLE_FOR_REVIEW");
  });

  it("routes dispensed medicine changes of mind to authority review", () => {
    expect(assessConsumerReturn({ ...baseRequest, reason: "change_of_mind", itemDispensed: true }, verifiedRules)).toBe("REQUIRES_AUTHORITY_REVIEW");
  });
});

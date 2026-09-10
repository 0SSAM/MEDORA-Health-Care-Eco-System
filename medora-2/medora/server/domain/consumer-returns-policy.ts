export type ReturnRequest = {
  reason: "defect" | "wrong_item" | "change_of_mind" | "expired_or_damaged" | "recall" | "other";
  daysSinceSale: number;
  itemSealed: boolean;
  itemDispensed: boolean;
  invoiceReferencePresent: boolean;
  evidencePresent: boolean;
};

export type ConsumerReturnsRules = {
  countryCode: string;
  returnWindowDays: number;
  requireInvoiceReference: boolean;
  requireApprovalForRefund: boolean;
  allowDispensedMedicineReturn: boolean;
  allowRecallReturnWithoutInvoice: boolean;
  rulesVerified: boolean;
  sourceReference: string | null;
};

export type ReturnDecision = "ELIGIBLE_FOR_REVIEW" | "BLOCKED" | "REQUIRES_AUTHORITY_REVIEW";

/**
 * Local policy boundary for consumer returns. It does not claim legal advice or
 * replace official Egyptian CPA/ETA rules; unverified jurisdiction rules fail closed.
 */
export function assessConsumerReturn(request: ReturnRequest, rules: ConsumerReturnsRules): ReturnDecision {
  if (!rules.rulesVerified || !rules.sourceReference || rules.returnWindowDays < 0 || !Number.isFinite(rules.returnWindowDays)) {
    return "REQUIRES_AUTHORITY_REVIEW";
  }
  if (!Number.isFinite(request.daysSinceSale) || request.daysSinceSale < 0) return "BLOCKED";
  if (rules.requireInvoiceReference && !request.invoiceReferencePresent && !(request.reason === "recall" && rules.allowRecallReturnWithoutInvoice)) return "BLOCKED";
  if (!request.evidencePresent) return "BLOCKED";
  if (request.daysSinceSale > rules.returnWindowDays && request.reason !== "defect" && request.reason !== "recall") return "BLOCKED";
  if (request.reason === "recall") return "ELIGIBLE_FOR_REVIEW";
  if (request.reason === "expired_or_damaged" || request.reason === "defect" || request.reason === "wrong_item") return "ELIGIBLE_FOR_REVIEW";
  if (request.itemDispensed && !rules.allowDispensedMedicineReturn) return "REQUIRES_AUTHORITY_REVIEW";
  if (!request.itemSealed) return "REQUIRES_AUTHORITY_REVIEW";
  return rules.requireApprovalForRefund ? "ELIGIBLE_FOR_REVIEW" : "ELIGIBLE_FOR_REVIEW";
}

export function assertReturnPolicyConfigured(rules: ConsumerReturnsRules | null) {
  if (!rules || !rules.rulesVerified || !rules.sourceReference) throw new Error("Consumer return policy is not verified for this jurisdiction");
  return true as const;
}

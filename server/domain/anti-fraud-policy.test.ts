import { describe, expect, it } from "vitest";
import { assessRiskSignals, assertSegregationOfDuties, canReviewFraudCases, nextFraudCaseStatus, validateCaseResolution } from "./anti-fraud-policy";

describe("anti-fraud policy", () => {
  it("blocks self-approval for sensitive actions", () => {
    expect(() => assertSegregationOfDuties({ action: "purchase_approval", createdByUserId: 7, approvedByUserId: 7 })).toThrow("Segregation of duties");
    expect(() => assertSegregationOfDuties({ action: "purchase_approval", createdByUserId: 7, approvedByUserId: 8 })).not.toThrow();
  });

  it("limits investigation access to review roles", () => {
    expect(canReviewFraudCases("cashier")).toBe(false);
    expect(canReviewFraudCases("auditor")).toBe(true);
  });

  it("emits explainable signals rather than accusations", () => {
    const signals = assessRiskSignals({ category: "cash", action: "discount", amount: 60, baseAmount: 100 });
    expect(signals[0]).toMatchObject({ code: "cash.discount_outlier", category: "cash", severity: "high" });
    expect(signals[0].evidence).toMatchObject({ discountRatio: 0.6 });
  });

  it("detects self-approved privilege change as critical", () => {
    expect(assessRiskSignals({ category: "access", action: "role_change", createdByUserId: 4, approvedByUserId: 4 })[0]).toMatchObject({ code: "access.self_privilege_change", severity: "critical" });
  });

  it("enforces review transitions and closure evidence", () => {
    expect(nextFraudCaseStatus("new", "under_review")).toBe("under_review");
    expect(() => nextFraudCaseStatus("resolved", "under_review")).toThrow("Invalid fraud case transition");
    expect(() => validateCaseResolution({ status: "dismissed" })).toThrow("resolution code");
    expect(() => validateCaseResolution({ status: "resolved", resolutionCode: "reconciled", resolutionNote: "Count and approvals matched" })).not.toThrow();
  });
});

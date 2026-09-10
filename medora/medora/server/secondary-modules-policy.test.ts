import { describe, expect, it } from "vitest";
import { canApplyAiRecommendation, canTransitionCrmOpportunity, canTransitionCustomerCase, redactSensitiveContext, requiresHumanReview } from "./domain/secondary-modules-policy";

describe("secondary module policy", () => {
  it("allows only valid CRM opportunity transitions", () => {
    expect(canTransitionCrmOpportunity("discovery", "qualified")).toBe(true);
    expect(canTransitionCrmOpportunity("discovery", "won")).toBe(false);
    expect(canTransitionCrmOpportunity("lost", "discovery")).toBe(true);
  });
  it("supports controlled customer case reopening into active work", () => {
    expect(canTransitionCustomerCase("new", "in_progress")).toBe(true);
    expect(canTransitionCustomerCase("closed", "in_progress")).toBe(true);
    expect(canTransitionCustomerCase("closed", "resolved")).toBe(false);
  });
  it("requires human review for sensitive recommendations", () => {
    expect(requiresHumanReview({ risk: "low", affectsMoney: false, affectsEmployment: false, affectsClinicalCare: false, affectsCustomerCommunication: false })).toBe(false);
    expect(requiresHumanReview({ risk: "low", affectsMoney: true, affectsEmployment: false, affectsClinicalCare: false, affectsCustomerCommunication: false })).toBe(true);
    expect(canApplyAiRecommendation("proposed", { risk: "low", affectsMoney: false, affectsEmployment: false, affectsClinicalCare: false, affectsCustomerCommunication: false })).toBe(false);
    expect(canApplyAiRecommendation("approved", { risk: "high", affectsMoney: true, affectsEmployment: false, affectsClinicalCare: false, affectsCustomerCommunication: false })).toBe(true);
  });
  it("keeps only explicitly allowed AI context fields", () => {
    expect(redactSensitiveContext({ branchId: 7, customerName: "hidden", aggregate: 3, phone: "hidden" }, ["branchId", "aggregate"])).toEqual({ branchId: 7, aggregate: 3 });
  });
});

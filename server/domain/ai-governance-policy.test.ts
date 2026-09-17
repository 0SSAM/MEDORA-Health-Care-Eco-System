import { describe, expect, it } from "vitest";
import { assertOperationalAiRequestSafe, buildAiGovernanceReadiness, buildWorkplaceMonitoringReadiness } from "./ai-governance-policy";

describe("AI governance policy", () => {
  it("allows only bounded operational facts with explicit human review", () => {
    expect(() => assertOperationalAiRequestSafe({
      useCase: "inventory_review",
      operationalFacts: ["12 products reached their reorder threshold this week"],
      containsProtectedData: false,
      humanReviewAcknowledged: true,
    })).not.toThrow();
  });

  it("blocks protected data and unattended use", () => {
    expect(() => assertOperationalAiRequestSafe({
      useCase: "report_narrative",
      operationalFacts: ["Patient inventory summary"],
      containsProtectedData: false,
      humanReviewAcknowledged: true,
    })).toThrow(/protected/i);
    expect(() => assertOperationalAiRequestSafe({
      useCase: "workflow_triage",
      operationalFacts: ["Seven approval tasks are overdue"],
      containsProtectedData: false,
      humanReviewAcknowledged: false,
    })).toThrow(/Human review/i);
  });

  it("keeps workplace monitoring disabled and explicitly prohibits biometric surveillance", () => {
    const ai = buildAiGovernanceReadiness(7);
    const monitoring = buildWorkplaceMonitoringReadiness(7);
    expect(ai.autonomousClinicalDecisionPermitted).toBe(false);
    expect(ai.autonomousEmploymentDecisionPermitted).toBe(false);
    expect(monitoring.state).toBe("BLOCKED");
    expect(monitoring.ingestionEnabled).toBe(false);
    expect(monitoring.prohibitedCapabilities.join(" ")).toMatch(/Facial recognition/);
  });
});

import { describe, expect, it } from "vitest";
import { canApproveWorkflow, canTransitionLead, canTransitionLeave, canTransitionProcurement, normalizedRequestNumber } from "./operations-policy";

describe("operations policy", () => {
  it("allows only auditable leave transitions", () => {
    expect(canTransitionLeave("draft", "submitted")).toBe(true);
    expect(canTransitionLeave("submitted", "approved")).toBe(true);
    expect(canTransitionLeave("approved", "rejected")).toBe(false);
  });

  it("requires review before procurement fulfilment", () => {
    expect(canTransitionProcurement("submitted", "fulfilled")).toBe(false);
    expect(canTransitionProcurement("approved", "fulfilled")).toBe(true);
  });

  it("keeps do-not-contact leads terminal", () => {
    expect(canTransitionLead("new", "do_not_contact")).toBe(true);
    expect(canTransitionLead("do_not_contact", "contacted")).toBe(false);
  });

  it("limits approvals to organizational leadership", () => {
    expect(canApproveWorkflow("operations_manager")).toBe(true);
    expect(canApproveWorkflow("staff")).toBe(false);
  });

  it("normalizes procurement identifiers consistently", () => {
    expect(normalizedRequestNumber(" pr  2026  01 ")).toBe("PR-2026-01");
  });
});

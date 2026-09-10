import { describe, expect, it } from "vitest";
import { assertPackApprovalReady, buildComplianceAuditEvent, missingVerifiedRules, transitionPackStatus } from "./compliance-lifecycle";

describe("compliance pack lifecycle", () => {
  const now = new Date("2026-08-14T00:00:00.000Z");

  it("requires verified evidence for every enabled rule", () => {
    expect(missingVerifiedRules({ tax: true, prescription: true }, [{ ruleKey: "tax", verificationStatus: "verified" }])).toEqual(["prescription"]);
    expect(() => assertPackApprovalReady({ status: "review", rules: { tax: true, prescription: true }, evidence: [{ ruleKey: "tax", verificationStatus: "verified" }, { ruleKey: "prescription", verificationStatus: "verified" }], effectiveFrom: new Date("2026-08-01"), reviewDueAt: new Date("2026-09-01"), now })).not.toThrow();
  });

  it("rejects future, stale, already-approved, and rolled-back packs", () => {
    const base = { status: "review" as const, rules: { tax: true }, evidence: [{ ruleKey: "tax", verificationStatus: "verified" as const }], reviewDueAt: new Date("2026-09-01"), now };
    expect(() => assertPackApprovalReady({ ...base, effectiveFrom: new Date("2026-09-01") })).toThrow("future");
    expect(() => assertPackApprovalReady({ ...base, effectiveFrom: new Date("2026-01-01"), reviewDueAt: new Date("2026-08-01") })).toThrow("passed");
    expect(() => assertPackApprovalReady({ ...base, status: "approved", effectiveFrom: new Date("2026-01-01") })).toThrow("status");
    expect(() => transitionPackStatus("approved", "approved")).toThrow();
    expect(transitionPackStatus("approved", "rolled_back")).toBe("rolled_back");
  });

  it("makes rollback idempotent", () => {
    expect(transitionPackStatus("rolled_back", "rolled_back")).toBe("rolled_back");
  });

  it("covers the approval lifecycle and exposes an auditable transition contract", () => {
    const evidence = [
      { ruleKey: "tax", verificationStatus: "verified" as const },
      { ruleKey: "prescription", verificationStatus: "verified" as const },
    ];
    expect(missingVerifiedRules({ tax: true, prescription: true }, evidence)).toEqual([]);
    expect(assertPackApprovalReady({ status: "review", rules: { tax: true, prescription: true }, evidence, effectiveFrom: new Date("2026-08-01"), reviewDueAt: new Date("2026-09-01"), now })).toBe(true);
    expect(transitionPackStatus("review", "approved")).toBe("approved");
    expect(transitionPackStatus("approved", "rolled_back")).toBe("rolled_back");
    expect(buildComplianceAuditEvent({ packId: 8, action: "approved", actorUserId: 21, reason: "Evidence reviewed" })).toEqual({ packId: 8, action: "approved", actorUserId: 21, reason: "Evidence reviewed" });
    expect(() => buildComplianceAuditEvent({ packId: 0, action: "approved", actorUserId: 21 })).toThrow(/Pack id/);
  });
});

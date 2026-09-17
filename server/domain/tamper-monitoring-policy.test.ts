import { describe, expect, it } from "vitest";
import { assertMonitoringReady, classifyTamperEvent, detectSecuritySignals, monitoringReadiness, type MonitoringReadiness } from "./tamper-monitoring-policy";

const base = {
  actorId: 7,
  organizationId: 2,
  branchId: 3,
  jurisdiction: "EG",
  occurredAt: 1_000_000,
  recordedAt: 1_000_000,
  outcome: "DENIED" as const,
};

const completeMonitoring: MonitoringReadiness = {
  noticeDisplayed: true,
  consentOrLegalBasisVerified: true,
  purposeLimited: true,
  retentionPolicyConfigured: true,
  roleScopedAccess: true,
  maskingConfigured: true,
  incidentReviewConfigured: true,
  adapterContractVerified: true,
  covertCaptureDisabled: true,
};

describe("tamper and monitoring policy", () => {
  it("requires identity, organization, branch, jurisdiction, and trusted timestamps", () => {
    expect(() => classifyTamperEvent({ ...base, eventType: "RECORD_UPDATE", organizationId: null })).toThrow(/Organization/);
    expect(() => classifyTamperEvent({ ...base, eventType: "RECORD_UPDATE", jurisdiction: "" })).toThrow(/Jurisdiction/);
    expect(() => classifyTamperEvent({ ...base, eventType: "RECORD_UPDATE", recordedAt: 1_000_000 + 6 * 60 * 1000 })).toThrow(/Clock drift/);
  });

  it("marks audit-chain breaks critical and destructive/scope changes for human review", () => {
    expect(classifyTamperEvent({ ...base, eventType: "AUDIT_CHAIN_BREAK" }).severity).toBe("CRITICAL");
    expect(classifyTamperEvent({ ...base, eventType: "PRIVILEGE_CHANGE" }).requiresHumanReview).toBe(true);
    expect(classifyTamperEvent({ ...base, eventType: "RECORD_DELETE" }).retentionClass).toBe("CLINICAL");
  });

  it("detects repeated authentication failures and high-volume access without inventing an incident", () => {
    const failures = Array.from({ length: 5 }, (_, index) => classifyTamperEvent({ ...base, eventType: "AUTH_FAILURE", recordedAt: 1_000_000 + index * 1_000, occurredAt: 1_000_000 + index * 1_000 }));
    expect(detectSecuritySignals(failures, 1_000_000 + 5_000).map(signal => signal.type)).toContain("REPEATED_AUTH_FAILURES");
    const access = Array.from({ length: 100 }, (_, index) => classifyTamperEvent({ ...base, eventType: "STORAGE_ACCESS", recordedAt: 1_000_000 + index, occurredAt: 1_000_000 + index, outcome: "ALLOWED" }));
    expect(detectSecuritySignals(access, 1_000_100).map(signal => signal.type)).toContain("BULK_ACCESS");
  });

  it("blocks camera/audio adapters until notice, legal basis, minimization, access, retention, review, and contract gates are ready", () => {
    expect(monitoringReadiness(null)).toBe("BLOCKED");
    expect(() => assertMonitoringReady({ ...completeMonitoring, noticeDisplayed: false })).toThrow(/not ready/);
    expect(assertMonitoringReady(completeMonitoring)).toBe(true);
  });
});

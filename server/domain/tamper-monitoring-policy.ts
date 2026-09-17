export const TAMPER_EVENT_TYPES = [
  "AUTH_FAILURE",
  "AUTH_SUCCESS",
  "PRIVILEGE_CHANGE",
  "SCOPE_CHANGE",
  "RECORD_CREATE",
  "RECORD_UPDATE",
  "RECORD_DELETE",
  "BULK_EXPORT",
  "STORAGE_ACCESS",
  "AUDIT_CHAIN_BREAK",
  "CLOCK_ANOMALY",
  "CONFIGURATION_CHANGE",
] as const;

export type TamperEventType = (typeof TAMPER_EVENT_TYPES)[number];
export type SecuritySeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type TamperEventInput = {
  eventType: TamperEventType;
  actorId: number | null;
  organizationId: number | null;
  branchId: number | null;
  jurisdiction: string | null;
  occurredAt: number;
  recordedAt: number;
  outcome: "ALLOWED" | "DENIED" | "BLOCKED";
  entityType?: string | null;
  entityId?: string | null;
  reason?: string | null;
};

export type TamperEvent = TamperEventInput & {
  severity: SecuritySeverity;
  requiresHumanReview: boolean;
  retentionClass: "SECURITY" | "CLINICAL" | "OPERATIONS";
};

function assertPositiveId(value: number | null, label: string) {
  if (value !== null && (!Number.isInteger(value) || value <= 0)) throw new Error(`${label} must be a positive integer or null`);
}

function assertTimestamp(value: number, label: string) {
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${label} must be a positive UTC timestamp`);
}

export function classifyTamperEvent(input: TamperEventInput): TamperEvent {
  if (!TAMPER_EVENT_TYPES.includes(input.eventType)) throw new Error("Unknown security event type");
  assertPositiveId(input.actorId, "Actor id");
  if (input.organizationId === null) throw new Error("Organization scope is required");
  if (input.branchId === null) throw new Error("Branch scope is required");
  assertPositiveId(input.organizationId, "Organization id");
  assertPositiveId(input.branchId, "Branch id");
  if (!input.jurisdiction?.trim()) throw new Error("Jurisdiction scope is required");
  assertTimestamp(input.occurredAt, "Occurred at");
  assertTimestamp(input.recordedAt, "Recorded at");
  if (Math.abs(input.recordedAt - input.occurredAt) > 5 * 60 * 1000) throw new Error("Clock drift exceeds security tolerance");
  if (input.entityId !== undefined && input.entityId !== null && input.entityId.length > 256) throw new Error("Entity id is too long");

  const severity: SecuritySeverity =
    input.eventType === "AUDIT_CHAIN_BREAK" ? "CRITICAL" :
    ["PRIVILEGE_CHANGE", "SCOPE_CHANGE", "RECORD_DELETE", "BULK_EXPORT", "CLOCK_ANOMALY"].includes(input.eventType) ? "HIGH" :
    input.outcome !== "ALLOWED" ? "MEDIUM" : "LOW";

  return {
    ...input,
    severity,
    requiresHumanReview: severity === "HIGH" || severity === "CRITICAL",
    retentionClass: ["STORAGE_ACCESS", "BULK_EXPORT"].includes(input.eventType) ? "SECURITY" :
      ["RECORD_CREATE", "RECORD_UPDATE", "RECORD_DELETE"].includes(input.eventType) ? "CLINICAL" : "OPERATIONS",
  };
}

export type SecuritySignal = {
  type: "REPEATED_AUTH_FAILURES" | "PRIVILEGE_CHANGE" | "SCOPE_CHANGE" | "AUDIT_CHAIN_BREAK" | "CLOCK_ANOMALY" | "BULK_ACCESS";
  severity: SecuritySeverity;
  eventCount: number;
  requiresHumanReview: true;
  reason: string;
};

export function detectSecuritySignals(events: TamperEvent[], now: number): SecuritySignal[] {
  assertTimestamp(now, "Now");
  const recent = events.filter(event => now - event.recordedAt >= 0 && now - event.recordedAt <= 10 * 60 * 1000);
  const signals: SecuritySignal[] = [];
  const deniedAuth = recent.filter(event => event.eventType === "AUTH_FAILURE" && event.outcome !== "ALLOWED");
  if (deniedAuth.length >= 5) signals.push({ type: "REPEATED_AUTH_FAILURES", severity: "HIGH", eventCount: deniedAuth.length, requiresHumanReview: true, reason: "Five or more denied authentication attempts occurred within ten minutes" });
  for (const event of recent) {
    if (event.eventType === "PRIVILEGE_CHANGE") signals.push({ type: "PRIVILEGE_CHANGE", severity: "HIGH", eventCount: 1, requiresHumanReview: true, reason: "Privilege changes require independent human review" });
    if (event.eventType === "SCOPE_CHANGE") signals.push({ type: "SCOPE_CHANGE", severity: "HIGH", eventCount: 1, requiresHumanReview: true, reason: "Organization, branch, or jurisdiction scope changed" });
    if (event.eventType === "AUDIT_CHAIN_BREAK") signals.push({ type: "AUDIT_CHAIN_BREAK", severity: "CRITICAL", eventCount: 1, requiresHumanReview: true, reason: "Audit-chain integrity failure was reported" });
    if (event.eventType === "CLOCK_ANOMALY") signals.push({ type: "CLOCK_ANOMALY", severity: "HIGH", eventCount: 1, requiresHumanReview: true, reason: "Clock anomaly requires evidence preservation and review" });
  }
  const bulk = recent.filter(event => ["BULK_EXPORT", "STORAGE_ACCESS"].includes(event.eventType));
  if (bulk.length >= 100) signals.push({ type: "BULK_ACCESS", severity: "HIGH", eventCount: bulk.length, requiresHumanReview: true, reason: "High-volume export or storage access requires review" });
  return signals;
}

export type MonitoringReadiness = {
  noticeDisplayed: boolean;
  consentOrLegalBasisVerified: boolean;
  purposeLimited: boolean;
  retentionPolicyConfigured: boolean;
  roleScopedAccess: boolean;
  maskingConfigured: boolean;
  incidentReviewConfigured: boolean;
  adapterContractVerified: boolean;
  covertCaptureDisabled: boolean;
};

export function monitoringReadiness(input: MonitoringReadiness | null) {
  if (!input) return "BLOCKED" as const;
  return Object.values(input).every(Boolean) ? "READY" as const : "BLOCKED" as const;
}

export function assertMonitoringReady(input: MonitoringReadiness | null) {
  if (monitoringReadiness(input) !== "READY") throw new Error("Camera/audio monitoring adapter is not ready");
  return true as const;
}

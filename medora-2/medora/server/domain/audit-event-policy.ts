export type AuditEventContext = {
  actorIdentityVerified: boolean;
  organizationScopeVerified: boolean;
  branchJurisdictionScopeVerified: boolean;
  eventClassificationVerified: boolean;
  utcTimestampVerified: boolean;
  tamperEvidenceConfigured: boolean;
};

export function auditEventReadiness(context: AuditEventContext | null) {
  if (!context) return "BLOCKED" as const;
  return Object.values(context).every(Boolean) ? "READY" as const : "BLOCKED" as const;
}

export function assertAuditEventReady(context: AuditEventContext | null) {
  if (auditEventReadiness(context) !== "READY") throw new Error("Audit event is not ready");
  return true as const;
}

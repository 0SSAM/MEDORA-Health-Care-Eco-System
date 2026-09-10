export type PrivacyRetentionContext = {
  legalBasis: string;
  retentionDays: number;
  rightsHandlingConfigured: boolean;
  deletionControlConfigured: boolean;
  exportControlConfigured: boolean;
  sourceUrl: string;
  effectiveFrom: Date;
  now: Date;
};

export function privacyRetentionReadiness(context: PrivacyRetentionContext | null) {
  if (!context) return "BLOCKED" as const;
  const validDates = context.effectiveFrom.getTime() <= context.now.getTime();
  const configured = Boolean(context.legalBasis.trim()) && context.retentionDays > 0 && context.rightsHandlingConfigured && context.deletionControlConfigured && context.exportControlConfigured && Boolean(context.sourceUrl.trim());
  return configured && validDates ? "READY" as const : "BLOCKED" as const;
}

export function assertPrivacyRetentionReady(context: PrivacyRetentionContext | null) {
  if (privacyRetentionReadiness(context) !== "READY") throw new Error("Privacy and retention policy is not ready for activation");
  return true as const;
}

export type CompliancePackLifecycleStatus = "draft" | "review" | "approved" | "expired" | "rolled_back";

export type LifecycleEvidence = {
  ruleKey: string | null;
  verificationStatus: "unverified" | "review" | "verified" | "rejected";
};

export function missingVerifiedRules(rules: Record<string, boolean>, evidence: LifecycleEvidence[]) {
  const verified = new Set(evidence.filter(item => item.verificationStatus === "verified" && item.ruleKey).map(item => item.ruleKey));
  return Object.entries(rules).filter(([, enabled]) => enabled).map(([key]) => key).filter(key => !verified.has(key));
}

export function assertPackApprovalReady(input: {
  status: CompliancePackLifecycleStatus;
  rules: Record<string, boolean>;
  evidence: LifecycleEvidence[];
  effectiveFrom: Date;
  reviewDueAt: Date | null;
  now?: Date;
}) {
  if (["approved", "expired", "rolled_back"].includes(input.status)) throw new Error(`Pack cannot be approved from status ${input.status}`);
  const enabledRules = Object.values(input.rules).some(Boolean);
  if (!enabledRules) throw new Error("Pack must define at least one enabled rule");
  const missing = missingVerifiedRules(input.rules, input.evidence);
  if (missing.length) throw new Error(`Verified evidence required for rules: ${missing.join(", ")}`);
  const now = input.now ?? new Date();
  if (input.effectiveFrom.getTime() > now.getTime()) throw new Error("Pack effective date is in the future");
  if (input.reviewDueAt && input.reviewDueAt.getTime() < now.getTime()) throw new Error("Pack review date has passed");
  return true as const;
}

export function transitionPackStatus(current: CompliancePackLifecycleStatus, target: "approved" | "rolled_back") {
  if (target === "approved") {
    if (["approved", "expired", "rolled_back"].includes(current)) throw new Error(`Invalid approval transition from ${current}`);
    return "approved" as const;
  }
  if (current === "rolled_back") return "rolled_back" as const;
  return "rolled_back" as const;
}


export type ComplianceAuditAction = "created" | "approved" | "activated" | "expired" | "rolled_back";

export function buildComplianceAuditEvent(input: { packId: number; action: ComplianceAuditAction; actorUserId: number; reason?: string | null }) {
  if (!Number.isInteger(input.packId) || input.packId <= 0) throw new Error("Pack id is required");
  if (!Number.isInteger(input.actorUserId) || input.actorUserId <= 0) throw new Error("Actor id is required");
  return { packId: input.packId, action: input.action, actorUserId: input.actorUserId, reason: input.reason ?? null };
}

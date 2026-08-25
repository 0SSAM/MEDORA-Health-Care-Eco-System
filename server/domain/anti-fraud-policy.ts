export type AntiFraudRole =
  | "admin"
  | "owner"
  | "org_admin"
  | "compliance_officer"
  | "operations_manager"
  | "auditor"
  | "manager"
  | "pharmacist"
  | "cashier"
  | "staff"
  | "user";

export type FraudCaseStatus = "new" | "under_review" | "contained" | "resolved" | "dismissed";
export type FraudSeverity = "low" | "medium" | "high" | "critical";

export type RiskActivity = {
  category: "cash" | "inventory" | "procurement" | "prescription" | "access" | "identity" | "data" | "other";
  subjectType?: string;
  subjectId?: string | number;
  amount?: number;
  baseAmount?: number;
  quantity?: number;
  reorderPoint?: number;
  createdByUserId?: number;
  approvedByUserId?: number;
  action?: "discount" | "void" | "return" | "inventory_adjustment" | "purchase_approval" | "role_change" | "export" | "login" | "other";
  hourUtc?: number;
  recentSameSubjectCount?: number;
};

export type RiskSignal = {
  code: string;
  category: RiskActivity["category"];
  severity: FraudSeverity;
  score: number;
  summary: string;
  evidence: Record<string, string | number>;
};

const reviewRoles: AntiFraudRole[] = ["admin", "owner", "org_admin", "compliance_officer", "auditor", "operations_manager", "manager"];
const elevatedRoles: AntiFraudRole[] = ["admin", "owner", "org_admin", "compliance_officer", "operations_manager", "manager"];

export function canReviewFraudCases(role: string): boolean {
  return reviewRoles.includes(role as AntiFraudRole);
}

export function canContainFraudCase(role: string): boolean {
  return elevatedRoles.includes(role as AntiFraudRole);
}

export function assertSegregationOfDuties(input: { action: RiskActivity["action"]; createdByUserId?: number; approvedByUserId?: number }): void {
  const separationRequired = ["purchase_approval", "inventory_adjustment", "return", "role_change"].includes(input.action ?? "");
  if (separationRequired && input.createdByUserId !== undefined && input.createdByUserId === input.approvedByUserId) {
    throw new Error("Segregation of duties violation: initiator and approver must be different users");
  }
}

export function nextFraudCaseStatus(current: FraudCaseStatus, next: FraudCaseStatus): FraudCaseStatus {
  const allowed: Record<FraudCaseStatus, FraudCaseStatus[]> = {
    new: ["under_review", "dismissed"],
    under_review: ["contained", "resolved", "dismissed"],
    contained: ["under_review", "resolved", "dismissed"],
    resolved: [],
    dismissed: [],
  };
  if (!allowed[current].includes(next)) throw new Error(`Invalid fraud case transition from ${current} to ${next}`);
  return next;
}

function severityForScore(score: number): FraudSeverity {
  if (score >= 90) return "critical";
  if (score >= 65) return "high";
  if (score >= 35) return "medium";
  return "low";
}

export function assessRiskSignals(activity: RiskActivity): RiskSignal[] {
  const signals: RiskSignal[] = [];
  const ratio = activity.baseAmount && activity.baseAmount > 0 && activity.amount !== undefined ? activity.amount / activity.baseAmount : 0;
  if (activity.action === "discount" && ratio >= 0.3) {
    const score = ratio >= 0.5 ? 85 : 55;
    signals.push({ code: "cash.discount_outlier", category: "cash", severity: severityForScore(score), score, summary: "Discount exceeds the configured review threshold; verify authorization and source promotion.", evidence: { discountRatio: Number(ratio.toFixed(4)), amount: activity.amount ?? 0, baseAmount: activity.baseAmount ?? 0 } });
  }
  if (activity.action === "void" && (activity.recentSameSubjectCount ?? 0) >= 3) {
    const score = Math.min(100, 45 + (activity.recentSameSubjectCount ?? 0) * 10);
    signals.push({ code: "cash.repeated_voids", category: "cash", severity: severityForScore(score), score, summary: "Repeated void activity requires reconciliation and human review.", evidence: { recentSameSubjectCount: activity.recentSameSubjectCount ?? 0, subjectId: String(activity.subjectId ?? "unknown") } });
  }
  if (activity.action === "inventory_adjustment" && Math.abs(activity.quantity ?? 0) >= Math.max(5, activity.reorderPoint ?? 0)) {
    const score = Math.min(100, 40 + Math.round(Math.abs(activity.quantity ?? 0)));
    signals.push({ code: "inventory.large_adjustment", category: "inventory", severity: severityForScore(score), score, summary: "Large stock adjustment requires count evidence and dual review.", evidence: { quantity: activity.quantity ?? 0, reorderPoint: activity.reorderPoint ?? 0, subjectId: String(activity.subjectId ?? "unknown") } });
  }
  if (activity.action === "purchase_approval" && activity.createdByUserId === activity.approvedByUserId && activity.createdByUserId !== undefined) {
    signals.push({ code: "procurement.self_approval", category: "procurement", severity: "high", score: 80, summary: "The request initiator and approver are the same user; approval must be rejected pending separation of duties.", evidence: { userId: activity.createdByUserId } });
  }
  if (activity.action === "role_change" && activity.createdByUserId === activity.approvedByUserId && activity.createdByUserId !== undefined) {
    signals.push({ code: "access.self_privilege_change", category: "access", severity: "critical", score: 95, summary: "Self-approved privilege change is prohibited and requires immediate access review.", evidence: { userId: activity.createdByUserId } });
  }
  if (activity.action === "export" && activity.hourUtc !== undefined && (activity.hourUtc < 5 || activity.hourUtc >= 22)) {
    signals.push({ code: "data.after_hours_export", category: "data", severity: "medium", score: 50, summary: "After-hours export requires confirmation of business purpose and data minimization.", evidence: { hourUtc: activity.hourUtc, subjectId: String(activity.subjectId ?? "unknown") } });
  }
  return signals;
}

export function validateCaseResolution(input: { status: FraudCaseStatus; resolutionCode?: string; resolutionNote?: string }): void {
  if (["resolved", "dismissed"].includes(input.status) && (!input.resolutionCode?.trim() || !input.resolutionNote?.trim())) {
    throw new Error("A resolution code and note are required to close or dismiss a case");
  }
}

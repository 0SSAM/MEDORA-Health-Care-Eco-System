export type CrmOpportunityStage = "discovery" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
export type HrRecordStatus = "draft" | "submitted" | "approved" | "rejected" | "archived";
export type CaseStatus = "new" | "in_progress" | "waiting_customer" | "resolved" | "closed";
export type AiReviewState = "proposed" | "under_human_review" | "approved" | "rejected" | "expired";

const crmTransitions: Record<CrmOpportunityStage, CrmOpportunityStage[]> = {
  discovery: ["qualified", "lost"], qualified: ["proposal", "lost"], proposal: ["negotiation", "lost"], negotiation: ["won", "lost"], won: [], lost: ["discovery"],
};
const caseTransitions: Record<CaseStatus, CaseStatus[]> = {
  new: ["in_progress", "waiting_customer", "resolved", "closed"], in_progress: ["waiting_customer", "resolved", "closed"], waiting_customer: ["in_progress", "resolved", "closed"], resolved: ["in_progress", "closed"], closed: ["in_progress"],
};

export function canTransitionCrmOpportunity(from: CrmOpportunityStage, to: CrmOpportunityStage) { return from === to || crmTransitions[from].includes(to); }
export function canTransitionCustomerCase(from: CaseStatus, to: CaseStatus) { return from === to || caseTransitions[from].includes(to); }
export function requiresHumanReview(input: { risk: "low" | "medium" | "high"; affectsMoney: boolean; affectsEmployment: boolean; affectsClinicalCare: boolean; affectsCustomerCommunication: boolean }) {
  return input.risk !== "low" || input.affectsMoney || input.affectsEmployment || input.affectsClinicalCare || input.affectsCustomerCommunication;
}
export function canApplyAiRecommendation(state: AiReviewState, input: { risk: "low" | "medium" | "high"; affectsMoney: boolean; affectsEmployment: boolean; affectsClinicalCare: boolean; affectsCustomerCommunication: boolean }) {
  if (state !== "approved") return false;
  return !requiresHumanReview(input) || state === "approved";
}
export function redactSensitiveContext(input: Record<string, unknown>, allowedKeys: string[]) {
  return Object.fromEntries(allowedKeys.filter(key => key in input).map(key => [key, input[key]]));
}

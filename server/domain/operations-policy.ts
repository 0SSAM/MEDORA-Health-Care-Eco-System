export type LeaveStatus = "draft" | "submitted" | "approved" | "rejected" | "cancelled";
export type ProcurementStatus = "draft" | "submitted" | "approved" | "rejected" | "cancelled" | "fulfilled";
export type CrmLeadStage = "new" | "contacted" | "qualified" | "converted" | "lost" | "do_not_contact";

const leaveTransitions: Record<LeaveStatus, readonly LeaveStatus[]> = {
  draft: ["submitted", "cancelled"],
  submitted: ["approved", "rejected", "cancelled"],
  approved: ["cancelled"],
  rejected: [],
  cancelled: [],
};

const procurementTransitions: Record<ProcurementStatus, readonly ProcurementStatus[]> = {
  draft: ["submitted", "cancelled"],
  submitted: ["approved", "rejected", "cancelled"],
  approved: ["fulfilled", "cancelled"],
  rejected: [],
  cancelled: [],
  fulfilled: [],
};

const leadTransitions: Record<CrmLeadStage, readonly CrmLeadStage[]> = {
  new: ["contacted", "qualified", "lost", "do_not_contact"],
  contacted: ["qualified", "lost", "do_not_contact"],
  qualified: ["converted", "lost", "do_not_contact"],
  converted: ["do_not_contact"],
  lost: ["do_not_contact"],
  do_not_contact: [],
};

export function canTransitionLeave(current: LeaveStatus, next: LeaveStatus) {
  return leaveTransitions[current].includes(next);
}

export function canTransitionProcurement(current: ProcurementStatus, next: ProcurementStatus) {
  return procurementTransitions[current].includes(next);
}

export function canTransitionLead(current: CrmLeadStage, next: CrmLeadStage) {
  return leadTransitions[current].includes(next);
}

export function canApproveWorkflow(role: string) {
  return ["admin", "owner", "org_admin", "operations_manager"].includes(role);
}

export function normalizedRequestNumber(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "-");
}

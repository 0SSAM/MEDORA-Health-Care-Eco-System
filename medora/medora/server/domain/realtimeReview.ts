export type ReviewSeverity = "info" | "warning" | "critical";
export type ReviewFinding = { code: string; severity: ReviewSeverity; message: string; requiresHumanApproval: boolean };

export function reviewTransaction(input: { module: string; hasServerConfirmation: boolean; sensitiveFieldsPresent: boolean; modelAvailable?: boolean }): { status: "PASS" | "REVIEW" | "BLOCKED"; findings: ReviewFinding[]; auditEvent: { module: string; modelStatus: "available" | "unavailable"; decision: string; createdAt: number } } {
  const findings: ReviewFinding[] = [];
  if (input.modelAvailable === false) findings.push({ code: "MODEL_UNAVAILABLE", severity: "warning", message: "النموذج غير متاح؛ تم تحويل العملية إلى مراجعة بشرية يدوية.", requiresHumanApproval: true });
  if (!input.hasServerConfirmation) findings.push({ code: "SERVER_CONFIRMATION_REQUIRED", severity: "critical", message: "لا يمكن اعتماد عملية منظمة دون تأكيد الخادم.", requiresHumanApproval: true });
  if (input.sensitiveFieldsPresent) findings.push({ code: "SENSITIVE_DATA_REVIEW", severity: "warning", message: "تحتاج الحقول الحساسة إلى مراجعة وصلاحية مناسبة.", requiresHumanApproval: true });
  const status = findings.some(f => f.severity === "critical") ? "BLOCKED" : findings.length ? "REVIEW" : "PASS";
  return { status, findings, auditEvent: { module: input.module, modelStatus: input.modelAvailable === false ? "unavailable" : "available", decision: status, createdAt: Date.now() } };
}

export function canSyncOfflineDraft(input: { idempotencyKey: string; regulated: boolean; serverOnline: boolean; approvedByHuman: boolean }): boolean {
  return Boolean(input.idempotencyKey && input.serverOnline && (!input.regulated || input.approvedByHuman));
}

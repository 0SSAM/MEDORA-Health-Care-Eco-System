export const OPERATIONAL_AI_USE_CASES = [
  "inventory_review",
  "demand_signal_summary",
  "report_narrative",
  "workflow_triage",
  "maintenance_checklist",
] as const;

export type OperationalAiUseCase = (typeof OPERATIONAL_AI_USE_CASES)[number];

export type OperationalAiRequest = {
  useCase: OperationalAiUseCase;
  operationalFacts: string[];
  containsProtectedData: boolean;
  humanReviewAcknowledged: boolean;
};

const prohibitedTerms = [
  /patient|diagnos|prescription|medical record|national id|passport|phone|email/i,
  /مريض|تشخيص|وصفة|سجل\s*طبي|رقم\s*قومي|جواز|هاتف|بريد/i,
];

export function assertOperationalAiRequestSafe(input: OperationalAiRequest) {
  if (!OPERATIONAL_AI_USE_CASES.includes(input.useCase)) throw new Error("Unsupported AI use case");
  if (input.containsProtectedData) throw new Error("Protected or personal data is not allowed in operational AI requests");
  if (!input.humanReviewAcknowledged) throw new Error("Human review acknowledgement is required");
  if (!input.operationalFacts.length || input.operationalFacts.length > 30) throw new Error("Provide between one and thirty operational facts");
  for (const fact of input.operationalFacts) {
    const normalized = fact.trim();
    if (!normalized || normalized.length > 280) throw new Error("Operational facts must be non-empty and under 280 characters");
    if (prohibitedTerms.some(pattern => pattern.test(normalized))) throw new Error("Operational facts appear to contain protected or personal information");
  }
  return true as const;
}

export type AiGovernanceReadiness = {
  organizationId: number;
  state: "GUARDED";
  providerMode: "SERVER_ONLY";
  humanReviewRequired: true;
  protectedDataPermitted: false;
  autonomousClinicalDecisionPermitted: false;
  autonomousEmploymentDecisionPermitted: false;
  autonomousRegulatorySubmissionPermitted: false;
  useCases: readonly OperationalAiUseCase[];
  requiredControls: readonly string[];
};

export function buildAiGovernanceReadiness(organizationId: number): AiGovernanceReadiness {
  if (!Number.isInteger(organizationId) || organizationId <= 0) throw new Error("Organization scope is required");
  return {
    organizationId,
    state: "GUARDED",
    providerMode: "SERVER_ONLY",
    humanReviewRequired: true,
    protectedDataPermitted: false,
    autonomousClinicalDecisionPermitted: false,
    autonomousEmploymentDecisionPermitted: false,
    autonomousRegulatorySubmissionPermitted: false,
    useCases: OPERATIONAL_AI_USE_CASES,
    requiredControls: [
      "Server-side invocation only; no browser-held model credentials",
      "Operational facts only; no patient, employee, prescription, or identity data",
      "Every result remains advisory and requires accountable human review",
      "No autonomous clinical, employment, financial, or regulatory action",
      "Minimal audit event only; prompts and model output are not written to audit logs",
    ],
  };
}

export type WorkplaceMonitoringReadinessPacket = {
  organizationId: number;
  state: "BLOCKED";
  ingestionEnabled: false;
  prohibitedCapabilities: readonly string[];
  requiredGates: readonly string[];
};

export function buildWorkplaceMonitoringReadiness(organizationId: number): WorkplaceMonitoringReadinessPacket {
  if (!Number.isInteger(organizationId) || organizationId <= 0) throw new Error("Organization scope is required");
  return {
    organizationId,
    state: "BLOCKED",
    ingestionEnabled: false,
    prohibitedCapabilities: [
      "Facial recognition or biometric identification",
      "Emotion, attention, productivity, or behavioural inference",
      "Covert recording or recording outside a documented purpose",
      "Automated worker evaluation, discipline, hiring, or termination decisions",
      "Raw camera or microphone ingestion before legal and security approval",
    ],
    requiredGates: [
      "Documented lawful basis, purpose limitation, and accountable owner",
      "Visible notice and valid consent where required by the applicable jurisdiction",
      "Data protection impact assessment, vendor agreement, and security review",
      "Minimal retention schedule, encryption, role-scoped access, and incident review",
      "Sandbox validation, human approval, and production change record",
    ],
  };
}

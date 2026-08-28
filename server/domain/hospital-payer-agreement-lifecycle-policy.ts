import {
  buildHospitalPayerReadinessPacket,
  type HospitalPayerReadinessInput,
} from "./hospital-payer-readiness-policy";
import {
  assessHospitalPayerRecordScope,
  type HospitalPayerRecordScope,
} from "./hospital-payer-record-scope-policy";

export const HOSPITAL_PAYER_AGREEMENT_LIFECYCLE_STATES = [
  "draft",
  "pending_review",
  "active",
  "suspended",
  "expired",
] as const;
export type HospitalPayerAgreementLifecycleState =
  typeof HOSPITAL_PAYER_AGREEMENT_LIFECYCLE_STATES[number];

export const HOSPITAL_PAYER_AGREEMENT_LIFECYCLE_ACTIONS = [
  "submit_for_review",
  "activate",
  "suspend",
  "expire",
] as const;
export type HospitalPayerAgreementLifecycleAction =
  typeof HOSPITAL_PAYER_AGREEMENT_LIFECYCLE_ACTIONS[number];

export interface HospitalPayerAgreementLifecycleEvidence {
  reviewReference?: string;
  reviewedAt?: string;
  rationale?: string;
}

export interface HospitalPayerAgreementLifecycleInput
  extends Omit<
    HospitalPayerReadinessInput,
    "organizationId" | "jurisdictionId" | "branchId" | "facilityId" | "contractStatus"
  > {
  requestScope?: HospitalPayerRecordScope | null;
  agreementScope?: HospitalPayerRecordScope | null;
  currentLifecycleState?: string | null;
  requestedAction?: string | null;
  lifecycleEvidence?: HospitalPayerAgreementLifecycleEvidence;
}

export interface HospitalPayerAgreementLifecycleAssessment {
  currentLifecycleState: HospitalPayerAgreementLifecycleState | null;
  requestedAction: HospitalPayerAgreementLifecycleAction | null;
  candidateLifecycleState: HospitalPayerAgreementLifecycleState | null;
  lifecycleState: "blocked" | "separate-server-review-required";
  missingGateIds: string[];
  persistenceTransitionAllowed: false;
  externalOperationAllowed: false;
  limitation: string;
}

const TRANSITIONS: Record<
  HospitalPayerAgreementLifecycleState,
  Partial<Record<HospitalPayerAgreementLifecycleAction, HospitalPayerAgreementLifecycleState>>
> = {
  draft: { submit_for_review: "pending_review" },
  pending_review: { activate: "active", suspend: "suspended" },
  active: { suspend: "suspended", expire: "expired" },
  suspended: { submit_for_review: "pending_review", expire: "expired" },
  expired: {},
};

function hasText(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function isLifecycleState(value: string | null | undefined): value is HospitalPayerAgreementLifecycleState {
  return HOSPITAL_PAYER_AGREEMENT_LIFECYCLE_STATES.includes(value as HospitalPayerAgreementLifecycleState);
}

function isLifecycleAction(value: string | null | undefined): value is HospitalPayerAgreementLifecycleAction {
  return HOSPITAL_PAYER_AGREEMENT_LIFECYCLE_ACTIONS.includes(value as HospitalPayerAgreementLifecycleAction);
}

/**
 * Evaluates whether a proposed local agreement lifecycle change contains evidence
 * that a separate future server-side implementation must review. It never loads,
 * saves, authorizes, submits, prices, or transmits data.
 */
export function assessHospitalPayerAgreementLifecycle(
  input: HospitalPayerAgreementLifecycleInput = {},
): HospitalPayerAgreementLifecycleAssessment {
  const currentLifecycleState = isLifecycleState(input.currentLifecycleState)
    ? input.currentLifecycleState
    : null;
  const requestedAction = isLifecycleAction(input.requestedAction)
    ? input.requestedAction
    : null;
  const scope = assessHospitalPayerRecordScope({
    requestScope: input.requestScope,
    recordScope: input.agreementScope,
  });
  const candidateLifecycleState = currentLifecycleState && requestedAction
    ? TRANSITIONS[currentLifecycleState][requestedAction] ?? null
    : null;
  const activeCandidateReadiness = candidateLifecycleState === "active"
    ? buildHospitalPayerReadinessPacket({
      ...input,
      organizationId: input.agreementScope?.organizationId,
      jurisdictionId: input.agreementScope?.jurisdictionId,
      branchId: input.agreementScope?.branchId,
      facilityId: input.agreementScope?.facilityId,
      contractStatus: "active",
    })
    : null;
  const missingGateIds = [
    ...scope.denialReasons.map(reason => `scope:${reason}`),
    ...(activeCandidateReadiness?.missingGateIds ?? []).map(gate => `readiness:${gate}`),
  ];

  if (!currentLifecycleState) missingGateIds.push("lifecycle:current_state");
  if (!requestedAction) missingGateIds.push("lifecycle:requested_action");
  if (currentLifecycleState && requestedAction && !candidateLifecycleState) {
    missingGateIds.push("lifecycle:transition_not_permitted");
  }
  if (!hasText(input.lifecycleEvidence?.reviewReference)) {
    missingGateIds.push("evidence:review_reference");
  }
  if (!hasText(input.lifecycleEvidence?.reviewedAt)) {
    missingGateIds.push("evidence:review_timestamp");
  }
  if (!hasText(input.lifecycleEvidence?.rationale)) {
    missingGateIds.push("evidence:rationale");
  }

  return {
    currentLifecycleState,
    requestedAction,
    candidateLifecycleState,
    lifecycleState:
      missingGateIds.length === 0
        ? "separate-server-review-required"
        : "blocked",
    missingGateIds,
    persistenceTransitionAllowed: false,
    externalOperationAllowed: false,
    limitation:
      "هذه السياسة تقيم أدلة دورة حياة اتفاق داخلي مقيد النطاق فقط؛ لا تحفظ انتقالاً ولا تمنح عقداً أو تغطية أو أهلية أو تفويضاً أو مطالبة أو سعراً أو تحصيلاً أو اتصالاً بجهة حكومية أو تأمينية.",
  };
}

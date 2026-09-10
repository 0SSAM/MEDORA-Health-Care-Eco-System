export interface ClinicAggregateReportDisclosureScope {
  organizationId?: number | null;
  jurisdictionId?: number | null;
  branchId?: number | null;
  facilityId?: number | null;
}

export const CLINIC_INTERNAL_REPORT_PURPOSES = [
  "operations_overview",
  "service_quality_review",
] as const;
export type ClinicInternalReportPurpose =
  typeof CLINIC_INTERNAL_REPORT_PURPOSES[number];

export interface ClinicAggregateReportDisclosureEvidence {
  approvedForInternalReporting?: boolean;
  reportingPolicyReference?: string;
  policyEffectiveFrom?: string;
  policyEffectiveTo?: string;
  purposeAuthorizationReference?: string;
}

export interface ClinicAggregateReportDisclosureInput {
  requestScope?: ClinicAggregateReportDisclosureScope | null;
  reportScope?: ClinicAggregateReportDisclosureScope | null;
  internalPurpose?: string | null;
  evidence?: ClinicAggregateReportDisclosureEvidence;
  asOfDate?: string | null;
  minimumSafeCount?: number | null;
  aggregateCohortCount?: number | null;
}

export interface ClinicAggregateReportDisclosureAssessment {
  internalPurpose: ClinicInternalReportPurpose | null;
  disclosureState: "blocked" | "separate-server-review-required";
  missingGateIds: string[];
  disclosureAllowed: false;
  patientLevelDisclosureAllowed: false;
  externalDeliveryAllowed: false;
  clinicalFinancialInterpretationAllowed: false;
  notificationAllowed: false;
  regulatedOperationAllowed: false;
  limitation: string;
}

const SCOPE_FIELDS = [
  "organizationId",
  "jurisdictionId",
  "branchId",
  "facilityId",
] as const;

function hasText(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function isPositiveInteger(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isNonNegativeInteger(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isInternalPurpose(value: string | null | undefined): value is ClinicInternalReportPurpose {
  return CLINIC_INTERNAL_REPORT_PURPOSES.includes(value as ClinicInternalReportPurpose);
}

function toUtcDate(value: string | null | undefined): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function collectScopeGateIds(
  requestScope: ClinicAggregateReportDisclosureScope | null | undefined,
  reportScope: ClinicAggregateReportDisclosureScope | null | undefined,
): string[] {
  const gateIds: string[] = [];

  for (const field of SCOPE_FIELDS) {
    if (!isPositiveInteger(requestScope?.[field])) {
      gateIds.push(`scope:request_${field}_missing`);
    }
    if (!isPositiveInteger(reportScope?.[field])) {
      gateIds.push(`scope:report_${field}_missing`);
    }
    if (
      isPositiveInteger(requestScope?.[field]) &&
      isPositiveInteger(reportScope?.[field]) &&
      requestScope?.[field] !== reportScope?.[field]
    ) {
      gateIds.push(`scope:${field}_mismatch`);
    }
  }

  return gateIds;
}

/**
 * Assesses the evidence that a future server-side aggregate-report path must
 * review before disclosing an internal aggregate. It never loads, derives,
 * persists, exports, transmits, or discloses a report or patient-level data.
 */
export function assessClinicAggregateReportDisclosure(
  input: ClinicAggregateReportDisclosureInput = {},
): ClinicAggregateReportDisclosureAssessment {
  const internalPurpose = isInternalPurpose(input.internalPurpose)
    ? input.internalPurpose
    : null;
  const missingGateIds = collectScopeGateIds(input.requestScope, input.reportScope);
  const asOfDate = toUtcDate(input.asOfDate);
  const policyEffectiveFrom = toUtcDate(input.evidence?.policyEffectiveFrom);
  const policyEffectiveTo = toUtcDate(input.evidence?.policyEffectiveTo);

  if (!internalPurpose) missingGateIds.push("purpose:not_authorized");
  if (!input.evidence?.approvedForInternalReporting) {
    missingGateIds.push("evidence:internal_reporting_not_approved");
  }
  if (!hasText(input.evidence?.reportingPolicyReference)) {
    missingGateIds.push("evidence:reporting_policy_reference");
  }
  if (!hasText(input.evidence?.purposeAuthorizationReference)) {
    missingGateIds.push("evidence:purpose_authorization_reference");
  }
  if (!asOfDate) missingGateIds.push("evidence:as_of_date");
  if (!policyEffectiveFrom) missingGateIds.push("evidence:policy_effective_from");
  if (!policyEffectiveTo) missingGateIds.push("evidence:policy_effective_to");
  if (policyEffectiveFrom && policyEffectiveTo && policyEffectiveFrom > policyEffectiveTo) {
    missingGateIds.push("evidence:policy_window_invalid");
  }
  if (
    asOfDate &&
    policyEffectiveFrom &&
    policyEffectiveTo &&
    (asOfDate < policyEffectiveFrom || asOfDate > policyEffectiveTo)
  ) {
    missingGateIds.push("evidence:policy_not_effective_on_as_of_date");
  }
  if (!isPositiveInteger(input.minimumSafeCount)) {
    missingGateIds.push("threshold:minimum_safe_count");
  }
  if (!isNonNegativeInteger(input.aggregateCohortCount)) {
    missingGateIds.push("threshold:aggregate_cohort_count");
  }
  if (
    isPositiveInteger(input.minimumSafeCount) &&
    isNonNegativeInteger(input.aggregateCohortCount) &&
    input.aggregateCohortCount < input.minimumSafeCount
  ) {
    missingGateIds.push("threshold:aggregate_cohort_below_minimum");
  }

  return {
    internalPurpose,
    disclosureState:
      missingGateIds.length === 0
        ? "separate-server-review-required"
        : "blocked",
    missingGateIds,
    disclosureAllowed: false,
    patientLevelDisclosureAllowed: false,
    externalDeliveryAllowed: false,
    clinicalFinancialInterpretationAllowed: false,
    notificationAllowed: false,
    regulatedOperationAllowed: false,
    limitation:
      "هذه السياسة تقيم أدلة إفصاح تجميعي داخلي مقيد النطاق فقط؛ لا تستعلم أو تحسب أو تحفظ أو تصدر تقريراً، ولا تكشف بيانات مريض أو تفسر بيانات سريرية أو مالية أو ترسل محتوى إلى جهة خارجية.",
  };
}

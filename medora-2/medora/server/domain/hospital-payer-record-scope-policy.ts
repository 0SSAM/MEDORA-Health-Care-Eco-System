export const HOSPITAL_PAYER_SCOPE_DIMENSIONS = [
  "organizationId",
  "jurisdictionId",
  "branchId",
  "facilityId",
] as const;

export type HospitalPayerScopeDimension = typeof HOSPITAL_PAYER_SCOPE_DIMENSIONS[number];

export type HospitalPayerRecordScope = Partial<Record<HospitalPayerScopeDimension, number | null>>;

export type HospitalPayerRecordScopeDenial =
  | "request_scope_incomplete"
  | "record_scope_incomplete"
  | "organization_scope_mismatch"
  | "jurisdiction_scope_mismatch"
  | "branch_scope_mismatch"
  | "facility_scope_mismatch";

type ScopeInput = {
  requestScope?: HospitalPayerRecordScope | null;
  recordScope?: HospitalPayerRecordScope | null;
};

function isPositiveInteger(value: number | null | undefined): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

function hasCompleteScope(scope: HospitalPayerRecordScope | null | undefined): scope is Record<HospitalPayerScopeDimension, number> {
  return HOSPITAL_PAYER_SCOPE_DIMENSIONS.every(dimension => isPositiveInteger(scope?.[dimension]));
}

const MISMATCH_REASON: Record<HospitalPayerScopeDimension, HospitalPayerRecordScopeDenial> = {
  organizationId: "organization_scope_mismatch",
  jurisdictionId: "jurisdiction_scope_mismatch",
  branchId: "branch_scope_mismatch",
  facilityId: "facility_scope_mismatch",
};

/**
 * Pure gate for a future server-side agreement-record read or write. It only
 * determines whether two complete internal scopes are identical; it does not
 * load, create, update, submit, price, adjudicate, or transmit anything.
 */
export function assessHospitalPayerRecordScope(input: ScopeInput = {}) {
  const denialReasons: HospitalPayerRecordScopeDenial[] = [];
  const requestScope = input.requestScope;
  const recordScope = input.recordScope;
  const requestScopeComplete = hasCompleteScope(requestScope);
  const recordScopeComplete = hasCompleteScope(recordScope);

  if (!requestScopeComplete) denialReasons.push("request_scope_incomplete");
  if (!recordScopeComplete) denialReasons.push("record_scope_incomplete");

  if (hasCompleteScope(requestScope) && hasCompleteScope(recordScope)) {
    for (const dimension of HOSPITAL_PAYER_SCOPE_DIMENSIONS) {
      if (requestScope[dimension] !== recordScope[dimension]) {
        denialReasons.push(MISMATCH_REASON[dimension]);
      }
    }
  }

  const allowedForInternalRecordHandling = denialReasons.length === 0;

  return {
    policyVersion: "hospital-payer-record-scope-v1" as const,
    activationPolicy: "fail-closed" as const,
    requestScopeComplete,
    recordScopeComplete,
    allowedForInternalRecordHandling,
    externalOperationAllowed: false as const,
    denialReasons,
    limitation: "This pure scope assessment neither authorizes an agreement nor determines coverage, eligibility, benefit, price, approval, claim, payment, tax, government/UHI participation, insurer communication, or any database/network operation.",
  };
}

export type QualityScope = {
  organizationId: number;
  branchId: number;
  jurisdictionId: number;
};

export type QualityDisposition = "release" | "hold" | "reject" | "rework";
export type QualityStatus = "draft" | "in_review" | "accepted" | "held" | "rejected" | "rework" | "released";

export type QualityInspection = {
  id: number;
  scope: QualityScope;
  status: QualityStatus;
  disposition?: QualityDisposition | null;
  inspectorUserId: number;
  approvedByUserId?: number | null;
  sampleSize: number;
  acceptedUnits: number;
  rejectedUnits: number;
};

function sameScope(a: QualityScope, b: QualityScope) {
  return a.organizationId === b.organizationId
    && a.branchId === b.branchId
    && a.jurisdictionId === b.jurisdictionId;
}

function assertCounts(inspection: QualityInspection) {
  if (!Number.isInteger(inspection.sampleSize) || inspection.sampleSize <= 0) throw new Error("QUALITY_INVALID_SAMPLE_SIZE");
  if (!Number.isInteger(inspection.acceptedUnits) || inspection.acceptedUnits < 0) throw new Error("QUALITY_INVALID_ACCEPTED_COUNT");
  if (!Number.isInteger(inspection.rejectedUnits) || inspection.rejectedUnits < 0) throw new Error("QUALITY_INVALID_REJECTED_COUNT");
  if (inspection.acceptedUnits + inspection.rejectedUnits > inspection.sampleSize) throw new Error("QUALITY_COUNTS_EXCEED_SAMPLE");
}

export function startQualityReview(inspection: QualityInspection, actorUserId: number) {
  if (inspection.inspectorUserId !== actorUserId) throw new Error("QUALITY_ACTOR_SCOPE_REJECTED");
  if (inspection.status !== "draft") throw new Error("QUALITY_REVIEW_ALREADY_STARTED");
  assertCounts(inspection);
  return { ...inspection, status: "in_review" as const };
}

export function decideQualityDisposition(
  inspection: QualityInspection,
  actorUserId: number,
  disposition: QualityDisposition,
  actorRole: "admin" | "manager" | "pharmacist" | "cashier",
) {
  if (actorRole !== "admin" && actorRole !== "manager" && actorRole !== "pharmacist") throw new Error("QUALITY_DECISION_PERMISSION_REQUIRED");
  if (inspection.inspectorUserId === actorUserId) throw new Error("QUALITY_MAKER_CHECKER_REQUIRED");
  if (inspection.status !== "in_review") throw new Error("QUALITY_REVIEW_NOT_DECIDABLE");
  assertCounts(inspection);

  if (disposition === "release" && inspection.rejectedUnits > 0) throw new Error("QUALITY_RELEASE_BLOCKED_BY_REJECTS");
  if (disposition === "reject" && inspection.rejectedUnits === 0) throw new Error("QUALITY_REJECT_REQUIRES_REJECTED_UNITS");

  const status: QualityStatus = disposition === "release"
    ? "accepted"
    : disposition === "hold"
      ? "held"
      : disposition === "reject"
        ? "rejected"
        : "rework";

  return { ...inspection, status, disposition, approvedByUserId: actorUserId };
}

export function releaseQualityHold(
  inspection: QualityInspection,
  actorUserId: number,
  scope: QualityScope,
) {
  if (!sameScope(inspection.scope, scope)) throw new Error("QUALITY_SCOPE_REJECTED");
  if (inspection.status !== "held") throw new Error("QUALITY_HOLD_NOT_RELEASABLE");
  if (!Number.isInteger(actorUserId) || actorUserId <= 0) throw new Error("QUALITY_ACTOR_REQUIRED");
  return { ...inspection, status: "released" as const, disposition: "release" as const, approvedByUserId: actorUserId };
}

export function qualityAvailabilityDelta(inspection: QualityInspection) {
  if (inspection.status === "held" || inspection.status === "rejected" || inspection.status === "rework") return 0;
  if (inspection.status === "released" || inspection.status === "accepted") return inspection.acceptedUnits;
  return 0;
}

export const qualityPolicyInternals = { sameScope, assertCounts };

import { describe, expect, it } from "vitest";
import {
  decideQualityDisposition,
  qualityAvailabilityDelta,
  releaseQualityHold,
  startQualityReview,
  type QualityInspection,
} from "./quality-policy";

const inspection: QualityInspection = {
  id: 10,
  scope: { organizationId: 1, branchId: 2, jurisdictionId: 3 },
  status: "draft",
  disposition: null,
  inspectorUserId: 11,
  approvedByUserId: null,
  sampleSize: 10,
  acceptedUnits: 10,
  rejectedUnits: 0,
};

describe("quality policy", () => {
  it("requires the inspector to own the review transition", () => {
    expect(() => startQualityReview(inspection, 99)).toThrow("QUALITY_ACTOR_SCOPE_REJECTED");
    expect(startQualityReview(inspection, 11).status).toBe("in_review");
  });

  it("enforces maker-checker separation and blocks unsafe release", () => {
    const reviewed = startQualityReview(inspection, 11);
    expect(() => decideQualityDisposition(reviewed, 11, "release", "manager"))
      .toThrow("QUALITY_MAKER_CHECKER_REQUIRED");
    expect(decideQualityDisposition(reviewed, 12, "release", "manager").status).toBe("accepted");

    const rejected: QualityInspection = { ...reviewed, acceptedUnits: 9, rejectedUnits: 1 };
    expect(() => decideQualityDisposition(rejected, 12, "release", "manager"))
      .toThrow("QUALITY_RELEASE_BLOCKED_BY_REJECTS");
    expect(decideQualityDisposition(rejected, 12, "hold", "pharmacist").status).toBe("held");
  });

  it("keeps held/rejected/rework units out of available inventory", () => {
    expect(qualityAvailabilityDelta({ ...inspection, status: "held" })).toBe(0);
    expect(qualityAvailabilityDelta({ ...inspection, status: "rejected" })).toBe(0);
    expect(qualityAvailabilityDelta({ ...inspection, status: "rework" })).toBe(0);
    expect(qualityAvailabilityDelta({ ...inspection, status: "accepted" })).toBe(10);
  });

  it("requires the same organization/branch/jurisdiction to release a hold", () => {
    const held = { ...inspection, status: "held" as const, disposition: "hold" as const };
    expect(() => releaseQualityHold(held, 12, { organizationId: 2, branchId: 2, jurisdictionId: 3 }))
      .toThrow("QUALITY_SCOPE_REJECTED");
    expect(releaseQualityHold(held, 12, held.scope).status).toBe("released");
  });
});

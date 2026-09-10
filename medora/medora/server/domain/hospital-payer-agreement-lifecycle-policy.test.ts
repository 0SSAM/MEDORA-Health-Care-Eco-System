import { describe, expect, it } from "vitest";
import {
  assessHospitalPayerAgreementLifecycle,
  type HospitalPayerAgreementLifecycleInput,
} from "./hospital-payer-agreement-lifecycle-policy";

const scopedAgreement = {
  organizationId: 42,
  jurisdictionId: 818,
  branchId: 9,
  facilityId: 71,
};

const locallyReviewedAgreement: HospitalPayerAgreementLifecycleInput = {
  facilityType: "government_hospital",
  requestScope: scopedAgreement,
  agreementScope: scopedAgreement,
  payerCode: "LOCAL-PAYER-REFERENCE",
  contractReference: "LOCAL-CONTRACT-REFERENCE",
  localContractReviewed: true,
  effectiveFrom: "2026-01-01",
  effectiveTo: "2026-12-31",
  asOfDate: "2026-08-26",
  currentLifecycleState: "pending_review",
  requestedAction: "activate",
  lifecycleEvidence: {
    reviewReference: "LOCAL-REVIEW-REFERENCE",
    reviewedAt: "2026-08-26T12:00:00Z",
    rationale: "Internal preparation evidence only",
  },
};

describe("hospital payer agreement lifecycle policy", () => {
  it("fails closed when matched scope or explicit lifecycle evidence is missing", () => {
    const assessment = assessHospitalPayerAgreementLifecycle({
      ...locallyReviewedAgreement,
      agreementScope: { ...scopedAgreement, facilityId: undefined },
      lifecycleEvidence: { reviewReference: "" },
    });

    expect(assessment.lifecycleState).toBe("blocked");
    expect(assessment.missingGateIds).toEqual(
      expect.arrayContaining([
        "scope:record_scope_incomplete",
        "readiness:complete_scope",
        "evidence:review_reference",
        "evidence:review_timestamp",
        "evidence:rationale",
      ]),
    );
    expect(assessment.persistenceTransitionAllowed).toBe(false);
    expect(assessment.externalOperationAllowed).toBe(false);
  });

  it("rejects every cross-scope context even when local lifecycle evidence is complete", () => {
    const assessment = assessHospitalPayerAgreementLifecycle({
      ...locallyReviewedAgreement,
      requestScope: { ...scopedAgreement, jurisdictionId: 999 },
    });

    expect(assessment.lifecycleState).toBe("blocked");
    expect(assessment.missingGateIds).toContain("scope:jurisdiction_scope_mismatch");
  });

  it("rejects a locally unsupported transition without inferring a next state", () => {
    const assessment = assessHospitalPayerAgreementLifecycle({
      ...locallyReviewedAgreement,
      currentLifecycleState: "draft",
      requestedAction: "activate",
    });

    expect(assessment.lifecycleState).toBe("blocked");
    expect(assessment.candidateLifecycleState).toBeNull();
    expect(assessment.missingGateIds).toContain("lifecycle:transition_not_permitted");
  });

  it("keeps a locally complete activation candidate pending separate server review", () => {
    const assessment = assessHospitalPayerAgreementLifecycle(locallyReviewedAgreement);

    expect(assessment.lifecycleState).toBe("separate-server-review-required");
    expect(assessment.candidateLifecycleState).toBe("active");
    expect(assessment.missingGateIds).toEqual([]);
    expect(assessment.persistenceTransitionAllowed).toBe(false);
    expect(assessment.externalOperationAllowed).toBe(false);
    expect(assessment.limitation).toMatch(/لا تحفظ انتقالاً/);
  });
});

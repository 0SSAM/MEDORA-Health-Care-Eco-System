import { describe, expect, it } from "vitest";
import {
  assessClinicAggregateReportDisclosure,
  type ClinicAggregateReportDisclosureInput,
} from "./clinic-aggregate-report-disclosure-policy";

const matchedScope = {
  organizationId: 42,
  jurisdictionId: 818,
  branchId: 9,
  facilityId: 71,
};

const locallyEvidencedInput: ClinicAggregateReportDisclosureInput = {
  requestScope: matchedScope,
  reportScope: matchedScope,
  internalPurpose: "operations_overview",
  evidence: {
    approvedForInternalReporting: true,
    reportingPolicyReference: "LOCAL-REPORTING-POLICY-REFERENCE",
    policyEffectiveFrom: "2026-01-01",
    policyEffectiveTo: "2026-12-31",
    purposeAuthorizationReference: "LOCAL-PURPOSE-REFERENCE",
  },
  asOfDate: "2026-08-26",
  minimumSafeCount: 10,
  aggregateCohortCount: 10,
};

describe("clinic aggregate report disclosure policy", () => {
  it("fails closed when either request or report scope is incomplete", () => {
    const assessment = assessClinicAggregateReportDisclosure({
      ...locallyEvidencedInput,
      reportScope: { ...matchedScope, facilityId: undefined },
    });

    expect(assessment.disclosureState).toBe("blocked");
    expect(assessment.missingGateIds).toContain("scope:report_facilityId_missing");
    expect(assessment.disclosureAllowed).toBe(false);
  });

  it("rejects every cross-scope context before a future report path may consider disclosure", () => {
    const assessment = assessClinicAggregateReportDisclosure({
      ...locallyEvidencedInput,
      requestScope: { ...matchedScope, jurisdictionId: 999 },
    });

    expect(assessment.disclosureState).toBe("blocked");
    expect(assessment.missingGateIds).toContain("scope:jurisdictionId_mismatch");
  });

  it("requires explicit local reporting approval and purpose evidence", () => {
    const assessment = assessClinicAggregateReportDisclosure({
      ...locallyEvidencedInput,
      internalPurpose: "external_distribution",
      evidence: { approvedForInternalReporting: false },
    });

    expect(assessment.disclosureState).toBe("blocked");
    expect(assessment.missingGateIds).toEqual(
      expect.arrayContaining([
        "purpose:not_authorized",
        "evidence:internal_reporting_not_approved",
        "evidence:reporting_policy_reference",
        "evidence:purpose_authorization_reference",
      ]),
    );
  });

  it("rejects an invalid or ineffective local policy window", () => {
    const assessment = assessClinicAggregateReportDisclosure({
      ...locallyEvidencedInput,
      evidence: {
        ...locallyEvidencedInput.evidence,
        policyEffectiveFrom: "2026-12-31",
        policyEffectiveTo: "2026-01-01",
      },
    });

    expect(assessment.disclosureState).toBe("blocked");
    expect(assessment.missingGateIds).toEqual(
      expect.arrayContaining([
        "evidence:policy_window_invalid",
        "evidence:policy_not_effective_on_as_of_date",
      ]),
    );
  });

  it("rejects an aggregate cohort below the explicitly supplied minimum-safe-count rule", () => {
    const assessment = assessClinicAggregateReportDisclosure({
      ...locallyEvidencedInput,
      aggregateCohortCount: 9,
    });

    expect(assessment.disclosureState).toBe("blocked");
    expect(assessment.missingGateIds).toContain("threshold:aggregate_cohort_below_minimum");
  });

  it("keeps a locally evidenced aggregate candidate pending separate server review", () => {
    const assessment = assessClinicAggregateReportDisclosure(locallyEvidencedInput);

    expect(assessment.disclosureState).toBe("separate-server-review-required");
    expect(assessment.missingGateIds).toEqual([]);
    expect(assessment.disclosureAllowed).toBe(false);
    expect(assessment.patientLevelDisclosureAllowed).toBe(false);
    expect(assessment.externalDeliveryAllowed).toBe(false);
    expect(assessment.clinicalFinancialInterpretationAllowed).toBe(false);
    expect(assessment.notificationAllowed).toBe(false);
    expect(assessment.regulatedOperationAllowed).toBe(false);
    expect(assessment.limitation).toMatch(/لا تستعلم أو تحسب أو تحفظ أو تصدر/);
  });
});

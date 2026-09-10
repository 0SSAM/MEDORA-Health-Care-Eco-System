import { describe, expect, it } from "vitest";
import { assessHospitalPayerRecordScope } from "./hospital-payer-record-scope-policy";

const scopedRecord = {
  organizationId: 10,
  jurisdictionId: 20,
  branchId: 30,
  facilityId: 40,
};

describe("hospital-payer record-scope policy", () => {
  it("fails closed when no request or record scope is supplied", () => {
    const result = assessHospitalPayerRecordScope();

    expect(result.allowedForInternalRecordHandling).toBe(false);
    expect(result.externalOperationAllowed).toBe(false);
    expect(result.denialReasons).toEqual(["request_scope_incomplete", "record_scope_incomplete"]);
  });

  it("fails closed when a request scope omits a branch or facility", () => {
    const result = assessHospitalPayerRecordScope({
      requestScope: { organizationId: 10, jurisdictionId: 20, branchId: 30 },
      recordScope: scopedRecord,
    });

    expect(result.allowedForInternalRecordHandling).toBe(false);
    expect(result.denialReasons).toEqual(["request_scope_incomplete"]);
  });

  it("fails closed when a persisted agreement record has incomplete scope", () => {
    const result = assessHospitalPayerRecordScope({
      requestScope: scopedRecord,
      recordScope: { ...scopedRecord, facilityId: 0 },
    });

    expect(result.allowedForInternalRecordHandling).toBe(false);
    expect(result.denialReasons).toEqual(["record_scope_incomplete"]);
  });

  it.each([
    ["organizationId", "organization_scope_mismatch"],
    ["jurisdictionId", "jurisdiction_scope_mismatch"],
    ["branchId", "branch_scope_mismatch"],
    ["facilityId", "facility_scope_mismatch"],
  ] as const)("rejects a cross-scope %s mismatch", (dimension, reason) => {
    const result = assessHospitalPayerRecordScope({
      requestScope: scopedRecord,
      recordScope: { ...scopedRecord, [dimension]: scopedRecord[dimension] + 1 },
    });

    expect(result.allowedForInternalRecordHandling).toBe(false);
    expect(result.externalOperationAllowed).toBe(false);
    expect(result.denialReasons).toEqual([reason]);
  });

  it("permits only matched complete scope for future internal record handling", () => {
    const result = assessHospitalPayerRecordScope({
      requestScope: scopedRecord,
      recordScope: { ...scopedRecord },
    });

    expect(result.allowedForInternalRecordHandling).toBe(true);
    expect(result.denialReasons).toEqual([]);
    expect(result.externalOperationAllowed).toBe(false);
    expect(result.activationPolicy).toBe("fail-closed");
  });
});

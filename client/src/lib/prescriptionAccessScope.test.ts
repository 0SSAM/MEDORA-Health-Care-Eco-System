import { describe, expect, it } from "vitest";
import { buildPrescriptionAccessInput, hasAssignedPrescriptionJurisdiction } from "./prescriptionAccessScope";

describe("buildPrescriptionAccessInput", () => {
  it("keeps the legal showcase jurisdiction ID 0 in a scoped read-only lookup", () => {
    expect(buildPrescriptionAccessInput({ branchId: "1", jurisdictionId: 0, patientId: "41" })).toEqual({
      branchId: 1,
      jurisdictionId: 0,
      patientId: 41,
      includePending: true,
    });
  });

  it("fails closed for missing, negative, or incomplete scope values", () => {
    expect(buildPrescriptionAccessInput({ branchId: "1", jurisdictionId: null, patientId: "41" })).toBeNull();
    expect(buildPrescriptionAccessInput({ branchId: "1", jurisdictionId: -1, patientId: "41" })).toBeNull();
    expect(buildPrescriptionAccessInput({ branchId: "0", jurisdictionId: 0, patientId: "41" })).toBeNull();
    expect(buildPrescriptionAccessInput({ branchId: "1", jurisdictionId: 0, patientId: "0" })).toBeNull();
  });

  it("treats zero as an assigned jurisdiction while rejecting absent or negative values", () => {
    expect(hasAssignedPrescriptionJurisdiction(0)).toBe(true);
    expect(hasAssignedPrescriptionJurisdiction(4)).toBe(true);
    expect(hasAssignedPrescriptionJurisdiction(null)).toBe(false);
    expect(hasAssignedPrescriptionJurisdiction(undefined)).toBe(false);
    expect(hasAssignedPrescriptionJurisdiction(-1)).toBe(false);
  });
});

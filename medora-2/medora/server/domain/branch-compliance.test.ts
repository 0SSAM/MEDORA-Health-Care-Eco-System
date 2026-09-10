import { describe, expect, it } from "vitest";
import { assertBranchAssignmentReady } from "./branch-compliance";

describe("branch jurisdiction assignment", () => {
  it("accepts administrator confirmation and documented manual override", () => {
    expect(assertBranchAssignmentReady({ branchId: 1, jurisdictionId: 2, locationSource: "admin_confirmed", confirmedByUserId: 9 })).toBeUndefined();
    expect(assertBranchAssignmentReady({ branchId: 1, jurisdictionId: 2, locationSource: "manual_override", confirmedByUserId: 9 })).toBeUndefined();
  });

  it("rejects missing assignments and device-only jurisdiction", () => {
    expect(() => assertBranchAssignmentReady(undefined)).toThrow("no confirmed jurisdiction");
    expect(() => assertBranchAssignmentReady({ branchId: 1, jurisdictionId: 2, locationSource: "device", confirmedByUserId: 9 })).toThrow("Device location");
  });
});

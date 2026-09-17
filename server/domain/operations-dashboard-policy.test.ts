import { describe, expect, it } from "vitest";
import { buildOperationsSnapshot, type OperationsSnapshot } from "./operations-dashboard-policy";

const scope = { organizationId: 7, branchId: 3, jurisdictionId: 9, demo: true };

describe("operations dashboard policy", () => {
  it("aggregates only the requested branch and Demo scope", () => {
    const rows: OperationsSnapshot[] = [
      { scope, branchLabel: "Demo branch", salesTotal: 100, openShiftCount: 1, stockLowCount: 2, stockOutCount: 1, pendingReceipts: 3 },
      { scope: { ...scope, branchId: 99 }, branchLabel: "Other branch", salesTotal: 9999, openShiftCount: 9, stockLowCount: 9, stockOutCount: 9, pendingReceipts: 9 },
      { scope: { ...scope, demo: false }, branchLabel: "Production branch", salesTotal: 5000, openShiftCount: 4, stockLowCount: 4, stockOutCount: 4, pendingReceipts: 4 },
    ];
    const result = buildOperationsSnapshot(rows, scope);
    expect(result.salesTotal).toBe(100);
    expect(result.openShiftCount).toBe(1);
    expect(result.pendingReceipts).toBe(3);
    expect(result.branchLabel).toBe("Demo branch");
  });

  it("returns a safe empty snapshot when no row is in scope", () => {
    const result = buildOperationsSnapshot([], scope);
    expect(result.salesTotal).toBe(0);
    expect(result.stockOutCount).toBe(0);
    expect(result.scope).toEqual(scope);
  });
});

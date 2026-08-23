export type OperationsScope = { organizationId: number; branchId: number; jurisdictionId: number; demo: boolean };
export type OperationsSnapshot = { scope: OperationsScope; branchLabel: string; salesTotal: number; openShiftCount: number; stockLowCount: number; stockOutCount: number; pendingReceipts: number };

function sameScope(a: OperationsScope, b: OperationsScope) { return a.organizationId === b.organizationId && a.branchId === b.branchId && a.jurisdictionId === b.jurisdictionId && a.demo === b.demo; }

export function buildOperationsSnapshot(rows: readonly OperationsSnapshot[], requestedScope: OperationsScope) {
  const scoped = rows.filter(row => sameScope(row.scope, requestedScope));
  return scoped.reduce((total, row) => ({
    scope: requestedScope,
    branchLabel: row.branchLabel,
    salesTotal: total.salesTotal + Math.max(0, row.salesTotal),
    openShiftCount: total.openShiftCount + Math.max(0, row.openShiftCount),
    stockLowCount: total.stockLowCount + Math.max(0, row.stockLowCount),
    stockOutCount: total.stockOutCount + Math.max(0, row.stockOutCount),
    pendingReceipts: total.pendingReceipts + Math.max(0, row.pendingReceipts),
  }), { scope: requestedScope, branchLabel: "", salesTotal: 0, openShiftCount: 0, stockLowCount: 0, stockOutCount: 0, pendingReceipts: 0 });
}

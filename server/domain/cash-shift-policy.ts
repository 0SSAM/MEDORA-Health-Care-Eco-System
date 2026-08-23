export type CashShiftStatus = "opening" | "open" | "closing" | "closed";

export type CashShift = {
  id: number;
  organizationId: number;
  branchId: number;
  openedByUserId: number;
  status: CashShiftStatus;
  openingFloat: number;
  cashSales: number;
  cashMovements: number;
  expectedCash?: number;
  actualCash?: number;
  closedByUserId?: number;
  demoOnly: boolean;
};

export function openCashShift(input: {
  organizationId: number;
  branchId: number;
  openedByUserId: number;
  openingFloat: number;
  demoOnly: boolean;
}): Omit<CashShift, "id"> {
  if (!Number.isInteger(input.organizationId) || !Number.isInteger(input.branchId) || !Number.isInteger(input.openedByUserId)) throw new Error("A valid organization, branch, and user are required");
  if (!Number.isFinite(input.openingFloat) || input.openingFloat < 0) throw new Error("Opening float must be a non-negative amount");
  return { ...input, status: "open", cashSales: 0, cashMovements: 0 };
}

export function recordCashMovement(shift: CashShift, amount: number) {
  if (shift.status !== "open") throw new Error("Cash movement requires an open shift");
  if (!Number.isFinite(amount) || amount === 0) throw new Error("Cash movement must be a non-zero amount");
  return { ...shift, cashMovements: Number((shift.cashMovements + amount).toFixed(2)) };
}

export function addCashSale(shift: CashShift, amount: number) {
  if (shift.status !== "open") throw new Error("Cash sale requires an open shift");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Cash sale must be positive");
  return { ...shift, cashSales: Number((shift.cashSales + amount).toFixed(2)) };
}

export function beginCashShiftClose(shift: CashShift, requestedByUserId: number) {
  if (shift.status !== "open") throw new Error("Only an open shift can enter closing");
  if (!Number.isInteger(requestedByUserId)) throw new Error("A valid closing user is required");
  return { ...shift, status: "closing" as const, expectedCash: Number((shift.openingFloat + shift.cashSales + shift.cashMovements).toFixed(2)) };
}

export function closeCashShift(shift: CashShift, input: { closedByUserId: number; actualCash: number; managerApproved: boolean }) {
  if (shift.status !== "closing") throw new Error("Shift must be in closing state");
  if (!Number.isInteger(input.closedByUserId) || !Number.isFinite(input.actualCash) || input.actualCash < 0) throw new Error("Valid closing data is required");
  if (input.closedByUserId === shift.openedByUserId && Math.abs((shift.expectedCash ?? 0) - input.actualCash) > 0.005 && !input.managerApproved) throw new Error("A variance requires independent manager approval");
  return { ...shift, status: "closed" as const, actualCash: Number(input.actualCash.toFixed(2)), closedByUserId: input.closedByUserId };
}

export function assertDemoShiftIsolation(shift: CashShift) {
  if (shift.demoOnly !== true) throw new Error("Demo workflow requires an explicit demo-only marker");
  return true as const;
}

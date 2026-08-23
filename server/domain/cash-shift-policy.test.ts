import { describe, expect, it } from "vitest";
import { addCashSale, assertDemoShiftIsolation, beginCashShiftClose, closeCashShift, openCashShift, recordCashMovement } from "./cash-shift-policy";

describe("cash shift policy", () => {
  it("supports opening, sales, movements, closing, and a balanced close", () => {
    let shift = { id: 1, ...openCashShift({ organizationId: 10, branchId: 20, openedByUserId: 7, openingFloat: 100, demoOnly: true }) };
    shift = addCashSale(shift, 250);
    shift = recordCashMovement(shift, -20);
    shift = beginCashShiftClose(shift, 7);
    expect(shift.expectedCash).toBe(330);
    const closed = closeCashShift(shift, { closedByUserId: 7, actualCash: 330, managerApproved: false });
    expect(closed.status).toBe("closed");
    expect(closed.actualCash).toBe(330);
  });

  it("requires independent approval for a cashier variance", () => {
    let shift = { id: 2, ...openCashShift({ organizationId: 10, branchId: 20, openedByUserId: 7, openingFloat: 100, demoOnly: true }) };
    shift = addCashSale(shift, 250);
    shift = beginCashShiftClose(shift, 7);
    expect(() => closeCashShift(shift, { closedByUserId: 7, actualCash: 300, managerApproved: false })).toThrow(/independent manager approval/);
    expect(closeCashShift(shift, { closedByUserId: 9, actualCash: 300, managerApproved: false }).status).toBe("closed");
  });

  it("does not accept mutations after closing and requires an explicit Demo marker", () => {
    let shift = { id: 3, ...openCashShift({ organizationId: 10, branchId: 20, openedByUserId: 7, openingFloat: 50, demoOnly: true }) };
    shift = beginCashShiftClose(shift, 7);
    const closed = closeCashShift(shift, { closedByUserId: 8, actualCash: 50, managerApproved: false });
    expect(() => addCashSale(closed, 10)).toThrow(/open shift/);
    expect(assertDemoShiftIsolation({ ...closed, demoOnly: true })).toBe(true);
    expect(() => assertDemoShiftIsolation({ ...closed, demoOnly: false })).toThrow(/demo-only/);
  });
});

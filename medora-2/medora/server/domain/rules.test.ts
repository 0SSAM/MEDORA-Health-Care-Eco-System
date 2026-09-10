import { describe, expect, it } from "vitest";
import { canAccessModule, enforceDiscount, getInventoryAlert, hasPermission, selectFefoBatches } from "./rules";

describe("BDF business rules", () => {
  it("enforces the MOH 7% discount cap", () => {
    expect(enforceDiscount(100, 7).allowed).toBe(true);
    expect(enforceDiscount(100, 7.01).allowed).toBe(false);
    expect(hasPermission("cashier", "pos.sell")).toBe(true);
    expect(hasPermission("cashier", "reports.read")).toBe(false);
  });

  it("enforces the module role matrix", () => {
    expect(canAccessModule("cashier", "pos")).toBe(true);
    expect(canAccessModule("cashier", "prescriptions")).toBe(false);
    expect(canAccessModule("cashier", "finance")).toBe(false);
    expect(canAccessModule("pharmacist", "prescriptions")).toBe(true);
    expect(canAccessModule("manager", "people")).toBe(true);
    expect(canAccessModule("user", "overview")).toBe(false);
  });

  it("deducts stock by earliest expiry first and spans batches when needed", () => {
    const result = selectFefoBatches([
      { id: "late", expiryDate: new Date("2027-01-01"), quantityOnHand: 10 },
      { id: "early", expiryDate: new Date("2026-06-01"), quantityOnHand: 3 },
    ], 5);
    expect(result).toEqual([
      { batchId: "early", quantity: 3 },
      { batchId: "late", quantity: 2 },
    ]);
  });

  it("flags reorder and expiry conditions deterministically", () => {
    const result = getInventoryAlert(2, 5, new Date("2026-08-30"), new Date("2026-08-14"));
    expect(result.belowReorderPoint).toBe(true);
    expect(result.expiringWithin30Days).toBe(true);
  });
});

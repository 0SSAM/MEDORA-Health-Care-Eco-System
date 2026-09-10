import { describe, expect, it } from "vitest";
import { sortAvailableStockByExpiry } from "./pos-stock-order";

describe("available POS stock ordering", () => {
  it("orders driver-returned string dates by FEFO without mutating the scoped result", () => {
    const rows = [
      { id: "late", expiryDate: "2027-01-01T00:00:00.000Z" },
      { id: "early", expiryDate: "2026-10-01T00:00:00.000Z" },
    ];

    expect(sortAvailableStockByExpiry(rows).map(row => row.id)).toEqual(["early", "late"]);
    expect(rows.map(row => row.id)).toEqual(["late", "early"]);
  });

  it("keeps invalid expiry values at the end instead of failing the POS query", () => {
    expect(sortAvailableStockByExpiry([
      { id: "invalid", expiryDate: "not-a-date" },
      { id: "valid", expiryDate: new Date("2026-10-01T00:00:00.000Z") },
    ]).map(row => row.id)).toEqual(["valid", "invalid"]);
  });
});

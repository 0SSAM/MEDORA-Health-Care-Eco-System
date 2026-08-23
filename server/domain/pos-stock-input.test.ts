import { describe, expect, it } from "vitest";
import { availableStockInputSchema } from "./pos-stock-input";

describe("available POS stock input", () => {
  it("accepts the valid zero-valued showcase jurisdiction and preserves Arabic product search", () => {
    expect(availableStockInputSchema.parse({ branchId: 1, jurisdictionId: 0, query: "  باراسيتامول  " })).toEqual({
      branchId: 1,
      jurisdictionId: 0,
      query: "باراسيتامول",
    });
  });

  it("continues to reject an invalid branch, negative jurisdiction, and oversize search", () => {
    expect(() => availableStockInputSchema.parse({ branchId: 0, jurisdictionId: 0, query: "" })).toThrow();
    expect(() => availableStockInputSchema.parse({ branchId: 1, jurisdictionId: -1, query: "" })).toThrow();
    expect(() => availableStockInputSchema.parse({ branchId: 1, jurisdictionId: 0, query: "x".repeat(121) })).toThrow();
  });
});

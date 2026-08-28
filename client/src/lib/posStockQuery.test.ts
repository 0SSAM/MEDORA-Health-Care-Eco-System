import { describe, expect, it } from "vitest";
import { hasValidPosScope, POS_STOCK_QUERY_OPTIONS } from "./posStockQuery";

describe("POS stock query scope contract", () => {
  it("accepts only the positive branch and jurisdiction identifiers required by the protected stock procedure", () => {
    expect(hasValidPosScope({ branchId: 41, jurisdictionId: 9 })).toBe(true);
    expect(hasValidPosScope({ branchId: null, jurisdictionId: 9 })).toBe(false);
    expect(hasValidPosScope({ branchId: 41, jurisdictionId: null })).toBe(false);
    expect(hasValidPosScope({ branchId: 0, jurisdictionId: 9 })).toBe(false);
    expect(hasValidPosScope({ branchId: 41, jurisdictionId: 0 })).toBe(false);
  });

  it("forces a new stock request when the POS workspace mounts after an identity change", () => {
    expect(POS_STOCK_QUERY_OPTIONS).toEqual({ retry: false, refetchOnMount: "always" });
  });
});

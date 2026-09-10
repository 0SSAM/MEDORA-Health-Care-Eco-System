import { describe, expect, it } from "vitest";
import { approveStocktake, recordStocktakeCount, startStocktake, submitStocktakeForReview } from "./stocktake-policy";

describe("stocktake policy", () => {
  it("requires complete counts and a reason for variance", () => {
    let stocktake = startStocktake({ id: 1, organizationId: 10, branchId: 20, createdByUserId: 7, productIds: [100, 101], expectedQuantities: [10, 5] });
    expect(() => recordStocktakeCount(stocktake, 100, 8)).toThrow(/variance reason/);
    stocktake = recordStocktakeCount(stocktake, 100, 8, "Damaged pack");
    stocktake = recordStocktakeCount(stocktake, 101, 5);
    expect(submitStocktakeForReview(stocktake).status).toBe("review");
  });

  it("requires independent approval within the originating operational scope", () => {
    let stocktake = startStocktake({ id: 2, organizationId: 10, branchId: 20, createdByUserId: 7, productIds: [100], expectedQuantities: [10] });
    stocktake = recordStocktakeCount(stocktake, 100, 10);
    stocktake = submitStocktakeForReview(stocktake);
    expect(() => approveStocktake(stocktake, 7)).toThrow(/independent reviewer/);
    expect(approveStocktake(stocktake, 9).status).toBe("approved");
  });

  it("rejects products outside the scoped stocktake", () => {
    const stocktake = startStocktake({ id: 3, organizationId: 10, branchId: 20, createdByUserId: 7, productIds: [100], expectedQuantities: [10] });
    expect(() => recordStocktakeCount(stocktake, 999, 1)).toThrow(/outside/);
  });
});

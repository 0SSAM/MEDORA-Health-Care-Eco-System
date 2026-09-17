import { describe, expect, it } from "vitest";
import { assertInventoryMutationReady, inventoryMutationReadiness, type InventoryMutationContext } from "./inventory-mutation-policy";

const complete: InventoryMutationContext = {
  branchJurisdictionAssigned: true,
  compliancePackApproved: true,
  compliancePackStale: false,
  batchEvidenceVerified: true,
  fefoSelected: true,
  resultingStock: 10,
};

describe("inventory mutation readiness", () => {
  it("blocks missing scope, stale compliance, batch evidence, FEFO, or negative stock", () => {
    expect(inventoryMutationReadiness(null)).toBe("BLOCKED");
    expect(inventoryMutationReadiness({ ...complete, compliancePackStale: true })).toBe("BLOCKED");
    expect(inventoryMutationReadiness({ ...complete, fefoSelected: false })).toBe("BLOCKED");
    expect(inventoryMutationReadiness({ ...complete, resultingStock: -1 })).toBe("BLOCKED");
    expect(() => assertInventoryMutationReady({ ...complete, batchEvidenceVerified: false })).toThrow(/not ready/);
  });

  it("allows an inventory mutation when all regulated gates are ready", () => {
    expect(inventoryMutationReadiness(complete)).toBe("READY");
    expect(assertInventoryMutationReady(complete)).toBe(true);
  });
});

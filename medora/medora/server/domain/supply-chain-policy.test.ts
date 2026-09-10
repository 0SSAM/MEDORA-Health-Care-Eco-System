import { describe, expect, it } from "vitest";
import { applySupplyChainEvent, canReadSupplyChain, classifySupplyChainRisk, createSupplyChainAuditAction, type SupplyChainRecord } from "./supply-chain-policy";

const record: SupplyChainRecord = { id: "PO-DEMO-1", state: "draft", scope: { organizationId: 10, branchId: 2, jurisdictionId: 1 }, supplierId: "SUP-DEMO", productId: "MED-DEMO", batchNumber: "B-2026", expiryDate: "2026-03-01T00:00:00Z", orderedQuantity: 100, receivedQuantity: 100 };

describe("supply-chain-policy", () => {
  it("enforces organization, branch, and jurisdiction scope", () => {
    expect(canReadSupplyChain({ organizationId: 10, branchId: 2, jurisdictionId: 1 }, record)).toBe(true);
    expect(canReadSupplyChain({ organizationId: 11, branchId: 2, jurisdictionId: 1 }, record)).toBe(false);
    expect(canReadSupplyChain({ organizationId: 10, branchId: 3, jurisdictionId: 1 }, record)).toBe(false);
  });
  it("allows only valid procurement state transitions", () => {
    const submitted = applySupplyChainEvent(record, "submit");
    expect(submitted.state).toBe("submitted");
    expect(() => applySupplyChainEvent(record, "receive")).toThrow("SUPPLY_CHAIN_INVALID_TRANSITION");
  });
  it("blocks receipt quantities that exceed the order", () => {
    expect(() => applySupplyChainEvent({ ...record, state: "dispatched", receivedQuantity: 101 }, "receive")).toThrow("SUPPLY_CHAIN_RECEIPT_EXCEEDS_ORDER");
  });
  it("classifies short receipts, quarantine, recall, and expiry risk", () => {
    expect(classifySupplyChainRisk({ ...record, state: "received", receivedQuantity: 90 })).toBe("short-receipt");
    expect(classifySupplyChainRisk({ ...record, state: "quarantined" })).toBe("quarantine");
    expect(classifySupplyChainRisk({ ...record, state: "recalled" })).toBe("recall");
    expect(classifySupplyChainRisk({ ...record, state: "received", expiryDate: "2026-02-01T00:00:00Z" })).toBe("expiry-risk");
  });
  it("creates namespaced audit actions", () => expect(createSupplyChainAuditAction("discrepancy")).toBe("supply_chain.discrepancy"));
});

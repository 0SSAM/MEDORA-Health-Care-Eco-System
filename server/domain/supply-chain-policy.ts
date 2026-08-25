export type SupplyChainState = "draft" | "submitted" | "approved" | "dispatched" | "received" | "quarantined" | "returned" | "recalled" | "cancelled";
export type SupplyChainEvent = "create" | "submit" | "approve" | "dispatch" | "receive" | "discrepancy" | "quarantine" | "return" | "recall" | "cancel";

export interface SupplyChainScope { organizationId: number; branchId: number | null; jurisdictionId: number | null }
export interface SupplyChainRecord { id: string; state: SupplyChainState; scope: SupplyChainScope; supplierId: string; productId: string; batchNumber: string; expiryDate: string; orderedQuantity: number; receivedQuantity: number; }

const transitions: Record<SupplyChainState, Partial<Record<SupplyChainEvent, SupplyChainState>>> = {
  draft: { submit: "submitted", cancel: "cancelled" },
  submitted: { approve: "approved", cancel: "cancelled" },
  approved: { dispatch: "dispatched", cancel: "cancelled" },
  dispatched: { receive: "received", discrepancy: "quarantined", quarantine: "quarantined" },
  received: { discrepancy: "quarantined", return: "returned", recall: "recalled" },
  quarantined: { return: "returned", recall: "recalled" },
  returned: {},
  recalled: {},
  cancelled: {},
};

export function canReadSupplyChain(scope: SupplyChainScope, record: SupplyChainRecord): boolean {
  return scope.organizationId === record.scope.organizationId && (record.scope.branchId === null || scope.branchId === record.scope.branchId) && (record.scope.jurisdictionId === null || scope.jurisdictionId === record.scope.jurisdictionId);
}

export function applySupplyChainEvent(record: SupplyChainRecord, event: SupplyChainEvent): SupplyChainRecord {
  const next = transitions[record.state][event];
  if (!next) throw new Error(`SUPPLY_CHAIN_INVALID_TRANSITION:${record.state}:${event}`);
  if (event === "receive" && record.receivedQuantity <= 0) throw new Error("SUPPLY_CHAIN_RECEIPT_QUANTITY_REQUIRED");
  if (event === "receive" && record.receivedQuantity > record.orderedQuantity) throw new Error("SUPPLY_CHAIN_RECEIPT_EXCEEDS_ORDER");
  return { ...record, state: next };
}

export function classifySupplyChainRisk(record: SupplyChainRecord, now = new Date("2026-01-01T00:00:00Z")): "normal" | "expiry-risk" | "short-receipt" | "quarantine" | "recall" {
  if (record.state === "quarantined") return "quarantine";
  if (record.state === "recalled") return "recall";
  if (record.state === "received" && record.receivedQuantity < record.orderedQuantity) return "short-receipt";
  const expiry = Date.parse(record.expiryDate);
  if (Number.isFinite(expiry) && expiry <= now.getTime() + 90 * 24 * 60 * 60 * 1000) return "expiry-risk";
  return "normal";
}

export function createSupplyChainAuditAction(event: SupplyChainEvent): string {
  return `supply_chain.${event}`;
}

export type Scope = { organizationId: number; branchId: number; jurisdictionId: number; demo: boolean };

export type PurchaseOrderStatus = "draft" | "submitted" | "approved" | "partially_received" | "received" | "cancelled";

export type PurchaseOrderLine = {
  productId: number;
  orderedUnits: number;
  receivedUnits: number;
};

export type PurchaseOrder = {
  id: number;
  scope: Scope;
  status: PurchaseOrderStatus;
  createdByUserId: number;
  approvedByUserId?: number | null;
  lines: PurchaseOrderLine[];
};

export type ReceiveInput = {
  orderId: number;
  scope: Scope;
  receivedByUserId: number;
  idempotencyKey: string;
  lines: Array<{ productId: number; units: number }>;
};

export type ReceiveResult = {
  status: "partially_received" | "received";
  inventoryDeltas: Array<{ productId: number; units: number }>;
  auditAction: "purchase_received_demo" | "purchase_received";
};

function sameScope(a: Scope, b: Scope) {
  return a.organizationId === b.organizationId && a.branchId === b.branchId && a.jurisdictionId === b.jurisdictionId && a.demo === b.demo;
}

export function submitPurchaseOrder(order: PurchaseOrder, actorUserId: number) {
  if (order.createdByUserId !== actorUserId) throw new Error("Purchase order actor is outside the order scope");
  if (order.status !== "draft") throw new Error("Only draft purchase orders can be submitted");
  if (!order.lines.length || order.lines.some(line => line.orderedUnits <= 0 || line.receivedUnits < 0 || line.receivedUnits > line.orderedUnits)) throw new Error("Purchase order lines are invalid");
  return { ...order, status: "submitted" as const };
}

export function approvePurchaseOrder(order: PurchaseOrder, actorUserId: number, actorRole: "admin" | "manager" | "user") {
  if (actorRole !== "admin" && actorRole !== "manager") throw new Error("Purchase approval permission required");
  if (order.createdByUserId === actorUserId) throw new Error("Maker-checker separation required");
  if (order.status !== "submitted") throw new Error("Only submitted purchase orders can be approved");
  return { ...order, status: "approved" as const, approvedByUserId: actorUserId };
}

export function receivePurchaseOrder(order: PurchaseOrder, input: ReceiveInput, seenIdempotencyKeys: ReadonlySet<string>): ReceiveResult {
  if (order.id !== input.orderId || !sameScope(order.scope, input.scope)) throw new Error("Purchase receiving scope rejected");
  if (!input.idempotencyKey.trim()) throw new Error("Idempotency key is required");
  if (seenIdempotencyKeys.has(input.idempotencyKey)) throw new Error("Duplicate receiving request");
  if (!["approved", "partially_received"].includes(order.status)) throw new Error("Purchase order is not receivable");
  const inventoryDeltas = input.lines.map(line => {
    if (!Number.isInteger(line.units) || line.units <= 0) throw new Error("Received units must be positive integers");
    const source = order.lines.find(candidate => candidate.productId === line.productId);
    if (!source || source.receivedUnits + line.units > source.orderedUnits) throw new Error("Received units exceed the remaining order quantity");
    return { productId: line.productId, units: line.units };
  });
  const ordered = order.lines.reduce((sum, line) => sum + line.orderedUnits, 0);
  const receivedBefore = order.lines.reduce((sum, line) => sum + line.receivedUnits, 0);
  const receivedNow = inventoryDeltas.reduce((sum, line) => sum + line.units, 0);
  return { status: receivedBefore + receivedNow === ordered ? "received" : "partially_received", inventoryDeltas, auditAction: order.scope.demo ? "purchase_received_demo" : "purchase_received" };
}

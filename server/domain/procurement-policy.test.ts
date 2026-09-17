import { describe, expect, it } from "vitest";
import { approvePurchaseOrder, receivePurchaseOrder, submitPurchaseOrder, type PurchaseOrder } from "./procurement-policy";

const demoOrder = (): PurchaseOrder => ({
  id: 41,
  scope: { organizationId: 7, branchId: 3, jurisdictionId: 9, demo: true },
  status: "draft",
  createdByUserId: 10,
  approvedByUserId: null,
  lines: [{ productId: 101, orderedUnits: 12, receivedUnits: 0 }],
});

describe("procurement policy", () => {
  it("requires a valid draft and separates maker from approver", () => {
    const submitted = submitPurchaseOrder(demoOrder(), 10);
    expect(submitted.status).toBe("submitted");
    expect(() => approvePurchaseOrder(submitted, 10, "manager")).toThrow("Maker-checker");
    expect(approvePurchaseOrder(submitted, 11, "manager").status).toBe("approved");
  });

  it("posts only bounded, scoped, idempotent receiving deltas", () => {
    const approved = approvePurchaseOrder(submitPurchaseOrder(demoOrder(), 10), 11, "manager");
    const input = { orderId: 41, scope: approved.scope, receivedByUserId: 12, idempotencyKey: "recv-41-1", lines: [{ productId: 101, units: 5 }] };
    expect(receivePurchaseOrder(approved, input, new Set()).status).toBe("partially_received");
    expect(receivePurchaseOrder(approved, input, new Set()).auditAction).toBe("purchase_received_demo");
    expect(() => receivePurchaseOrder(approved, input, new Set(["recv-41-1"]))).toThrow("Duplicate");
  });

  it("rejects cross-scope and over-receiving attempts", () => {
    const approved = approvePurchaseOrder(submitPurchaseOrder(demoOrder(), 10), 11, "admin");
    const wrongScope = { orderId: 41, scope: { ...approved.scope, branchId: 99 }, receivedByUserId: 12, idempotencyKey: "recv-41-2", lines: [{ productId: 101, units: 1 }] };
    expect(() => receivePurchaseOrder(approved, wrongScope, new Set())).toThrow("scope");
    expect(() => receivePurchaseOrder(approved, { ...wrongScope, scope: approved.scope, lines: [{ productId: 101, units: 13 }] }, new Set())).toThrow("exceed");
  });
});

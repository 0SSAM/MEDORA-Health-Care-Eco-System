import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const { getDbMock, hasCurrentNdaAcceptanceMock, recordAuthenticationEventMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  hasCurrentNdaAcceptanceMock: vi.fn(),
  recordAuthenticationEventMock: vi.fn(),
}));
vi.mock("./db", () => ({
  getDb: getDbMock,
  hasCurrentNdaAcceptance: hasCurrentNdaAcceptanceMock,
  recordAuthenticationEvent: recordAuthenticationEventMock,
}));

type TestUser = NonNullable<TrpcContext["user"]>;
const cashier: TestUser = { id: 730, openId: "manager-intelligence-cashier", email: "cashier@example.com", name: "Cashier", loginMethod: "manus", role: "cashier", createdAt: new Date(0), updatedAt: new Date(0), lastSignedIn: new Date(0) };
const admin: TestUser = { ...cashier, id: 731, openId: "manager-intelligence-admin", email: "admin@example.com", name: "Admin", role: "admin" };
const scope = { organizationId: 10, branchId: 9, jurisdictionId: 0 };

function contextFor(user: TestUser): TrpcContext {
  return { user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

function queryFor(result: unknown[]) {
  const terminal = { limit: vi.fn(async () => result), orderBy: vi.fn(() => ({ limit: vi.fn(async () => result) })) };
  const where = vi.fn(() => terminal);
  return { from: vi.fn(() => ({ where, innerJoin: vi.fn(() => ({ where })) })) };
}

describe("manager operational intelligence role acceptance", () => {
  beforeEach(() => {
    getDbMock.mockReset();
    hasCurrentNdaAcceptanceMock.mockResolvedValue(true);
    recordAuthenticationEventMock.mockResolvedValue(undefined);
  });

  it("denies a cashier before stock signals are read", async () => {
    const db = { select: vi.fn(() => queryFor([])), insert: vi.fn() };
    getDbMock.mockResolvedValue(db);
    const caller = appRouter.createCaller(contextFor(cashier));

    await expect(caller.operations.manager.inventorySignals(scope)).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("accepts the legal jurisdiction value zero for a global administrator and returns only the compact signal payload", async () => {
    const lowStock = [{ batchId: 81, productId: 19, quantityOnHand: 2, reorderPoint: 4, expiryDate: null, updatedAt: new Date("2026-08-18T10:00:00.000Z") }];
    const queued = [{ alertId: 91, alertType: "reorder", alertDate: new Date("2026-08-19T10:00:00.000Z"), batchId: 81, productId: 19, quantityOnHand: 2, reorderPoint: 4, expiryDate: null }];
    const db = {
      select: vi.fn((fields?: Record<string, unknown>) => {
        if (fields && "alertId" in fields) return queryFor(queued);
        if (fields && "quantityOnHand" in fields) return queryFor(lowStock);
        return queryFor([{ id: 1 }]);
      }),
      insert: vi.fn(),
    };
    getDbMock.mockResolvedValue(db);
    const caller = appRouter.createCaller(contextFor(admin));

    await expect(caller.operations.manager.inventorySignals(scope)).resolves.toMatchObject({
      lowStockCount: 1,
      queuedAlertCount: 1,
      signals: [expect.objectContaining({ type: "queued_alert", alertId: 91, productId: 19 }), expect.objectContaining({ type: "low_stock", batchId: 81, reorderPoint: 4 })],
    });
  });

  it("rejects a missing review rationale before opening a database transaction", async () => {
    const caller = appRouter.createCaller(contextFor(admin));
    await expect(caller.operations.manager.recordDecision({ ...scope, entityType: "inventory_batch", entityId: 81, decision: "deferred", reason: "x" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(getDbMock).not.toHaveBeenCalled();
  });
});

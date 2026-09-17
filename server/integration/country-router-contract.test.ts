import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

const { getDbMock, hasCurrentNdaAcceptanceMock, recordAuthenticationEventMock } = vi.hoisted(() => ({ getDbMock: vi.fn(), hasCurrentNdaAcceptanceMock: vi.fn().mockResolvedValue(true), recordAuthenticationEventMock: vi.fn() }));
vi.mock("../db", () => ({ getDb: getDbMock, hasCurrentNdaAcceptance: hasCurrentNdaAcceptanceMock, recordAuthenticationEvent: recordAuthenticationEventMock }));

type TestUser = NonNullable<TrpcContext["user"]>;

const user: TestUser = {
  id: 71,
  openId: "country-contract-user",
  email: "country@example.com",
  name: "Country Contract User",
  loginMethod: "manus",
  role: "cashier",
  createdAt: new Date(0),
  updatedAt: new Date(0),
  lastSignedIn: new Date(0),
};

function contextFor(): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function queuedDb(results: unknown[][]) {
  const queue = [...results];
  return {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(async () => queue.shift() ?? []),
        })),
      })),
    })),
  };
}

describe("country-scoped ERP router contracts", () => {
  beforeEach(() => getDbMock.mockReset());

  it("rejects a POS batch whose jurisdiction differs from the assigned branch", async () => {
    getDbMock.mockResolvedValue(
      queuedDb([
        [{ branchId: 9, jurisdictionId: 2, active: 1 }],
        [{ branchId: 9, active: 1 }],
        [],
      ]),
    );

    const caller = appRouter.createCaller(contextFor());
    await expect(
      caller.erp.pos.prepareSale({
        branchId: 9,
        officialPrice: 100,
        quantity: 1,
        discountAmount: 0,
        batches: [{ id: "foreign-batch", jurisdictionId: 99, expiryDate: new Date("2030-01-01"), quantityOnHand: 5 }],
      }),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });
});

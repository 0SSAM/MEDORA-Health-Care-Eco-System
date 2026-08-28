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

const cashierContext: TrpcContext = {
  user: {
    id: 72,
    openId: "cashier-hr-boundary",
    email: "cashier-hr-boundary@example.com",
    name: "Cashier HR Boundary",
    loginMethod: "manus",
    role: "cashier",
    createdAt: new Date(0),
    updatedAt: new Date(0),
    lastSignedIn: new Date(0),
  },
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

function scopedReadDb(results: unknown[][]) {
  const reads = [...results];
  const select = vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => {
        const result = reads.shift() ?? [];
        return {
          limit: vi.fn(async () => result),
          orderBy: vi.fn(() => ({ limit: vi.fn(async () => result) })),
        };
      }),
    })),
  }));
  return { select };
}

describe("operations HR role boundaries", () => {
  beforeEach(() => {
    getDbMock.mockReset();
    hasCurrentNdaAcceptanceMock.mockResolvedValue(true);
    recordAuthenticationEventMock.mockResolvedValue(undefined);
  });

  it("denies a cashier employee directory access before personal records are returned", async () => {
    const db = scopedReadDb([
      [{ id: 1 }],
      [],
      [{ id: 9 }],
      [{ id: 9 }],
      [{ id: 2 }],
      [{ id: 701, displayName: "Restricted employee" }],
    ]);
    getDbMock.mockResolvedValue(db);

    await expect(appRouter.createCaller(cashierContext).operations.people.list({
      organizationId: 10,
      branchId: 9,
      jurisdictionId: 2,
    })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("denies a cashier the commercial procurement request list before values or justifications are returned", async () => {
    const db = scopedReadDb([
      [{ id: 1 }],
      [],
      [{ id: 701, estimatedAmount: "240.00", businessJustification: "Restricted" }],
    ]);
    getDbMock.mockResolvedValue(db);

    await expect(appRouter.createCaller(cashierContext).operations.procurement.list({
      organizationId: 10,
      branchId: 9,
      jurisdictionId: 2,
    })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

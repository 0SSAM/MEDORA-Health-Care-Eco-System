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
    openId: "cashier-report-boundary",
    email: "cashier-boundary@example.com",
    name: "Cashier Boundary",
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

describe("procurement reporting role boundaries", () => {
  beforeEach(() => {
    getDbMock.mockReset();
    hasCurrentNdaAcceptanceMock.mockResolvedValue(true);
    recordAuthenticationEventMock.mockResolvedValue(undefined);
  });

  it("denies a cashier access to scoped purchase reports before financial rows are returned", async () => {
    const db = scopedReadDb([
      [{ id: 9 }],
      [{ id: 1 }],
      [{ id: 2 }],
      [],
      [{ id: 600, orderNumber: "PO-DEMO-600", totalAmount: "240.00" }],
    ]);
    getDbMock.mockResolvedValue(db);

    const caller = appRouter.createCaller(cashierContext);
    await expect(caller.procurement.reports.purchases({
      organizationId: 10,
      branchId: 9,
      jurisdictionId: 2,
      status: "all",
      sortKey: "date",
      sortDirection: "desc",
      limit: 20,
    })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

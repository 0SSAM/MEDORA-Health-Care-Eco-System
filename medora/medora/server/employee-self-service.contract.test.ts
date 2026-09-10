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

const employeeContext: TrpcContext = {
  user: {
    id: 143,
    openId: "employee-self-service",
    email: "employee-self-service@example.com",
    name: "Employee Self Service",
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

describe("employee self-service ownership boundary", () => {
  beforeEach(() => {
    getDbMock.mockReset();
    hasCurrentNdaAcceptanceMock.mockResolvedValue(true);
    recordAuthenticationEventMock.mockResolvedValue(undefined);
  });

  it("allows an active scoped employee to read only their own profile without a management role", async () => {
    getDbMock.mockResolvedValue(scopedReadDb([
      [{ id: 1 }],
      [{ id: 2 }],
      [{ id: 3 }],
      [{ id: 4 }],
      [{ id: 801, userId: 143, displayName: "Own employee profile" }],
    ]));

    await expect(appRouter.createCaller(employeeContext).operations.selfService.myProfile({
      organizationId: 10,
      branchId: 9,
      jurisdictionId: 0,
    })).resolves.toMatchObject({ id: 801, userId: 143, displayName: "Own employee profile" });
  });

  it("does not return another employee profile when the caller lacks a profile owned by their account", async () => {
    getDbMock.mockResolvedValue(scopedReadDb([
      [{ id: 1 }],
      [{ id: 2 }],
      [{ id: 3 }],
      [{ id: 4 }],
      [],
    ]));

    await expect(appRouter.createCaller(employeeContext).operations.selfService.myProfile({
      organizationId: 10,
      branchId: 9,
      jurisdictionId: 0,
    })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

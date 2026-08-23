import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

const { getDbMock, hasCurrentNdaAcceptanceMock, recordAuthenticationEventMock } = vi.hoisted(() => ({ getDbMock: vi.fn(), hasCurrentNdaAcceptanceMock: vi.fn().mockResolvedValue(true), recordAuthenticationEventMock: vi.fn() }));
vi.mock("../db", () => ({ getDb: getDbMock, hasCurrentNdaAcceptance: hasCurrentNdaAcceptanceMock, recordAuthenticationEvent: recordAuthenticationEventMock }));

type TestUser = NonNullable<TrpcContext["user"]>;

function contextFor(user: TestUser): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function dbWithRows(rows: unknown[]) {
  const terminal = {
    where: vi.fn(async () => rows),
    limit: vi.fn(async () => rows),
    orderBy: vi.fn(async () => rows),
  };
  return {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        innerJoin: vi.fn(() => terminal),
        where: terminal.where,
        limit: terminal.limit,
        orderBy: terminal.orderBy,
      })),
    })),
  };
}

const baseUser: TestUser = {
  id: 41,
  openId: "organization-contract-user",
  email: "contract@example.com",
  name: "Contract User",
  loginMethod: "manus",
  role: "user",
  createdAt: new Date(0),
  updatedAt: new Date(0),
  lastSignedIn: new Date(0),
};

describe("organizations.members protected tRPC contract", () => {
  beforeEach(() => getDbMock.mockReset());

  it("denies a non-manager member from reading an organization directory", async () => {
    getDbMock.mockResolvedValue(
      dbWithRows([{ organizationId: 10, userId: baseUser.id, active: 1, organizationRole: "staff" }]),
    );

    const caller = appRouter.createCaller(contextFor(baseUser));
    await expect(caller.organizations.members({ organizationId: 20 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows the platform administrator to read the requested directory", async () => {
    const admin: TestUser = { ...baseUser, id: 1, role: "admin" };
    const directory = [{ userId: 7, name: "Member", email: "member@example.com", organizationRole: "staff", active: 1 }];
    getDbMock.mockResolvedValue(dbWithRows(directory));

    const caller = appRouter.createCaller(contextFor(admin));
    await expect(caller.organizations.members({ organizationId: 10 })).resolves.toEqual(directory);
  });

  it("rejects an offline draft enqueue for an unauthorized branch", async () => {
    getDbMock.mockResolvedValue(dbWithRows([]));
    const caller = appRouter.createCaller(contextFor(baseUser));
    await expect(caller.erp.offlineDrafts.enqueue({
      idempotencyKey: "offline-branch-scope-1",
      module: "callCentre",
      payload: { subject: "Callback", channel: "phone", direction: "inbound", priority: "normal", branchId: 999 },
    })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

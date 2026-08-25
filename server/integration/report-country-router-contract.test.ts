import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

const { getDbMock } = vi.hoisted(() => ({ getDbMock: vi.fn() }));
vi.mock("../db", () => ({ getDb: getDbMock }));

type TestUser = NonNullable<TrpcContext["user"]>;
const user: TestUser = {
  id: 72,
  openId: "report-country-contract-user",
  email: "report-country@example.com",
  name: "Report Country Contract User",
  loginMethod: "medora",
  role: "manager",
  createdAt: new Date(0),
  updatedAt: new Date(0),
  lastSignedIn: new Date(0),
};

function databaseForOrganizationAndJurisdiction() {
  const queue: unknown[][] = [[{ organizationId: 10 }], [{ jurisdictionId: 1 }]];
  return {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        innerJoin: vi.fn(() => ({
          innerJoin: vi.fn(() => ({
            innerJoin: vi.fn(() => ({ where: vi.fn(async () => queue.shift() ?? []) })),
          })),
        })),
        where: vi.fn(async () => queue.shift() ?? []),
      })),
    })),
  };
}

describe("report country router contract", () => {
  beforeEach(() => getDbMock.mockReset());

  it("rejects a report definition read outside the user's branch jurisdictions", async () => {
    getDbMock.mockResolvedValue(databaseForOrganizationAndJurisdiction());
    const caller = appRouter.createCaller({
      user,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    });

    await expect(caller.reports.definitions({ organizationId: 10, jurisdictionId: 2 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

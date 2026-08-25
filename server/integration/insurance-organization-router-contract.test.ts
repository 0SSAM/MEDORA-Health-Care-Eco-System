import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

const { getDbMock } = vi.hoisted(() => ({ getDbMock: vi.fn() }));
vi.mock("../db", () => ({ getDb: getDbMock }));

type TestUser = NonNullable<TrpcContext["user"]>;

function contextFor(user: TestUser): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function membershipOnlyDb(rows: unknown[]) {
  const where = vi.fn(async () => rows);
  return {
    select: vi.fn(() => ({
      from: vi.fn(() => ({ where, limit: where, innerJoin: vi.fn(() => ({ where, limit: where })) })),
    })),
    insert: vi.fn(() => { throw new Error("insert must not be reached"); }),
  };
}

const member: TestUser = {
  id: 52,
  openId: "insurance-contract-user",
  email: "insurance-contract@example.com",
  name: "Insurance Contract User",
  loginMethod: "medora",
  role: "user",
  createdAt: new Date(0),
  updatedAt: new Date(0),
  lastSignedIn: new Date(0),
};

describe("insurance organization scope contract", () => {
  beforeEach(() => getDbMock.mockReset());

  it("rejects create for an organization outside the member scope before compliance lookup or insert", async () => {
    const db = membershipOnlyDb([{ organizationId: 10, userId: member.id, active: 1 }]);
    getDbMock.mockResolvedValue(db);
    const caller = appRouter.createCaller(contextFor(member));

    await expect(caller.insurance.create({
      organizationId: 20,
      jurisdictionId: 7,
      requestType: "ELIGIBILITY",
      payerCode: "PAYER-1",
      memberReference: "member-reference",
      serviceCode: "SERVICE-1",
      idempotencyKey: "insurance-contract-key-1",
    })).rejects.toMatchObject({ code: "FORBIDDEN" });

    expect(db.insert).not.toHaveBeenCalled();
  });
});

void describe;
void it;
void expect;
void beforeEach;
void vi;

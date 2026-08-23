import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

const { getDbMock, hasCurrentNdaAcceptanceMock, recordAuthenticationEventMock } = vi.hoisted(() => ({ getDbMock: vi.fn(), hasCurrentNdaAcceptanceMock: vi.fn().mockResolvedValue(true), recordAuthenticationEventMock: vi.fn() }));
vi.mock("../db", () => ({ getDb: getDbMock, hasCurrentNdaAcceptance: hasCurrentNdaAcceptanceMock, recordAuthenticationEvent: recordAuthenticationEventMock }));

type TestUser = NonNullable<TrpcContext["user"]>;

function contextFor(role: TestUser["role"]): TrpcContext {
  return {
    user: {
      id: 84,
      openId: `financial-${role}`,
      email: `${role}@example.test`,
      name: `Financial ${role}`,
      loginMethod: "internal_showcase",
      role,
      createdAt: new Date(0),
      updatedAt: new Date(0),
      lastSignedIn: new Date(0),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function accountingDb(organizationRole: string, financialRows = [{ id: 91, organizationId: 10, nameAr: "الفترة المالية" }]) {
  const select = vi.fn((fields?: Record<string, unknown>) => {
    const isRoleMembershipLookup = Boolean(fields && "organizationRole" in fields);
    const isOrganizationMembershipLookup = Boolean(fields && "organizationId" in fields);
    const rows = isRoleMembershipLookup
      ? [{ organizationId: 10, active: 1, organizationRole }]
      : isOrganizationMembershipLookup
        ? [{ organizationId: 10 }]
        : financialRows;
    return {
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(async () => rows),
          orderBy: vi.fn(() => ({ limit: vi.fn(async () => rows) })),
          then: <TResult>(resolve: (value: typeof rows) => TResult | PromiseLike<TResult>) => Promise.resolve(rows).then(resolve),
        })),
      })),
    };
  });
  return { select };
}

function zeroJurisdictionExpenseDb() {
  const selectResults = [
    [{ organizationId: 10, active: 1, organizationRole: "operations_manager" }],
    [{ organizationId: 10 }],
    [{ branchId: 3 }],
    [{ branchId: 3, active: 1 }],
    [{ jurisdictionId: 0 }],
    [
      { id: 1, isPostingAllowed: 1, active: 1 },
      { id: 2, isPostingAllowed: 1, active: 1 },
    ],
  ];
  const insertedValues: unknown[] = [];
  const select = vi.fn(() => {
    const rows = selectResults.shift() ?? [];
    return {
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(async () => rows),
          orderBy: vi.fn(() => ({ limit: vi.fn(async () => rows) })),
          then: <TResult>(resolve: (value: typeof rows) => TResult | PromiseLike<TResult>) => Promise.resolve(rows).then(resolve),
        })),
      })),
    };
  });
  const insert = vi.fn(() => ({ values: vi.fn(async (value: unknown) => { insertedValues.push(value); return [{ insertId: insertedValues.length }]; }) }));
  return { select, insert, insertedValues };
}

describe("financial organization-membership guard", () => {
  beforeEach(() => getDbMock.mockReset());

  it("allows a manager only when their active organization membership carries the financial capability", async () => {
    const db = accountingDb("operations_manager");
    getDbMock.mockResolvedValue(db);

    const caller = appRouter.createCaller(contextFor("manager"));
    await expect(caller.erp.accounting.periods({ organizationId: 10 })).resolves.toEqual([
      { id: 91, organizationId: 10, nameAr: "الفترة المالية" },
    ]);
  });

  it.each([
    ["pharmacist", "clinical_lead"],
    ["cashier", "staff"],
  ] as const)("denies %s before any financial rows are queried despite an active organization membership", async (role, organizationRole) => {
    const db = accountingDb(organizationRole);
    getDbMock.mockResolvedValue(db);

    const caller = appRouter.createCaller(contextFor(role));
    await expect(caller.erp.accounting.periods({ organizationId: 10 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(db.select).toHaveBeenCalledTimes(1);
  });

  it("keeps platform-admin access separate from organization-membership role checks", async () => {
    const db = accountingDb("staff");
    getDbMock.mockResolvedValue(db);

    const caller = appRouter.createCaller(contextFor("admin"));
    await expect(caller.erp.accounting.periods({ organizationId: 10 })).resolves.toEqual([
      { id: 91, organizationId: 10, nameAr: "الفترة المالية" },
    ]);
  });

  it("preserves legal jurisdiction 0 for an authorized financial expense entry", async () => {
    const db = zeroJurisdictionExpenseDb();
    getDbMock.mockResolvedValue(db);

    const caller = appRouter.createCaller(contextFor("manager"));
    await expect(caller.erp.accounting.createExpense({
      organizationId: 10,
      branchId: 3,
      jurisdictionId: 0,
      expenseAccountId: 1,
      paymentAccountId: 2,
      amount: 125,
      expenseDate: new Date("2026-08-20T00:00:00.000Z"),
      title: "صيانة دورية",
      justification: "صيانة دورية موثقة للأصل التشغيلي ضمن نطاق العرض.",
    })).resolves.toEqual({ expenseId: 1, status: "pending_review" });

    expect(db.insertedValues[0]).toMatchObject({ organizationId: 10, branchId: 3, jurisdictionId: 0 });
  });
});

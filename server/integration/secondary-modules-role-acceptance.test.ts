import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

const { getDbMock, hasCurrentNdaAcceptanceMock, recordAuthenticationEventMock } = vi.hoisted(() => ({ getDbMock: vi.fn(), hasCurrentNdaAcceptanceMock: vi.fn().mockResolvedValue(true), recordAuthenticationEventMock: vi.fn() }));
vi.mock("../db", () => ({ getDb: getDbMock, hasCurrentNdaAcceptance: hasCurrentNdaAcceptanceMock, recordAuthenticationEvent: recordAuthenticationEventMock }));

type TestUser = NonNullable<TrpcContext["user"]>;

const user: TestUser = {
  id: 72,
  openId: "role-acceptance-user",
  email: "role-acceptance@example.com",
  name: "Role Acceptance User",
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

function scopedDb(selectResults: unknown[][], insertResults: unknown[][] = []) {
  const reads = [...selectResults];
  const writes = [...insertResults];
  const insertedValues: unknown[] = [];

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

  const insert = vi.fn(() => ({
    values: vi.fn(async (value: unknown) => {
      insertedValues.push(value);
      return writes.shift() ?? [{ insertId: 1 }];
    }),
  }));

  return { select, insert, insertedValues };
}

function managementRoleDb() {
  let selectSequence = 0;
  const select = vi.fn((fields?: Record<string, unknown>) => {
    const sequence = ++selectSequence;
    const isManagementRoleLookup = Boolean(fields && "organizationRole" in fields);
    return {
      from: vi.fn(() => ({
        where: vi.fn(() => {
          const result = isManagementRoleLookup
            ? [{ organizationRole: "operations_manager" }]
            : sequence === 2
              ? []
              : [{ id: 1 }];
          return {
            limit: vi.fn(async () => result),
            orderBy: vi.fn(() => ({ limit: vi.fn(async () => result) })),
          };
        }),
      })),
    };
  });
  const insert = vi.fn(() => ({ values: vi.fn(async () => [{ insertId: 71 }]) }));
  return { select, insert };
}

describe("secondary-module role acceptance contracts", () => {
  beforeEach(() => getDbMock.mockReset());

  it("lets an authorized sales/CRM user create a scoped contact and writes an audit record", async () => {
    const db = scopedDb(
      [[{ id: 1 }], [{ id: 9 }], [{ id: 9 }], [{ id: 2 }], []],
      [[{ insertId: 41 }], [{ insertId: 901 }]],
    );
    getDbMock.mockResolvedValue(db);

    const caller = appRouter.createCaller(contextFor());
    await expect(caller.secondaryModules.crm.contacts({
      organizationId: 10,
      branchId: 9,
      jurisdictionId: 2,
      displayLabel: "Test customer reference",
      consentStatus: "granted",
    })).resolves.toEqual({ id: 41 });

    expect(db.insert).toHaveBeenCalledTimes(2);
    expect(db.insertedValues[0]).toMatchObject({ organizationId: 10, branchId: 9, jurisdictionId: 2, createdByUserId: 72 });
    expect(db.insertedValues[1]).toMatchObject({ organizationId: 10, branchId: 9, action: "crm_contact_created", entityType: "crm_contact", entityId: "41" });
  });

  it("denies CRM creation before any write when the active organization membership is absent", async () => {
    const db = scopedDb([[]]);
    getDbMock.mockResolvedValue(db);

    const caller = appRouter.createCaller(contextFor());
    await expect(caller.secondaryModules.crm.contacts({
      organizationId: 10,
      branchId: 9,
      jurisdictionId: 2,
      displayLabel: "Out of scope contact",
    })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("denies HR shift data to a non-management cashier even with valid organization and branch scope", async () => {
    const shifts = [{ id: 701, organizationId: 10, branchId: 9, status: "planned" }];
    const db = scopedDb([ [{ id: 1 }], [{ id: 9 }], [{ id: 9 }], [{ id: 2 }], shifts ]);
    getDbMock.mockResolvedValue(db);

    const caller = appRouter.createCaller(contextFor());
    await expect(caller.secondaryModules.hr.listShifts({
      organizationId: 10,
      branchId: 9,
      jurisdictionId: 2,
    })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("rejects customer-care feedback for a case outside the organization, branch, or jurisdiction before it can be stored", async () => {
    const db = scopedDb([[{ id: 1 }], [{ id: 9 }], [{ id: 9 }], [{ id: 2 }], []]);
    getDbMock.mockResolvedValue(db);

    const caller = appRouter.createCaller(contextFor());
    await expect(caller.secondaryModules.customerCare.satisfaction({
      organizationId: 10,
      branchId: 9,
      jurisdictionId: 2,
      caseId: 444,
      score: 5,
      comment: "No write should occur for an out-of-scope case.",
    })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("accepts an operations-manager organization membership for an HR management workflow", async () => {
    const db = managementRoleDb();
    getDbMock.mockResolvedValue(db);

    const caller = appRouter.createCaller({
      ...contextFor(),
      user: { ...user, role: "manager" },
    });

    await expect(caller.secondaryModules.hr.shifts({
      organizationId: 10,
      branchId: 9,
      jurisdictionId: 2,
      employeeProfileId: 41,
      shiftDate: new Date("2026-08-20T00:00:00.000Z"),
      startsAt: new Date("2026-08-20T08:00:00.000Z"),
      endsAt: new Date("2026-08-20T16:00:00.000Z"),
    })).resolves.toEqual({ id: 71 });

    expect(db.select).toHaveBeenCalledWith(expect.objectContaining({ organizationRole: expect.anything() }));
    expect(db.insert).toHaveBeenCalledTimes(2);
  });
});

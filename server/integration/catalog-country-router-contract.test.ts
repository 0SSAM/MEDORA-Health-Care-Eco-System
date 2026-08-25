import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

const { getDbMock } = vi.hoisted(() => ({ getDbMock: vi.fn() }));
vi.mock("../db", () => ({ getDb: getDbMock }));

type TestUser = NonNullable<TrpcContext["user"]>;

const user: TestUser = {
  id: 72,
  openId: "catalog-country-contract-user",
  email: "catalog-country@example.com",
  name: "Catalog Country Contract User",
  loginMethod: "manus",
  role: "cashier",
  createdAt: new Date(0),
  updatedAt: new Date(0),
  lastSignedIn: new Date(0),
};

function contextFor(overrides: Partial<TestUser> = {}): TrpcContext {
  return {
    user: { ...user, ...overrides },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function queuedDb(results: unknown[][]) {
  const queue = [...results];
  return {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => {
          const result = queue.shift() ?? [];
          return {
            limit: vi.fn(async () => result),
            then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(result).then(resolve),
          };
        }),
      })),
    })),
  };
}

describe("catalog country router contracts", () => {
  beforeEach(() => getDbMock.mockReset());

  it("rejects catalog search outside the user's assigned jurisdiction before reading products", async () => {
    const db = queuedDb([
      [{ id: 99, countryCode: "SA", active: 1, legalAuthorityProfile: "Saudi authority", language: "ar", defaultLocale: "ar-SA", currencyCode: "SAR", timezone: "Asia/Riyadh", taxProfile: "VAT", dateFormat: "DD/MM/YYYY", numberSystem: "arabic-indic" }],
      [{ branchId: 9 }],
      [],
    ]);
    getDbMock.mockResolvedValue(db);

    const caller = appRouter.createCaller(contextFor());
    await expect(caller.erp.catalog.search({ jurisdictionId: 99, query: "دواء" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(db.select).toHaveBeenCalledTimes(3);
  });

  it("rejects catalog creation outside the user's assigned jurisdiction before organization lookup or insert", async () => {
    const db = queuedDb([
      [{ id: 99, countryCode: "SA", active: 1, legalAuthorityProfile: "Saudi authority", language: "ar", defaultLocale: "ar-SA", currencyCode: "SAR", timezone: "Asia/Riyadh", taxProfile: "VAT", dateFormat: "DD/MM/YYYY", numberSystem: "arabic-indic" }],
      [{ branchId: 9 }],
      [],
    ]);
    getDbMock.mockResolvedValue(db);

    const caller = appRouter.createCaller(contextFor({ role: "pharmacist" }));
    await expect(caller.erp.catalog.createItem({
      jurisdictionId: 99,
      organizationId: 7,
      category: "medicine",
      sku: "SA-TEST-001",
      nameAr: "عنصر اختبار",
      sourceAuthority: "EDA",
    })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(db.select).toHaveBeenCalledTimes(3);
    expect(db.insert).toBeUndefined();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

const { getDbMock, hasCurrentNdaAcceptanceMock, recordAuthenticationEventMock } = vi.hoisted(() => ({ getDbMock: vi.fn(), hasCurrentNdaAcceptanceMock: vi.fn().mockResolvedValue(true), recordAuthenticationEventMock: vi.fn() }));
vi.mock("../db", () => ({ getDb: getDbMock, hasCurrentNdaAcceptance: hasCurrentNdaAcceptanceMock, recordAuthenticationEvent: recordAuthenticationEventMock }));

type TestUser = NonNullable<TrpcContext["user"]>;

const user: TestUser = {
  id: 72,
  openId: "catalog-sale-contract-user",
  email: "catalog-sale@example.com",
  name: "Catalog Sale Contract User",
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
  const next = () => queue.shift() ?? [];
  const chain = () => {
    const promise = Promise.resolve(next()) as Promise<unknown[]> & {
      limit: () => Promise<unknown[]>;
      orderBy: () => { limit: () => Promise<unknown[]> };
    };
    promise.limit = async () => next();
    promise.orderBy = () => ({ limit: async () => next() });
    return promise;
  };
  return {
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(chain) })) })),
    transaction: vi.fn(async () => { throw new Error("transaction must not start"); }),
  };
}

describe("commitSale catalog evidence contract", () => {
  beforeEach(() => getDbMock.mockReset());

  it("rejects an unverified catalog-linked product before opening the sale transaction", async () => {
    const db = queuedDb([
      [{ branchId: 9, jurisdictionId: 2, active: 1 }],
      [{ branchId: 9 }],
      [{ branchId: 9 }],
      [{ branchId: 9, jurisdictionId: 2, active: 1 }],
      [{ organizationId: 10 }],
      [{ id: 2, countryCode: "EG", active: 1, legalAuthorityProfile: "EDA", language: "ar", defaultLocale: "ar-EG", currencyCode: "EGP", timezone: "Africa/Cairo", taxProfile: "EG-TAX", dateFormat: "YYYY-MM-DD", numberSystem: "latn" }],
      [{ id: 50, jurisdictionId: 2, status: "approved", packVersion: "2026.1", effectiveFrom: new Date("2026-01-01"), reviewDueAt: null, rulesJson: JSON.stringify({ sale: true }), createdAt: new Date("2026-01-01") }],
      [{ id: 501, packId: 50, jurisdictionId: 2, operation: "sale", verificationStatus: "verified" }],
      [{ id: 900, organizationId: 10, jurisdictionId: 2, catalogItemId: 700 }],
      [{ id: 901, organizationId: 10, branchId: 9, jurisdictionId: 2, productId: 900, quantityOnHand: "5" }],
      [{ id: 700, organizationId: 10, jurisdictionId: 2, verificationStatus: "PENDING_REVIEW", category: "medicine" }],
    ]);
    getDbMock.mockResolvedValue(db);

    const caller = appRouter.createCaller(contextFor());
    await expect(caller.erp.pos.commitSale({
      branchId: 9,
      invoiceNumber: "INV-9001",
      paymentMethod: "cash",
      discountAmount: 0,
      items: [{ productId: 900, batchId: 901, quantity: 1, unit: "box", unitPrice: 100 }],
    })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it("rejects a catalog-linked product from another jurisdiction before opening the sale transaction", async () => {
    const db = queuedDb([
      [{ branchId: 9, jurisdictionId: 2, active: 1 }],
      [{ branchId: 9 }],
      [{ branchId: 9 }],
      [{ branchId: 9, jurisdictionId: 2, active: 1 }],
      [{ organizationId: 10 }],
      [{ id: 2, countryCode: "EG", active: 1, legalAuthorityProfile: "EDA", language: "ar", defaultLocale: "ar-EG", currencyCode: "EGP", timezone: "Africa/Cairo", taxProfile: "EG-TAX", dateFormat: "YYYY-MM-DD", numberSystem: "latn" }],
      [{ id: 50, jurisdictionId: 2, status: "approved", packVersion: "2026.1", effectiveFrom: new Date("2026-01-01"), reviewDueAt: null, rulesJson: JSON.stringify({ sale: true }), createdAt: new Date("2026-01-01") }],
      [{ id: 501, packId: 50, jurisdictionId: 2, operation: "sale", verificationStatus: "verified" }],
      [{ id: 900, organizationId: 10, jurisdictionId: 2, catalogItemId: 700 }],
      [{ id: 901, organizationId: 10, branchId: 9, jurisdictionId: 2, productId: 900, quantityOnHand: "5" }],
      [{ id: 700, organizationId: 10, jurisdictionId: 99, verificationStatus: "VERIFIED", category: "medicine" }],
    ]);
    getDbMock.mockResolvedValue(db);

    const caller = appRouter.createCaller(contextFor());
    await expect(caller.erp.pos.commitSale({
      branchId: 9,
      invoiceNumber: "INV-9002",
      paymentMethod: "cash",
      discountAmount: 0,
      items: [{ productId: 900, batchId: 901, quantity: 1, unit: "box", unitPrice: 100 }],
    })).rejects.toBeDefined();
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it("rejects a verified catalog item when required catalog evidence is missing", async () => {
    const db = queuedDb([
      [{ branchId: 9, jurisdictionId: 2, active: 1 }],
      [{ branchId: 9 }],
      [{ branchId: 9 }],
      [{ branchId: 9, jurisdictionId: 2, active: 1 }],
      [{ organizationId: 10 }],
      [{ id: 2, countryCode: "EG", active: 1, legalAuthorityProfile: "EDA", language: "ar", defaultLocale: "ar-EG", currencyCode: "EGP", timezone: "Africa/Cairo", taxProfile: "EG-TAX", dateFormat: "YYYY-MM-DD", numberSystem: "latn" }],
      [{ id: 50, jurisdictionId: 2, status: "approved", packVersion: "2026.1", effectiveFrom: new Date("2026-01-01"), reviewDueAt: null, rulesJson: JSON.stringify({ sale: true }), createdAt: new Date("2026-01-01") }],
      [{ id: 501, packId: 50, jurisdictionId: 2, operation: "sale", verificationStatus: "verified" }],
      [{ id: 900, organizationId: 10, jurisdictionId: 2, catalogItemId: 700 }],
      [{ id: 901, organizationId: 10, branchId: 9, jurisdictionId: 2, productId: 900, quantityOnHand: "5" }],
      [{ id: 700, organizationId: 10, jurisdictionId: 2, verificationStatus: "VERIFIED", category: "medicine" }],
      [],
    ]);
    getDbMock.mockResolvedValue(db);

    const caller = appRouter.createCaller(contextFor());
    await expect(caller.erp.pos.commitSale({
      branchId: 9,
      invoiceNumber: "INV-9003",
      paymentMethod: "cash",
      discountAmount: 0,
      items: [{ productId: 900, batchId: 901, quantity: 1, unit: "box", unitPrice: 100 }],
    })).rejects.toBeDefined();
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it("commits a sale when catalog verification and required evidence are valid", async () => {
    const queue = [
      [],
      [{ branchId: 9, jurisdictionId: 2, active: 1 }],
      [{ branchId: 9 }],
      [{ branchId: 9 }],
      [],
      [{ branchId: 9, jurisdictionId: 2, active: 1 }],
      [],
      [{ organizationId: 10 }],
      [],
      [{ environment: "production" }],
      [],
      [{ id: 2, countryCode: "EG", active: 1, legalAuthorityProfile: "EDA", language: "ar", defaultLocale: "ar-EG", currencyCode: "EGP", timezone: "Africa/Cairo", taxProfile: "EG-TAX", dateFormat: "YYYY-MM-DD", numberSystem: "latn" }],
      [],
      [{ id: 50, jurisdictionId: 2, status: "approved", packVersion: "2026.1", effectiveFrom: new Date("2026-01-01"), reviewDueAt: null, rulesJson: JSON.stringify({ sale: true }), createdAt: new Date("2026-01-01") }],
      [{ id: 501, packId: 50, jurisdictionId: 2, operation: "sale", verificationStatus: "verified" }],
      [],
      [{ id: 900, organizationId: 10, jurisdictionId: 2, catalogItemId: 700 }],
      [],
      [{ id: 901, organizationId: 10, branchId: 9, productId: 900, quantityOnHand: "5", jurisdictionId: 2 }],
      [],
      [{ id: 700, organizationId: 10, jurisdictionId: 2, verificationStatus: "VERIFIED", category: "medicine", nameAr: "دواء اختبار", sku: "EG-TEST-001", registrationNumber: "EDA-REG-001" }],
      [
        { id: 502, packId: 50, jurisdictionId: 2, operation: "catalog", catalogField: "nameAr", verificationStatus: "verified" },
        { id: 503, packId: 50, jurisdictionId: 2, operation: "catalog", catalogField: "category", verificationStatus: "verified" },
        { id: 504, packId: 50, jurisdictionId: 2, operation: "catalog", catalogField: "sku", verificationStatus: "verified" },
        { id: 505, packId: 50, jurisdictionId: 2, operation: "catalog", catalogField: "registrationNumber", verificationStatus: "verified" },
      ],
    ];
    const next = () => queue.shift() ?? [];
    const db = {
      select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => {
        const promise = Promise.resolve(next()) as Promise<unknown[]> & { limit: () => Promise<unknown[]>; orderBy: () => { limit: () => Promise<unknown[]> } };
        promise.limit = async () => next();
        promise.orderBy = () => ({ limit: async () => next() });
        return promise;
      }) })) })),
      transaction: vi.fn(async (callback: (tx: unknown) => Promise<number>) => callback({
        insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue([{ insertId: 7001 }]) })),
        update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => ({ execute: vi.fn().mockResolvedValue([{ affectedRows: 1 }]) })) })) })),
      })),
    };
    getDbMock.mockResolvedValue(db);

    const caller = appRouter.createCaller(contextFor());
    await expect(caller.erp.pos.commitSale({
      branchId: 9,
      invoiceNumber: "INV-9004",
      paymentMethod: "cash",
      discountAmount: 0,
      items: [{ productId: 900, batchId: 901, quantity: 1, unit: "box", unitPrice: 100 }],
    })).resolves.toMatchObject({ saleId: 7001, jurisdictionId: 2, status: "COMMITTED" });
    expect(db.transaction).toHaveBeenCalledTimes(1);
  });
});

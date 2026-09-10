import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

const { getDbMock, hasCurrentNdaAcceptanceMock, recordAuthenticationEventMock } = vi.hoisted(() => ({ getDbMock: vi.fn(), hasCurrentNdaAcceptanceMock: vi.fn().mockResolvedValue(true), recordAuthenticationEventMock: vi.fn() }));
vi.mock("../db", () => ({ getDb: getDbMock, hasCurrentNdaAcceptance: hasCurrentNdaAcceptanceMock, recordAuthenticationEvent: recordAuthenticationEventMock }));

type TestUser = NonNullable<TrpcContext["user"]>;

const user: TestUser = {
  id: 72,
  openId: "invoice-preview-contract-user",
  email: "invoice-preview@example.com",
  name: "Invoice Preview Contract User",
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
  const query = () => {
    let consumed = false;
    const take = () => {
      if (!consumed) consumed = true;
      return next();
    };
    return {
      then: (resolve: (value: unknown[]) => unknown, reject?: (reason: unknown) => unknown) => Promise.resolve(take()).then(resolve, reject),
      limit: async () => next(),
      orderBy: () => ({ limit: async () => next() }),
    };
  };
  return {
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(query) })) })),
    transaction: vi.fn(async () => { throw new Error("invoice preview must not persist"); }),
  };
}

const baseInput = {
  branchId: 9,
  invoiceNumber: "INV-PREVIEW-1",
  currencyCode: "EGP",
  subtotal: 100,
  discountAmount: 0,
  totalAmount: 100,
  items: [{ sku: "EG-TEST-001", quantity: 1, unitPrice: 100 }],
};

function validPrefix() {
  return [
    [{ branchId: 9, jurisdictionId: 2, active: 1 }],
    [{ branchId: 9 }],
    [{ branchId: 9 }],
    [{ branchId: 9, jurisdictionId: 2, active: 1 }],
    [{ organizationId: 10 }],
    [{ id: 2, countryCode: "EG", active: 1, legalAuthorityProfile: "EDA", language: "ar", defaultLocale: "ar-EG", currencyCode: "EGP", timezone: "Africa/Cairo", taxProfile: "EG-TAX", dateFormat: "YYYY-MM-DD", numberSystem: "latn" }],
    [{ id: 50, jurisdictionId: 2, status: "approved", packVersion: "2026.1", effectiveFrom: new Date("2026-01-01"), reviewDueAt: null, rulesJson: JSON.stringify({ invoice: true }), createdAt: new Date("2026-01-01") }],
    [{ id: 501, packId: 50, jurisdictionId: 2, operation: "catalog", verificationStatus: "verified" }],
  ];
}

describe("invoice.generatePreview router contract", () => {
  beforeEach(() => getDbMock.mockReset());

  it("rejects a catalog record outside the confirmed organization and jurisdiction", async () => {
    getDbMock.mockResolvedValue(queuedDb([...validPrefix(), []]));
    const caller = appRouter.createCaller(contextFor());
    await expect(caller.erp.pos.generateInvoicePreview(baseInput)).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  it("rejects an unreconciled invoice before any persistence", async () => {
    getDbMock.mockResolvedValue(queuedDb([...validPrefix(), [{ id: 700, organizationId: 10, jurisdictionId: 2, sku: "EG-TEST-001", verificationStatus: "VERIFIED" }]]));
    const caller = appRouter.createCaller(contextFor());
    await expect(caller.erp.pos.generateInvoicePreview({ ...baseInput, totalAmount: 101 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

// The preview is deliberately non-persisted; official submission requires a verified adapter and credentials.

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const posSource = readFileSync(resolve(process.cwd(), "client/src/components/PointOfSaleWorkspace.tsx"), "utf8");
const erpSource = readFileSync(resolve(process.cwd(), "server/routers/erp.ts"), "utf8");
const cashierSource = readFileSync(resolve(process.cwd(), "client/src/components/CashierCycleWorkspace.tsx"), "utf8");

describe("POS workspace contract", () => {
  it("routes the POS module to the functional sales workspace", () => {
    expect(homeSource).toContain("const PointOfSaleWorkspace = lazy(() =>");
    expect(homeSource).toContain('import("@/components/PointOfSaleWorkspace").then');
    expect(homeSource).toContain('if (active === "pos")');
    expect(homeSource).toContain("<SalesFinanceWorkspace");
    expect(homeSource).toContain("<PointOfSaleWorkspace branchId={branchId} jurisdictionId={jurisdictionId} />");
  });

  it("keeps catalog and sale operations scoped and server-confirmed", () => {
    expect(erpSource).toContain("availableStock: protectedProcedure");
    expect(erpSource).toContain("commitSale: protectedProcedure");
    expect(posSource).toContain("trpc.erp.pos.availableStock.useQuery");
    expect(posSource).toContain("trpc.erp.pos.commitSale.useMutation");
    expect(posSource).toContain("CashierCycleWorkspace");
    expect(posSource).toContain('t("pos.noItems")');
    expect(erpSource).not.toContain("commitShowcaseSale");
    expect(erpSource).not.toContain("seedShowcaseDemoData");
    expect(erpSource).not.toContain("assertIsolatedShowcaseSalePolicy");
    expect(posSource).not.toContain("commitShowcaseSale");
    expect(posSource).not.toContain('sessionMode === "showcase"');
  });

  it("supports barcode lookup, audited held invoices, and post-sale receipt actions", () => {
    expect(erpSource).toContain("barcode: string | null");
    expect(erpSource).toContain("holdInvoice: protectedProcedure");
    expect(erpSource).toContain("listHeldInvoices: protectedProcedure");
    expect(erpSource).toContain("restoreHeldInvoice: protectedProcedure");
    expect(erpSource).toContain('action: "pos_invoice_held"');
    expect(erpSource).toContain('action: "pos_invoice_restored"');
    expect(posSource).toContain("onKeyDown");
    expect(posSource).toContain("applyScan(query, \"hardware\")");
    expect(posSource).toContain('t("pos.printReceipt")');
    expect(posSource).toContain('t("pos.shareWhatsApp")');
  });

  it("covers the cashier cycle, period invoices, and reviewed returns", () => {
    expect(erpSource).toContain("currentShift: protectedProcedure");
    expect(erpSource).toContain("closeShift: protectedProcedure");
    expect(erpSource).toContain("listPeriod: protectedProcedure");
    expect(erpSource).toContain("request: protectedProcedure");
    expect(cashierSource).toContain("تقفيل درج البيع");
    expect(cashierSource).toContain("فواتير آخر ٧ أيام");
    expect(cashierSource).toContain("إنشاء طلب مرتجع للمراجعة");
  });

  it("provides mobile-safe basket controls and explicit empty states", () => {
    expect(posSource).toContain("min-w-0");
    expect(posSource).toContain('t("pos.emptyBasket")');
    expect(posSource).toContain('t("pos.completeSale")');
    expect(homeSource).toContain("w-[min(286px,calc(100vw-1rem))]");
    expect(homeSource).toContain("overflow-x-hidden");
  });
});

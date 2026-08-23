import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const erpSource = readFileSync(resolve(process.cwd(), "server/routers/erp.ts"), "utf8");
const posSource = readFileSync(resolve(process.cwd(), "client/src/components/PointOfSaleWorkspace.tsx"), "utf8");
const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const demoSource = readFileSync(resolve(process.cwd(), "client/src/components/DemoExperienceWorkspace.tsx"), "utf8");

describe("global capability scope contract", () => {
  it("keeps production POS/search/sale paths on the normal protected procedure", () => {
    expect(erpSource).toContain("availableStock: protectedProcedure");
    expect(erpSource).toContain("prepareSale: protectedProcedure");
    expect(erpSource).toContain("commitSale: protectedProcedure");
    expect(erpSource).toContain("holdInvoice: protectedProcedure");
    expect(erpSource).toContain("listHeldInvoices: protectedProcedure");
    expect(posSource).toContain("trpc.erp.pos.availableStock.useQuery");
    expect(posSource).toContain("parseKeyboardWedgeSequence");
    expect(posSource).toContain('applyScan(raw, "camera")');
    expect(erpSource).toContain("commitShowcaseSale: isolatedDemoMutationProcedure");
    expect(posSource).toContain("trpc.erp.pos.commitSale.useMutation");
    expect(posSource).toContain("trpc.erp.pos.commitShowcaseSale.useMutation");
    expect(posSource).toContain('sessionMode === "showcase"');
    expect(homeSource).toContain('const PointOfSaleWorkspace = lazy(() => import("@/components/PointOfSaleWorkspace")');
    expect(homeSource).toContain('if (active === "pos") return <LazyWorkspace resetKey={workspaceResetKey}><SalesFinanceWorkspace');
  });

  it("keeps synthetic catalog editing and trial invoices explicitly showcase-only", () => {
    expect(erpSource).toContain("demoCatalog: router({");
    expect(erpSource).toContain("demoTrialInvoices: protectedProcedure");
    expect(erpSource).toContain('organization?.environment !== "showcase"');
    expect(demoSource).toContain('sessionMode !== "showcase"');
    expect(demoSource).toContain("trpc.erp.pos.demoCatalog.list");
    expect(demoSource).toContain("trpc.erp.pos.demoTrialInvoices");
  });

  it("does not identify global capabilities by the Test username or password", () => {
    expect(posSource).not.toMatch(/SHOWCASE_TEST_PASSWORD|username.*test/i);
    expect(homeSource).not.toMatch(/SHOWCASE_TEST_PASSWORD/);
    expect(erpSource).not.toMatch(/SHOWCASE_TEST_PASSWORD/);
  });
});

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const erpSource = readFileSync(resolve(process.cwd(), "server/routers/erp.ts"), "utf8");
const posSource = readFileSync(resolve(process.cwd(), "client/src/components/PointOfSaleWorkspace.tsx"), "utf8");
const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

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
    expect(posSource).toContain("trpc.erp.pos.commitSale.useMutation");
    expect(homeSource).toContain("const PointOfSaleWorkspace = lazy(() =>");
    expect(homeSource).toContain('import("@/components/PointOfSaleWorkspace").then');
    expect(homeSource).toContain('if (active === "pos")');
    expect(homeSource).toContain("<SalesFinanceWorkspace");
    expect(erpSource).not.toMatch(/commitShowcaseSale|isolatedDemoMutationProcedure|seedShowcaseDemoData/u);
    expect(posSource).not.toMatch(/commitShowcaseSale|sessionMode\s*===\s*["']showcase/u);
  });

  it("does not retain synthetic catalog, trial-invoice, or isolated workspace contracts", () => {
    for (const source of [erpSource, posSource, homeSource]) {
      expect(source).not.toMatch(/demoCatalog|demoTrialInvoices|DemoExperienceWorkspace|showcase/iu);
    }
  });

  it("does not identify global capabilities by the Test username or password", () => {
    expect(posSource).not.toMatch(/SHOWCASE_TEST_PASSWORD|username.*test/i);
    expect(homeSource).not.toMatch(/SHOWCASE_TEST_PASSWORD/);
    expect(erpSource).not.toMatch(/SHOWCASE_TEST_PASSWORD/);
  });
});

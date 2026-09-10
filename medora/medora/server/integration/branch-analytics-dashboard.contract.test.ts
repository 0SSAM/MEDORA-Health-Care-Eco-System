import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const routerSource = readFileSync(resolve(root, "server/routers/erp.ts"), "utf8");
const dashboardSource = readFileSync(resolve(root, "client/src/components/BranchAnalyticsDashboard.tsx"), "utf8");
const posSource = readFileSync(resolve(root, "client/src/components/PointOfSaleWorkspace.tsx"), "utf8");
const cssSource = readFileSync(resolve(root, "client/src/index.css"), "utf8");

describe("branch analytics and cashier mobile contracts", () => {
  it("exposes branch-scoped sales and inventory analytics", () => {
    expect(routerSource).toContain("analytics: router({");
    expect(routerSource).toContain("branchOverview: protectedProcedure");
    expect(routerSource).toContain("eq(sales.branchId, input.branchId)");
    expect(routerSource).toContain("eq(inventoryBatches.branchId, input.branchId)");
    expect(routerSource).toContain("paymentMix");
    expect(routerSource).toContain("inventoryAlerts");
  });

  it("refreshes the dashboard and presents safe empty/error states", () => {
    expect(dashboardSource).toContain("refetchInterval: 30_000");
    expect(dashboardSource).toContain("query.isError");
    expect(dashboardSource).toContain('t("branchAnalytics.noCompletedSales")');
    expect(dashboardSource).toContain('t("branchAnalytics.inventoryTitle")');
  });

  it("keeps cashier touch interactions accessible and motion-aware", () => {
    expect(posSource).toContain("cashier-touch-ui");
    expect(posSource).toContain("cashier-touch-card");
    expect(cssSource).toContain("touch-action: manipulation");
    expect(cssSource).toContain("prefers-reduced-motion: reduce");
    expect(cssSource).toContain("transform: scale(.97)");
  });
});

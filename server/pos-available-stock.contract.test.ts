import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("protected available-stock scope contract", () => {
  const source = readFileSync(resolve(process.cwd(), "server/routers/erp.ts"), "utf8");

  it("uses the shared zero-safe input contract while retaining server-side assignment checks", () => {
    expect(source).toContain(".input(availableStockInputSchema)");
    expect(source).toContain("assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId)");
    expect(source).toContain("assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, input.jurisdictionId)");
  });

  it("keeps product and batch reads constrained to the active organization, branch, and jurisdiction", () => {
    expect(source).toContain("eq(products.organizationId, organizationId)");
    expect(source).toContain("eq(products.jurisdictionId, input.jurisdictionId)");
    expect(source).toContain("eq(inventoryBatches.branchId, input.branchId)");
    expect(source).toContain("eq(inventoryBatches.jurisdictionId, input.jurisdictionId)");
  });
});

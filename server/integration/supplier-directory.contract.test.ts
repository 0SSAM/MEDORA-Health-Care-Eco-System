import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const routerSource = readFileSync(resolve(process.cwd(), "server/routers/procurement.ts"), "utf8");
const schemaSource = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
const workspaceSource = readFileSync(resolve(process.cwd(), "client/src/components/SupplierDirectoryWorkspace.tsx"), "utf8");
const supplyChainSource = readFileSync(resolve(process.cwd(), "client/src/components/SupplyChainWorkspace.tsx"), "utf8");

describe("supplier directory contract", () => {
  it("keeps directory reads and writes behind scoped protected procedures", () => {
    expect(routerSource).toContain("suppliers: router({");
    expect(routerSource).toContain("list: protectedProcedure");
    expect(routerSource).toContain("get: protectedProcedure");
    expect(routerSource).toContain("create: protectedProcedure");
    expect(routerSource).toContain("update: protectedProcedure");
    expect(routerSource).toContain("organizationId");
    expect(routerSource).toContain("branchId");
    expect(routerSource).toContain("jurisdictionId");
    expect(routerSource).toContain("assertScope");
  });

  it("covers payment, credit, approval, and audit fields", () => {
    for (const field of [
      "paymentTermsDays",
      "creditLimit",
      "creditCurrencyCode",
      "creditApprovalStatus",
      "creditApprovedAt",
      "creditApprovedAt",
      "creditApprovedByUserId",
      "taxRegistrationNumber",
      "createdByUserId",
    ]) {
      expect(schemaSource).toContain(field);
    }
    expect(routerSource).toContain("requestCredit: protectedProcedure");
    expect(routerSource).toContain("decideCredit: protectedProcedure");
    expect(routerSource).toContain("audit");
  });

  it("connects the RTL directory to the scoped procurement workspace", () => {
    expect(workspaceSource).toContain("SupplierDirectoryWorkspace");
    expect(workspaceSource).toContain("trpc.procurement.suppliers.list.useQuery");
    expect(workspaceSource).toContain("trpc.procurement.suppliers.create.useMutation");
    expect(workspaceSource).toContain("trpc.procurement.suppliers.requestCredit.useMutation");
    expect(supplyChainSource).toContain("SupplierDirectoryWorkspace");
  });
});

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const erpSource = readFileSync(resolve(process.cwd(), "server/routers/erp.ts"), "utf8");
const dbSource = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");

describe("showcase POS sale route contract", () => {
  it("allows persistence only through the explicit isolated-demo route while retaining scope and transaction guards", () => {
    const start = erpSource.indexOf("commitShowcaseSale:");
    expect(start).toBeGreaterThanOrEqual(0);

    const section = erpSource.slice(start, start + 22000);
    expect(erpSource).toContain("commitSale: protectedProcedure");
    expect(section).toContain("commitShowcaseSale: isolatedDemoMutationProcedure");
    expect(section).toContain("allowShowcasePersistence: true");
    expect(section).toContain("persistScopedSale");
    expect(erpSource).toContain("assertIsolatedShowcaseSalePolicy");
    expect(erpSource).toContain("assertUserBranchAccess");
    expect(erpSource).toContain("assertUserJurisdictionAccess");
    expect(erpSource).toContain("getBranchOrganizationId");
    expect(erpSource).toContain("assertCompliancePackUsable");
    expect(erpSource).toContain("db.transaction");
    expect(erpSource).toContain("eq(inventoryBatches.organizationId, organizationId)");
    expect(erpSource).toContain("eq(inventoryBatches.branchId, input.branchId)");
    expect(erpSource).toContain("eq(inventoryBatches.jurisdictionId, assignment.jurisdictionId)");
  });

  it("bootstraps only synthetic, approved, evidence-backed sale and catalog policy for the isolated showcase scope", () => {
    expect(erpSource).toContain('if (organization?.environment === "showcase")');
    expect(erpSource).toContain("await seedShowcaseDemoData");
    expect(erpSource).toContain("assertIsolatedShowcaseSalePolicy");
    expect(dbSource).toContain('SHOWCASE_COMPLIANCE_PACK_VERSION = "MEDORA-SHOWCASE-DEMO-V1"');
    expect(dbSource).toContain('operation of ["catalog", "sale"]');
    expect(dbSource).toContain("const showcaseCatalogEvidenceFields");
    expect(dbSource).toContain('"registrationNumber"');
    expect(dbSource).toContain('verificationStatus: "verified"');
    expect(dbSource).toContain("Synthetic showcase-only evidence");
  });
});

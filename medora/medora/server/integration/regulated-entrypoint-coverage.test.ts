import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const erpSource = readFileSync(resolve(process.cwd(), "server/routers/erp.ts"), "utf8");

describe("regulated entry-point coverage contract", () => {
  it("keeps current POS and prescription procedures behind scope and compliance gates", () => {
    const requiredProcedures = [
      "generateInvoicePreview",
      "prepareSale",
      "commitSale",
      "upload",
      "extractFromIntake",
      "confirm",
      "dispense",
    ];

    for (const procedure of requiredProcedures) {
      const start = erpSource.indexOf(`${procedure}:`);
      expect(start, `${procedure} must exist`).toBeGreaterThanOrEqual(0);
      const section = erpSource.slice(start, start + 6000);
      expect(section, `${procedure} must enforce branch assignment`).toContain("assertBranchAssignmentReady");
      expect(section, `${procedure} must enforce compliance-pack readiness`).toContain("assertCompliancePackUsable");
    }
  });

  it("does not claim standalone invoice persistence or catalog-linked product matching", () => {
    expect(erpSource).not.toMatch(/createInvoice|insertInvoice|matchPrescriptionProduct|dispenseProduct/);
  });
});

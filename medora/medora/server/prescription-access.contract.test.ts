import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "server/routers/erp.ts"), "utf8");
const accessSection = source.slice(source.indexOf("accessByPatientId: pharmacistProcedure"), source.indexOf("dispenseLine:", source.indexOf("accessByPatientId: pharmacistProcedure")));

describe("protected prescription patient lookup scope contract", () => {
  it("accepts an explicit non-negative jurisdiction ID while retaining assignment checks", () => {
    expect(accessSection).toContain("jurisdictionId: z.number().int().nonnegative()");
    expect(accessSection).toContain("await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId)");
    expect(accessSection).toContain("await assertUserJurisdictionAccess(db, ctx.user.id, ctx.user.role, input.jurisdictionId)");
  });

  it("keeps every patient and prescription read constrained to organization, branch, and jurisdiction", () => {
    expect(accessSection).toContain("eq(healthcarePatients.organizationId, organizationId)");
    expect(accessSection).toContain("eq(healthcarePatients.jurisdictionId, input.jurisdictionId)");
    expect(accessSection).toContain("eq(healthcarePatients.branchId, input.branchId)");
    expect(accessSection).toContain("eq(ePrescriptions.organizationId, organizationId)");
    expect(accessSection).toContain("eq(ePrescriptions.jurisdictionId, input.jurisdictionId)");
    expect(accessSection).toContain("eq(ePrescriptions.branchId, input.branchId)");
  });
});

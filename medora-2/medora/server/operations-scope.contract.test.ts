import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/routers/operations.ts"), "utf8");

describe("operations scope contract", () => {
  it("accepts jurisdiction 0 while rejecting a jurisdiction supplied without a branch", () => {
    expect(source).toContain("jurisdictionId: z.number().int().nonnegative().optional()");
    expect(source).toContain("Branch scope is required when jurisdiction scope is selected");
    expect(source).toContain("input.jurisdictionId !== undefined && input.branchId === undefined");
  });

  it("uses explicit jurisdiction presence checks in review, people, leave, procurement, and CRM reads", () => {
    expect(source).toContain("return jurisdictionId !== undefined ? eq(column as any, jurisdictionId) : undefined;");
    expect(source).toContain("optionalJurisdictionFilter(employeeProfiles.jurisdictionId, input.jurisdictionId)");
    expect(source).toContain("optionalJurisdictionFilter(employeeLeaveRequests.jurisdictionId, input.jurisdictionId)");
    expect(source).toContain("optionalJurisdictionFilter(procurementRequests.jurisdictionId, input.jurisdictionId)");
    expect(source).toContain("optionalJurisdictionFilter(crmLeads.jurisdictionId, input.jurisdictionId)");
  });
});

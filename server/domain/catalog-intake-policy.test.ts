import { describe, expect, it } from "vitest";
import { assertCatalogIntakeReady, catalogIntakeReadiness, type CatalogIntakeContext } from "./catalog-intake-policy";

const complete: CatalogIntakeContext = {
  actorRole: "catalog_manager",
  organizationId: "org-1",
  branchId: "branch-1",
  jurisdictionCode: "EG",
  recordOrganizationId: "org-1",
  recordBranchId: "branch-1",
  recordJurisdictionCode: "EG",
  sourceUrl: "https://official.example/register/row",
  sourceVerified: true,
};

describe("catalog intake readiness", () => {
  it("blocks unauthorized, cross-scope, and unverified intake", () => {
    expect(catalogIntakeReadiness(null)).toBe("BLOCKED");
    expect(catalogIntakeReadiness({ ...complete, actorRole: "user" })).toBe("BLOCKED");
    expect(catalogIntakeReadiness({ ...complete, recordJurisdictionCode: "JO" })).toBe("BLOCKED");
    expect(() => assertCatalogIntakeReady({ ...complete, sourceVerified: false })).toThrow(/not authorized/);
  });

  it("allows an authorized source-verified intake in matching scope", () => {
    expect(catalogIntakeReadiness(complete)).toBe("READY");
    expect(assertCatalogIntakeReady(complete)).toBe(true);
  });
});

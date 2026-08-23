import { describe, expect, it } from "vitest";
import {
  hasBranchJurisdictionScope,
  hasJurisdictionScope,
  hasOrganizationBranchJurisdictionScope,
  hasOrganizationJurisdictionScope,
} from "./scope";

describe("client scope readiness", () => {
  it("accepts a legal zero jurisdiction without treating a missing parent scope as ready", () => {
    expect(hasJurisdictionScope(0)).toBe(true);
    expect(hasBranchJurisdictionScope(12, 0)).toBe(true);
    expect(hasOrganizationJurisdictionScope(4, 0)).toBe(true);
    expect(hasOrganizationBranchJurisdictionScope(4, 12, 0)).toBe(true);
    expect(hasBranchJurisdictionScope(0, 0)).toBe(false);
    expect(hasOrganizationBranchJurisdictionScope(undefined, 12, 0)).toBe(false);
    expect(hasJurisdictionScope(undefined)).toBe(false);
    expect(hasJurisdictionScope(-1)).toBe(false);
  });
});

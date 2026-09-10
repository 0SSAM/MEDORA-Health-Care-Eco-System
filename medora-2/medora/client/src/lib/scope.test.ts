import { describe, expect, it } from "vitest";
import {
  hasBranchJurisdictionScope,
  hasJurisdictionScope,
  hasOrganizationBranchJurisdictionScope,
  hasOrganizationJurisdictionScope,
} from "./scope";

describe("client scope readiness", () => {
  it("requires a positive legal jurisdiction and complete parent scope", () => {
    expect(hasJurisdictionScope(1)).toBe(true);
    expect(hasBranchJurisdictionScope(12, 1)).toBe(true);
    expect(hasOrganizationJurisdictionScope(4, 1)).toBe(true);
    expect(hasOrganizationBranchJurisdictionScope(4, 12, 1)).toBe(true);
    expect(hasJurisdictionScope(0)).toBe(false);
    expect(hasBranchJurisdictionScope(12, 0)).toBe(false);
    expect(hasOrganizationJurisdictionScope(4, 0)).toBe(false);
    expect(hasOrganizationBranchJurisdictionScope(4, 12, 0)).toBe(false);
    expect(hasBranchJurisdictionScope(0, 1)).toBe(false);
    expect(hasOrganizationBranchJurisdictionScope(undefined, 12, 1)).toBe(false);
    expect(hasJurisdictionScope(undefined)).toBe(false);
    expect(hasJurisdictionScope(-1)).toBe(false);
    expect(hasJurisdictionScope(1.5)).toBe(false);
  });
});

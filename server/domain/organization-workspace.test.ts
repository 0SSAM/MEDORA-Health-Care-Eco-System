import { describe, expect, it } from "vitest";
import { canUseOrganizationModule, modulesForOrganization } from "./organization-workspace";

describe("organization workspace module policy", () => {
  it("limits a distributor to distribution-relevant modules", () => {
    expect(canUseOrganizationModule("distributor", "inventory")).toBe(true);
    expect(canUseOrganizationModule("distributor", "pos")).toBe(false);
  });

  it("limits an insurer to claims and governance modules", () => {
    expect(canUseOrganizationModule("insurer", "insurance")).toBe(true);
    expect(canUseOrganizationModule("insurer", "prescriptions")).toBe(false);
  });

  it("keeps unknown organization types fail-safe", () => {
    expect(modulesForOrganization("unknown")).toBeNull();
    expect(canUseOrganizationModule("unknown", "pos")).toBe(false);
    expect(canUseOrganizationModule(undefined, "overview")).toBe(false);
  });
});

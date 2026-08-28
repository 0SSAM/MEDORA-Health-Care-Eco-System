import { describe, expect, it } from "vitest";
import {
  canAccessOrganization,
  canManageOrganization,
  canViewFinancialData,
  canViewOrganizationAudit,
  canViewSensitiveClinicalData,
  hasOrganizationCapability,
} from "./organization-access";

const membership = { organizationId: 7, active: 1, organizationRole: "clinical_lead" };

describe("organization access policy", () => {
  it("allows an active member to access only their organization", () => {
    expect(canAccessOrganization("user", [membership], 7)).toBe(true);
    expect(canAccessOrganization("user", [membership], 8)).toBe(false);
  });

  it("rejects inactive memberships and unknown roles", () => {
    expect(canAccessOrganization("user", [{ ...membership, active: 0 }], 7)).toBe(false);
    expect(canAccessOrganization("user", [{ ...membership, organizationRole: "unknown" }], 7)).toBe(false);
  });

  it("keeps platform admin governance separate from organization membership", () => {
    expect(canAccessOrganization("admin", [], 99)).toBe(true);
    expect(canManageOrganization("admin", [], 99)).toBe(true);
    expect(canViewSensitiveClinicalData("admin", [], 99)).toBe(true);
  });

  it("does not grant clinical-data access to an operations-only member", () => {
    const operationsMembership = { organizationId: 7, active: 1, organizationRole: "operations_manager" };
    expect(canViewSensitiveClinicalData("manager", [operationsMembership], 7)).toBe(false);
    expect(canViewSensitiveClinicalData("manager", [membership], 7)).toBe(true);
  });

  it("enforces least privilege for management, clinical data, and audit access", () => {
    const operationsMembership = { organizationId: 7, active: 1, organizationRole: "operations_manager" };
    expect(canManageOrganization("manager", [operationsMembership], 7)).toBe(false);
    expect(canViewSensitiveClinicalData("manager", [operationsMembership], 7)).toBe(false);
    expect(canViewOrganizationAudit("manager", [operationsMembership], 7)).toBe(false);
    expect(canViewSensitiveClinicalData("manager", [membership], 7)).toBe(true);
    expect(canViewOrganizationAudit("manager", [{ ...membership, organizationRole: "auditor" }], 7)).toBe(true);
  });

  it("does not allow a valid membership in one organization to cross into another", () => {
    const memberships = [
      { organizationId: 7, active: 1, organizationRole: "org_admin" },
      { organizationId: 8, active: 0, organizationRole: "owner" },
    ];
    expect(hasOrganizationCapability("user", memberships, 7, "manage_members")).toBe(true);
    expect(hasOrganizationCapability("user", memberships, 8, "manage_members")).toBe(false);
  });

  it("grants financial data only to the designated organization roles", () => {
    expect(canViewFinancialData("manager", [{ organizationId: 7, active: 1, organizationRole: "operations_manager" }], 7)).toBe(true);
    expect(canViewFinancialData("user", [{ organizationId: 7, active: 1, organizationRole: "org_admin" }], 7)).toBe(true);
    expect(canViewFinancialData("pharmacist", [membership], 7)).toBe(false);
    expect(canViewFinancialData("cashier", [{ organizationId: 7, active: 1, organizationRole: "staff" }], 7)).toBe(false);
  });
});

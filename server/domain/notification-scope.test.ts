import { describe, expect, it } from "vitest";
import { canAccessNotificationScope } from "./notification-scope";

describe("notification scope policy", () => {
  it("allows global notifications to a member", () => {
    expect(canAccessNotificationScope({
      isAdmin: false,
      hasActiveOrganizationMembership: true,
      requestedOrganizationId: 9,
      notification: { organizationId: null, branchId: null },
    })).toBe(true);
  });

  it("allows organization notifications only for the matching active membership", () => {
    expect(canAccessNotificationScope({
      isAdmin: false,
      hasActiveOrganizationMembership: true,
      requestedOrganizationId: 9,
      notification: { organizationId: 9, branchId: null },
    })).toBe(true);
    expect(canAccessNotificationScope({
      isAdmin: false,
      hasActiveOrganizationMembership: true,
      requestedOrganizationId: 10,
      notification: { organizationId: 9, branchId: null },
    })).toBe(false);
  });

  it("allows only an active member of the matching branch to access branch notifications", () => {
    expect(canAccessNotificationScope({
      isAdmin: false,
      hasActiveOrganizationMembership: true,
      hasActiveBranchMembership: true,
      requestedOrganizationId: 9,
      requestedBranchId: 4,
      notification: { organizationId: 9, branchId: 4 },
    })).toBe(true);
    expect(canAccessNotificationScope({
      isAdmin: false,
      hasActiveOrganizationMembership: true,
      hasActiveBranchMembership: false,
      requestedOrganizationId: 9,
      requestedBranchId: 5,
      notification: { organizationId: 9, branchId: 4 },
    })).toBe(false);
  });

  it("rejects inactive members while allowing administrator scope", () => {
    expect(canAccessNotificationScope({
      isAdmin: false,
      hasActiveOrganizationMembership: false,
      requestedOrganizationId: 9,
      notification: { organizationId: 9, branchId: null },
    })).toBe(false);
    expect(canAccessNotificationScope({
      isAdmin: true,
      hasActiveOrganizationMembership: false,
      requestedOrganizationId: 9,
      notification: { organizationId: 9, branchId: 4 },
    })).toBe(true);
  });
});

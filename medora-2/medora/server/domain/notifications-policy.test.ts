import { describe, expect, it } from "vitest";
import { canViewNotification } from "./notifications-policy";

describe("notifications policy", () => {
  it("allows an authenticated user to view an all-audience notification", () => {
    expect(canViewNotification("all", "pharmacist")).toBe(true);
  });

  it("does not expose notifications to anonymous callers", () => {
    expect(canViewNotification("all", undefined)).toBe(false);
  });

  it("matches role-specific notifications exactly", () => {
    expect(canViewNotification("pharmacist", "pharmacist")).toBe(true);
    expect(canViewNotification("pharmacist", "cashier")).toBe(false);
    expect(canViewNotification("admin", "admin")).toBe(true);
    expect(canViewNotification("admin", "manager")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { canAccessBranch } from "./branch-access";

describe("branch access policy", () => {
  it("allows admins to access any branch", () => {
    expect(canAccessBranch("admin", [], 99)).toBe(true);
  });

  it("allows an assigned branch", () => {
    expect(canAccessBranch("cashier", [3, 8], 8)).toBe(true);
  });

  it("rejects a branch outside the active assignment set", () => {
    expect(canAccessBranch("cashier", [3, 8], 9)).toBe(false);
  });
});

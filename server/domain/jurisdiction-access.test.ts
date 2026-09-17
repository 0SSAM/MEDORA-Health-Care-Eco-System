import { describe, expect, it } from "vitest";
import { canAccessJurisdiction } from "./jurisdiction-access";

describe("jurisdiction access policy", () => {
  it("allows an admin to govern any jurisdiction", () => {
    expect(canAccessJurisdiction("admin", [], 99)).toBe(true);
  });

  it("rejects a non-admin without an active assignment to the requested jurisdiction", () => {
    expect(
      canAccessJurisdiction(
        "pharmacist",
        [{ active: 1, jurisdictionId: 1 }, { active: 0, jurisdictionId: 2 }],
        2,
      ),
    ).toBe(false);
  });

  it("allows a non-admin with an active assignment to the requested jurisdiction", () => {
    expect(canAccessJurisdiction("manager", [{ active: 1, jurisdictionId: 7 }], 7)).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { ISOLATED_SHOWCASE_ADMIN_OPEN_ID, isIsolatedShowcaseAdministrator, isWithinShowcaseOrganizationScope } from "./showcase-admin-policy";

describe("isolated showcase administrator policy", () => {
  it("grants the showcase-admin surface only to the fixed Test identity in showcase mode", () => {
    expect(isIsolatedShowcaseAdministrator({ openId: ISOLATED_SHOWCASE_ADMIN_OPEN_ID, sessionMode: "showcase" })).toBe(true);
    expect(isIsolatedShowcaseAdministrator({ openId: ISOLATED_SHOWCASE_ADMIN_OPEN_ID, sessionMode: "production" })).toBe(false);
    expect(isIsolatedShowcaseAdministrator({ openId: "another-user", sessionMode: "showcase" })).toBe(false);
  });

  it("pins showcase requests to the organization embedded in the authenticated session", () => {
    expect(isWithinShowcaseOrganizationScope({ sessionMode: "showcase", sessionOrganizationId: 42, requestedOrganizationId: 42 })).toBe(true);
    expect(isWithinShowcaseOrganizationScope({ sessionMode: "showcase", sessionOrganizationId: 42, requestedOrganizationId: 43 })).toBe(false);
    expect(isWithinShowcaseOrganizationScope({ sessionMode: "production", sessionOrganizationId: 42, requestedOrganizationId: 43 })).toBe(true);
  });
});

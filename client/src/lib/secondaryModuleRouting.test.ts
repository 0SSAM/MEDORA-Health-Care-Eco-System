import { describe, expect, it } from "vitest";
import { secondaryModuleTabForRoute } from "./secondaryModuleRouting";

describe("secondaryModuleTabForRoute", () => {
  it("maps each user-facing secondary-module entry to its focused workspace tab", () => {
    expect(secondaryModuleTabForRoute("secondaryModules")).toBe("crm");
    expect(secondaryModuleTabForRoute("people")).toBe("hr");
    expect(secondaryModuleTabForRoute("callCentre")).toBe("callCenter");
    expect(secondaryModuleTabForRoute("customerCare")).toBe("customerCare");
  });

  it("does not claim an unrelated route is a secondary-module workspace", () => {
    expect(secondaryModuleTabForRoute("pos")).toBeNull();
  });
});

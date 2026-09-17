import { describe, expect, it } from "vitest";
import { welcomeRoutes } from "./Welcome";

describe("Welcome screen routes", () => {
  it("keeps public login and authenticated workspace destinations explicit", () => {
    expect(welcomeRoutes.login).toBe("/login");
    expect(welcomeRoutes.workspace).toBe("/workspace");
  });
});

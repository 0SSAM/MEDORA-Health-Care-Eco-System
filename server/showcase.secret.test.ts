import { describe, expect, it } from "vitest";

describe("showcase credential configuration", () => {
  it("requires a non-trivial configured secret without making a live service call", () => {
    const password = process.env.SHOWCASE_TEST_PASSWORD;
    expect(password, "SHOWCASE_TEST_PASSWORD must be supplied").toBeTruthy();
    expect(password!.length).toBeGreaterThanOrEqual(12);
    expect(password).not.toBe("test");
  });
});

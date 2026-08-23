import { describe, expect, it } from "vitest";

describe("MEDORA branding configuration", () => {
  it("serves the application endpoint with the configured MEDORA brand title", async () => {
    const response = await fetch("http://127.0.0.1:3000/");
    expect(response.ok).toBe(true);
    const html = await response.text();
    expect(process.env.VITE_APP_TITLE).toBe("MEDORA Health Care Eco System");
    expect(process.env.VITE_APP_LOGO).toMatch(/^(https:\/\/|\/manus-storage\/)/);
    expect(html).toContain("<title>MEDORA Health Care Eco System</title>");
  });
});

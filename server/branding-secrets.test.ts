import { describe, expect, it } from "vitest";

describe("MEDORA branding configuration", () => {
  it("serves the application endpoint with the configured Arabic brand title", async () => {
    const response = await fetch("http://127.0.0.1:3000/");
    expect(response.ok).toBe(true);
    const html = await response.text();
    const title = process.env.VITE_APP_TITLE;
    expect(["ميدورا | منظومة الرعاية الصحية المتكاملة", "MEDORA Health Care Eco System"]).toContain(title);
    expect(process.env.VITE_APP_LOGO).toMatch(/^(https:\/\/|\/manus-storage\/)/);
    expect(html).toContain(`<title>${title}</title>`);
  });
});

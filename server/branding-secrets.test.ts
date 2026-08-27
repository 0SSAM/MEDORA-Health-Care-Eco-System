import { describe, expect, it } from "vitest";

describe("MEDORA branding configuration", () => {
  it("serves the application endpoint with the configured Arabic brand title", async () => {
    const baseUrl = process.env.MEDORA_TEST_BASE_URL ?? "http://127.0.0.1:3000";
    const response = await fetch(`${baseUrl}/`);
    expect(response.ok).toBe(true);
    const html = await response.text();
    const publishedTitle = "ميدورا | منظومة الرعاية الصحية المتكاملة";
    expect([publishedTitle, "MEDORA Health Care Eco System"]).toContain(process.env.VITE_APP_TITLE);
    expect(process.env.VITE_APP_LOGO).toMatch(/^(https:\/\/|\/manus-storage\/)/);
    expect(html).toContain(`<title>${publishedTitle}</title>`);
  });
});

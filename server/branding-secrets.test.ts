import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("MEDORA branding configuration", () => {
  it("uses an approved MEDORA title configuration and HTML title injection", () => {
    const indexHtml = readFileSync(new URL("../client/index.html", import.meta.url), "utf8");
    expect([
      "MEDORA Health Care Eco System",
      "ميدورا | منظومة الرعاية الصحية المتكاملة",
    ]).toContain(process.env.VITE_APP_TITLE);
    expect(process.env.VITE_APP_LOGO).toMatch(/^(https:\/\/|\/manus-storage\/)/);
    expect(indexHtml).toContain("<title>%VITE_APP_TITLE%</title>");
  });
});

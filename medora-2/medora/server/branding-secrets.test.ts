import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("MEDORA branding configuration", () => {
  it("uses the approved MEDORA title configuration and HTML title", () => {
    const indexHtml = readFileSync(new URL("../client/index.html", import.meta.url), "utf8");
    expect([
      "MEDORA Health Care Eco System",
      "ميدورا | منظومة الرعاية الصحية المتكاملة",
    ]).toContain(process.env.VITE_APP_TITLE);
    expect(process.env.VITE_APP_LOGO).toMatch(/^(https:\/\/|\/manus-storage\/)/);
    expect(indexHtml).toContain("<title>MEDORA — Health Care Eco System</title>");
    expect(indexHtml).not.toContain("%VITE_APP_TITLE%");
  });
});

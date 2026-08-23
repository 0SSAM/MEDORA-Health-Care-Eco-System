import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("MEDORA branding configuration", () => {
  it("uses an approved MEDORA title configuration and HTML title injection", () => {
    const indexHtml = readFileSync(
      "/home/ubuntu/ألدورا-|-منظومة-الرعاية-الصحية-المتكاملة/client/index.html",
      "utf8",
    );
    expect([
      "MEDORA Health Care Eco System",
      "ميدورا | منظومة الرعاية الصحية المتكاملة",
    ]).toContain(process.env.VITE_APP_TITLE);
    expect(process.env.VITE_APP_LOGO).toMatch(/^(https:\/\/|\/manus-storage\/)/);
    expect(indexHtml).toContain("<title>%VITE_APP_TITLE%</title>");
  });
});

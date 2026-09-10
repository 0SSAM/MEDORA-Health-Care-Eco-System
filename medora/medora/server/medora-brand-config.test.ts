import { describe, expect, it } from "vitest";

describe("MEDORA brand configuration", () => {
  it("exposes the approved app title and hosted logo asset", () => {
    expect([
      "MEDORA Health Care Eco System",
      "ميدورا | منظومة الرعاية الصحية المتكاملة",
    ]).toContain(process.env.VITE_APP_TITLE);
    expect(process.env.VITE_APP_LOGO).toMatch(/^\/manus-storage\/medora-logo-primary_[a-z0-9]+\.png$/);
  });
});

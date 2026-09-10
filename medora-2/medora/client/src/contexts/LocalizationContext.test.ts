import { describe, expect, it } from "vitest";
import { hasScopedJurisdictionId, normalizeLanguage, translateLocalization } from "./LocalizationContext";

describe("language preference", () => {
  it("accepts English and safely falls back to Arabic", () => {
    expect(normalizeLanguage("en")).toBe("en");
    expect(normalizeLanguage("ar")).toBe("ar");
    expect(normalizeLanguage("fr")).toBe("ar");
    expect(normalizeLanguage(null)).toBe("ar");
  });

  it("returns English POS and home labels after the user switches languages", () => {
    expect(translateLocalization("en", "pos.openSale")).toBe("Open sale invoice");
    expect(translateLocalization("en", "pos.completeSale")).toBe("Complete sale");
    expect(translateLocalization("en", "home.module.pos")).toBe("Point of Sale");
    expect(translateLocalization("en", "home.group.work")).toBe("Daily work");
    expect(translateLocalization("ar", "pos.openSale")).toBe("فتح فاتورة بيع");
  });
});

describe("active branch scope guards", () => {
  it("requires a positive legal-jurisdiction identifier and rejects missing or invalid scope", () => {
    expect(hasScopedJurisdictionId(0)).toBe(false);
    expect(hasScopedJurisdictionId(12)).toBe(true);
    expect(hasScopedJurisdictionId(null)).toBe(false);
    expect(hasScopedJurisdictionId(undefined)).toBe(false);
    expect(hasScopedJurisdictionId(-1)).toBe(false);
    expect(hasScopedJurisdictionId(1.5)).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { buildCountryLocalization, formatLocalizedCurrency, localizedLabel } from "./localization";

describe("country localization", () => {
  it("defaults Arabic profiles to RTL with safe fallback terminology", () => {
    const localization = buildCountryLocalization({ countryCode: "eg", locale: "ar-EG", currencyCode: "EGP" });
    expect(localization.direction).toBe("rtl");
    expect(localizedLabel("pharmacy", localization)).toBe("الصيدلية");
    expect(localizedLabel("unknown", localization)).toBe("unknown");
  });

  it("supports country terminology overrides and localized currency formatting", () => {
    const localization = buildCountryLocalization({ countryCode: "SA", locale: "ar-SA", currencyCode: "SAR", terminology: { pharmacy: "صيدلية مرخصة" } });
    expect(localizedLabel("pharmacy", localization)).toBe("صيدلية مرخصة");
    expect(formatLocalizedCurrency(12.5, localization)).toContain("12");
  });
});

import { describe, expect, it } from "vitest";
import { assertLocalizationReady, localizationReadiness, type LocalizationContext } from "./localization-policy";

const complete: LocalizationContext = {
  localeVerified: true,
  rtlDirectionVerified: true,
  timezoneVerified: true,
  currencyVerified: true,
  calendarDateFormatsVerified: true,
  effectiveSourceVerified: true,
};

describe("localization readiness", () => {
  it("blocks incomplete country localization metadata", () => {
    expect(localizationReadiness(null)).toBe("BLOCKED");
    expect(localizationReadiness({ ...complete, localeVerified: false })).toBe("BLOCKED");
    expect(localizationReadiness({ ...complete, timezoneVerified: false })).toBe("BLOCKED");
    expect(() => assertLocalizationReady({ ...complete, effectiveSourceVerified: false })).toThrow(/not ready/);
  });

  it("allows activation only when every localization gate is verified", () => {
    expect(localizationReadiness(complete)).toBe("READY");
    expect(assertLocalizationReady(complete)).toBe(true);
  });
});

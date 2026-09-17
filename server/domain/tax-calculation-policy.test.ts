import { describe, expect, it } from "vitest";
import { assertTaxCalculationReady, taxCalculationReadiness, type TaxCalculationContext } from "./tax-calculation-policy";

const complete: TaxCalculationContext = {
  effectiveSourceVerified: true,
  ratesVerified: true,
  roundingRulesVerified: true,
  exemptionHandlingVerified: true,
  auditMetadataConfigured: true,
};

describe("tax calculation readiness", () => {
  it("blocks missing source, rates, rounding, exemption, or audit configuration", () => {
    expect(taxCalculationReadiness(null)).toBe("BLOCKED");
    expect(taxCalculationReadiness({ ...complete, ratesVerified: false })).toBe("BLOCKED");
    expect(taxCalculationReadiness({ ...complete, roundingRulesVerified: false })).toBe("BLOCKED");
    expect(() => assertTaxCalculationReady({ ...complete, auditMetadataConfigured: false })).toThrow(/not ready/);
  });

  it("allows calculation only when every tax gate is ready", () => {
    expect(taxCalculationReadiness(complete)).toBe("READY");
    expect(assertTaxCalculationReady(complete)).toBe(true);
  });
});

export type TaxCalculationContext = {
  effectiveSourceVerified: boolean;
  ratesVerified: boolean;
  roundingRulesVerified: boolean;
  exemptionHandlingVerified: boolean;
  auditMetadataConfigured: boolean;
};

export function taxCalculationReadiness(context: TaxCalculationContext | null) {
  if (!context) return "BLOCKED" as const;
  return Object.values(context).every(Boolean) ? "READY" as const : "BLOCKED" as const;
}

export function assertTaxCalculationReady(context: TaxCalculationContext | null) {
  if (taxCalculationReadiness(context) !== "READY") throw new Error("Tax calculation is not ready");
  return true as const;
}

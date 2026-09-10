export type PayrollStatutoryProfile = {
  countryCode: string;
  effectiveFrom: string;
  currencyCode: string;
  taxRulesSourceUrl: string;
  socialInsuranceSourceUrl: string;
  employmentRulesSourceUrl: string;
  employerRegistrationVerified: boolean;
  acceptanceCriteriaVerified: boolean;
};

export function payrollReadiness(profile: PayrollStatutoryProfile | null) {
  if (!profile) return "BLOCKED" as const;
  const validCurrency = /^[A-Z]{3}$/.test(profile.currencyCode);
  const validDate = !Number.isNaN(Date.parse(profile.effectiveFrom));
  return profile.countryCode.length === 2 && validDate && validCurrency && Boolean(profile.taxRulesSourceUrl && profile.socialInsuranceSourceUrl && profile.employmentRulesSourceUrl && profile.employerRegistrationVerified && profile.acceptanceCriteriaVerified) ? "READY" as const : "BLOCKED" as const;
}

export function assertPayrollReady(profile: PayrollStatutoryProfile | null) {
  if (payrollReadiness(profile) !== "READY") throw new Error("Payroll statutory profile is not ready for activation");
  return true as const;
}

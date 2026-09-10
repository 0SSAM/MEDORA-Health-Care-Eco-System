import { describe, expect, it } from "vitest";
import { assertPayrollReady, payrollReadiness, type PayrollStatutoryProfile } from "./payroll-policy";

const complete: PayrollStatutoryProfile = {
  countryCode: "EG",
  effectiveFrom: "2026-01-01",
  currencyCode: "EGP",
  taxRulesSourceUrl: "https://official.example/tax",
  socialInsuranceSourceUrl: "https://official.example/social-insurance",
  employmentRulesSourceUrl: "https://official.example/employment",
  employerRegistrationVerified: true,
  acceptanceCriteriaVerified: true,
};

describe("payroll statutory readiness", () => {
  it("blocks missing or incomplete statutory evidence", () => {
    expect(payrollReadiness(null)).toBe("BLOCKED");
    expect(payrollReadiness({ ...complete, employerRegistrationVerified: false })).toBe("BLOCKED");
    expect(() => assertPayrollReady({ ...complete, currencyCode: "EG" })).toThrow(/not ready/);
  });

  it("allows readiness only for a complete country profile", () => {
    expect(payrollReadiness(complete)).toBe("READY");
    expect(assertPayrollReady(complete)).toBe(true);
  });
});

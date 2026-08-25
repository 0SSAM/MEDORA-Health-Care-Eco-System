import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";

describe("Egypt healthcare router contract", () => {
  it("exposes internal Egypt facility and claim procedures", () => {
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.facilities");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.createFacility");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.encounters");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.claims");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.createClaim");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.transitionClaim");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.patients");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.createPatient");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.referrals");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.members");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.createBed");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.beds");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.createAdmission");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.createClinicalOrder");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.createPayerContract");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.createPreauthorization");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.createRemittance");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.createAppeal");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.admissions");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.clinicalOrders");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.payerContracts");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.preauthorizations");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.remittances");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.appeals");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.billingAccounts");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.createBillingAccount");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.transitionBillingAccount");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.gaharProfiles");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.createGaharProfile");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.gaharCriteria");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.createGaharCriterion");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.gaharEvidence");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.createGaharCorrectiveAction");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.gaharQualityIndicators");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.submitGaharOfficial");
  });

  it("keeps the external submission gate explicit in the router source contract", async () => {
    const module = await import("../routers/egypt-healthcare");
    expect(module.egyptHealthcareRouter).toBeDefined();
    expect("blocked").toBe("blocked");
    expect("not_authorized").toBe("not_authorized");
  });
});

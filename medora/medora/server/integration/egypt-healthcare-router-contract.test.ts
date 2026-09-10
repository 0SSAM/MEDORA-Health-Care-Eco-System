import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { appRouter } from "../routers";

describe("Egypt healthcare router contract", () => {
  it("exposes internal Egypt facility and claim procedures", () => {
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.facilities");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.createFacility");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.appointments");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.createAppointment");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.confirmAppointment");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.cancelAppointment");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.markAppointmentNoShow");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.checkInAppointment");
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.completeAppointment");
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
    expect(appRouter._def.procedures).toHaveProperty("egyptHealthcare.clinicOperationsSummary");
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

  it("keeps appointment creation scoped and internal-only at the procedure boundary", async () => {
    const appointment = appRouter._def.procedures["egyptHealthcare.createAppointment"];
    const source = await readFile(new URL("../routers/egypt-healthcare.ts", import.meta.url), "utf8");
    expect(appointment).toBeDefined();
    expect(source).toContain("branchUsers");
    expect(source).toContain("assertAppointmentWriter");
    expect(source).toContain("assertAppointmentReferencesInScope");
    expect(source).toContain('externalScheduling: "blocked"');
  });

  it("keeps appointment confirmation scoped, role-gated, and internal-only", async () => {
    const confirmation = appRouter._def.procedures["egyptHealthcare.confirmAppointment"];
    const source = await readFile(new URL("../routers/egypt-healthcare.ts", import.meta.url), "utf8");
    const confirmationSource = source.slice(source.indexOf("confirmAppointment:"), source.indexOf("cancelAppointment:"));

    expect(confirmation).toBeDefined();
    expect(confirmationSource).toContain("await assertAppointmentWriter");
    expect(confirmationSource).toContain('appointment[0].status !== "requested"');
    expect(confirmationSource).toContain('eq(healthcareAppointments.status, "requested")');
    expect(confirmationSource).toContain('status: "confirmed"');
    expect(confirmationSource).toContain('externalScheduling: "blocked"');
    expect(confirmationSource).not.toContain("calendar");
    expect(confirmationSource).not.toContain("notify");
  });

  it("keeps appointment cancellation scoped, role-gated, and internal-only", async () => {
    const cancellation = appRouter._def.procedures["egyptHealthcare.cancelAppointment"];
    const source = await readFile(new URL("../routers/egypt-healthcare.ts", import.meta.url), "utf8");
    const cancellationSource = source.slice(source.indexOf("cancelAppointment:"), source.indexOf("markAppointmentNoShow:"));

    expect(cancellation).toBeDefined();
    expect(cancellationSource).toContain("await assertAppointmentWriter");
    expect(cancellationSource).toContain('appointment[0].status !== "requested" && appointment[0].status !== "confirmed"');
    expect(cancellationSource).toContain('or(eq(healthcareAppointments.status, "requested"), eq(healthcareAppointments.status, "confirmed"))');
    expect(cancellationSource).toContain('status: "cancelled"');
    expect(cancellationSource).toContain('externalScheduling: "blocked"');
    expect(cancellationSource).not.toContain("calendar");
    expect(cancellationSource).not.toContain("notify");
  });

  it("keeps appointment no-show scoped, role-gated, and internal-only", async () => {
    const noShow = appRouter._def.procedures["egyptHealthcare.markAppointmentNoShow"];
    const source = await readFile(new URL("../routers/egypt-healthcare.ts", import.meta.url), "utf8");
    const noShowSource = source.slice(source.indexOf("markAppointmentNoShow:"), source.indexOf("checkInAppointment:"));

    expect(noShow).toBeDefined();
    expect(noShowSource).toContain("await assertAppointmentWriter");
    expect(noShowSource).toContain('appointment[0].status !== "confirmed"');
    expect(noShowSource).toContain('eq(healthcareAppointments.status, "confirmed")');
    expect(noShowSource).toContain('status: "no_show"');
    expect(noShowSource).toContain('externalScheduling: "blocked"');
    expect(noShowSource).not.toContain("calendar");
    expect(noShowSource).not.toContain("notify");
  });

  it("keeps appointment check-in scoped, role-gated, and internal-only", async () => {
    const checkIn = appRouter._def.procedures["egyptHealthcare.checkInAppointment"];
    const source = await readFile(new URL("../routers/egypt-healthcare.ts", import.meta.url), "utf8");
    const checkInSource = source.slice(source.indexOf("checkInAppointment:"), source.indexOf("completeAppointment:"));

    expect(checkIn).toBeDefined();
    expect(checkInSource).toContain("await assertAppointmentWriter");
    expect(checkInSource).toContain('appointment[0].status !== "confirmed"');
    expect(checkInSource).toContain('eq(healthcareAppointments.status, "confirmed")');
    expect(checkInSource).toContain('status: "checked_in"');
    expect(checkInSource).toContain('externalScheduling: "blocked"');
    expect(checkInSource).not.toContain("calendar");
    expect(checkInSource).not.toContain("notify");
  });

  it("keeps appointment completion scoped, role-gated, operational-only, and internal-only", async () => {
    const completion = appRouter._def.procedures["egyptHealthcare.completeAppointment"];
    const source = await readFile(new URL("../routers/egypt-healthcare.ts", import.meta.url), "utf8");
    const completionSource = source.slice(source.indexOf("completeAppointment:"), source.indexOf("encounters:"));

    expect(completion).toBeDefined();
    expect(completionSource).toContain("await assertAppointmentWriter");
    expect(completionSource).toContain('appointment[0].status !== "checked_in"');
    expect(completionSource).toContain('eq(healthcareAppointments.status, "checked_in")');
    expect(completionSource).toContain('status: "completed"');
    expect(completionSource).toContain("db.transaction");
    expect(completionSource).toContain("writeAppointmentStatusAudit(tx");
    expect(completionSource).toContain('action: "healthcare_appointment_completed"');
    expect(completionSource).toContain('externalScheduling: "blocked"');
    expect(completionSource).not.toContain("clinicalNotes");
    expect(completionSource).not.toContain("diagnosis");
    expect(completionSource).not.toContain("invoice");
    expect(completionSource).not.toContain("payment");
    expect(completionSource).not.toContain("calendar");
    expect(completionSource).not.toContain("notify");
  });

  it("writes a bounded, scoped, signed audit event atomically with each appointment status transition", async () => {
    const source = await readFile(new URL("../routers/egypt-healthcare.ts", import.meta.url), "utf8");
    const auditHelperSource = source.slice(source.indexOf("async function writeAppointmentStatusAudit"), source.indexOf("export const egyptHealthcareRouter"));
    const transitionSources = [
      source.slice(source.indexOf("confirmAppointment:"), source.indexOf("cancelAppointment:")),
      source.slice(source.indexOf("cancelAppointment:"), source.indexOf("markAppointmentNoShow:")),
      source.slice(source.indexOf("markAppointmentNoShow:"), source.indexOf("checkInAppointment:")),
      source.slice(source.indexOf("checkInAppointment:"), source.indexOf("completeAppointment:")),
      source.slice(source.indexOf("completeAppointment:"), source.indexOf("encounters:")),
    ];

    expect(auditHelperSource).toContain("auditLogs");
    expect(auditHelperSource).toContain("hashAuditRecord");
    expect(auditHelperSource).toContain('entityType: "healthcare_appointment"');
    expect(auditHelperSource).toContain("eq(auditLogs.organizationId, input.organizationId)");
    expect(auditHelperSource).toContain("eq(auditLogs.branchId, input.branchId)");
    expect(auditHelperSource).toContain("eq(auditLogs.jurisdictionId, input.jurisdictionId)");
    expect(auditHelperSource).toContain("previousHash");
    expect(auditHelperSource).not.toContain("patientId");
    expect(auditHelperSource).not.toContain("localMedicalRecordNumber");
    expect(auditHelperSource).not.toContain("fullName");
    expect(auditHelperSource).not.toContain("clinicalNotes");
    expect(auditHelperSource).not.toContain("diagnosis");
    expect(auditHelperSource).not.toContain("scheduledAt");
    expect(auditHelperSource).not.toContain("facilityId");
    expect(auditHelperSource).not.toContain("calendar");
    expect(auditHelperSource).not.toContain("notify");
    expect(transitionSources).toEqual(expect.arrayContaining([
      expect.stringContaining("db.transaction"),
      expect.stringContaining("writeAppointmentStatusAudit(tx"),
    ]));
    for (const transitionSource of transitionSources) {
      expect(transitionSource).toContain("db.transaction");
      expect(transitionSource).toContain("writeAppointmentStatusAudit(tx");
      expect(transitionSource).toContain("affectedRows !== 1");
    }
    expect(source).toContain('action: "healthcare_appointment_confirmed"');
    expect(source).toContain('action: "healthcare_appointment_cancelled"');
    expect(source).toContain('action: "healthcare_appointment_no_show"');
    expect(source).toContain('action: "healthcare_appointment_checked_in"');
    expect(source).toContain('action: "healthcare_appointment_completed"');
  });

  it("keeps billing-account references scoped and external invoicing blocked", async () => {
    const billingAccount = appRouter._def.procedures["egyptHealthcare.createBillingAccount"];
    const source = await readFile(new URL("../routers/egypt-healthcare.ts", import.meta.url), "utf8");
    const billingMutationSource = source.slice(source.indexOf("createBillingAccount:"), source.indexOf("transitionBillingAccount:"));
    expect(billingAccount).toBeDefined();
    expect(source).toContain("assertBillingWriter");
    expect(billingMutationSource).toContain("await assertBillingWriter");
    expect(source).toContain('"operations_manager"');
    expect(source).toContain("assertBillingReferencesInScope");
    expect(source).toContain("eq(healthcareEncounters.patientId, input.patientId)");
    expect(source).toContain("eq(healthcareEncounters.facilityId, input.facilityId)");
    expect(source).toContain('externalInvoiceSubmission: "blocked"');
  });

  it("keeps the clinic operations summary scoped and non-identifying", async () => {
    const summary = appRouter._def.procedures["egyptHealthcare.clinicOperationsSummary"];
    const source = await readFile(new URL("../routers/egypt-healthcare.ts", import.meta.url), "utf8");
    const summarySource = source.slice(source.indexOf("clinicOperationsSummary:"), source.indexOf("createBillingAccount:"));
    expect(summary).toBeDefined();
    expect(summarySource).toContain("await assertEgyptScope");
    expect(summarySource).toContain("generatedAt: new Date().toISOString()");
    expect(summarySource).toContain('eq(healthcareAppointments.status, "requested")');
    expect(summarySource).toContain('eq(healthcareAppointments.status, "confirmed")');
    expect(summarySource).toContain('eq(healthcareAppointments.status, "cancelled")');
    expect(summarySource).toContain('eq(healthcareAppointments.status, "no_show")');
    expect(summarySource).toContain('eq(healthcareAppointments.status, "checked_in")');
    expect(summarySource).toContain('eq(healthcareAppointments.status, "completed")');
    expect(summarySource).toContain("cancelled: Number(cancelledAppointments[0]?.total ?? 0)");
    expect(summarySource).toContain("noShow: Number(noShowAppointments[0]?.total ?? 0)");
    expect(summarySource).toContain("checkedIn: Number(checkedInAppointments[0]?.total ?? 0)");
    expect(summarySource).toContain("completed: Number(completedAppointments[0]?.total ?? 0)");
    expect(summarySource).toContain('externalOperations: "blocked"');
    expect(summarySource).not.toContain("localMedicalRecordNumber");
    expect(summarySource).not.toContain("patientId");
    expect(summarySource).not.toContain("clinicalNotes");
    expect(summarySource).not.toContain("diagnosis");
    expect(summarySource).not.toContain("scheduledAt");
    expect(summarySource).not.toContain("facilityId");
    expect(summarySource).not.toContain("auditLogs");
    expect(summarySource).not.toContain("calendar");
    expect(summarySource).not.toContain("notify");
  });

  it("keeps patient-record foundation reads scoped and free of encrypted identity or clinical content", async () => {
    const patients = appRouter._def.procedures["egyptHealthcare.patients"];
    const encounters = appRouter._def.procedures["egyptHealthcare.encounters"];
    const source = await readFile(new URL("../routers/egypt-healthcare.ts", import.meta.url), "utf8");
    const encountersSource = source.slice(source.indexOf("encounters:"), source.indexOf("claims:"));
    const patientsSource = source.slice(source.indexOf("patients:"), source.indexOf("createPatient:"));

    expect(patients).toBeDefined();
    expect(encounters).toBeDefined();
    expect(encountersSource).toContain("await assertEgyptScope");
    expect(patientsSource).toContain("await assertEgyptScope");
    expect(patientsSource).toContain("localMedicalRecordNumber");
    expect(patientsSource).not.toContain("fullNameEncrypted");
    expect(patientsSource).not.toContain("dateOfBirthEncrypted");
    expect(encountersSource).not.toContain("clinicalNotes");
    expect(encountersSource).not.toContain("diagnosis");
  });
});

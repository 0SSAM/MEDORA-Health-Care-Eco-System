import { and, count, desc, eq, or } from "drizzle-orm";
import { createCipheriv, createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { auditLogs, branches, branchJurisdictions, branchUsers, healthcareAdmissions, healthcareAppointments, healthcareBeds, healthcareClinicalOrders, healthcareEncounters, healthcareFacilities, healthcarePatients, healthcareReferrals, hospitalBillingAccounts, insuranceAppeals, insuranceClaims, insuranceMembers, insurancePayerContracts, insurancePreauthorizations, insuranceRemittances, gaharReadinessProfiles, gaharCriteria, gaharEvidence, gaharCorrectiveActions, gaharQualityIndicators, jurisdictionProfiles, organizationMemberships } from "../../drizzle/schema";
import { hashAuditRecord } from "../domain/internal-auth";

const facilityType = z.enum(["government_hospital", "private_hospital", "primary_care", "laboratory", "radiology", "rehabilitation"]);
const claimStatus = z.enum(["draft", "ready", "submitted", "received", "under_review", "approved", "partially_approved", "rejected", "appealed", "paid", "reconciled", "cancelled"]);

function encryptPatientValue(value: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Clinical encryption key is not configured" });
  const key = createHash("sha256").update(`MEDORA-EG-CLINICAL:${secret}`).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return JSON.stringify({ algorithm: "AES-256-GCM", keyVersion: "jwt-derived-v1", iv: iv.toString("base64"), authTag: cipher.getAuthTag().toString("base64"), ciphertext: ciphertext.toString("base64") });
}

async function assertEgyptScope(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId: number, role: string, organizationId: number, jurisdictionId: number, branchId?: number) {
  if (role !== "admin") {
    const membership = await db.select({ id: organizationMemberships.id }).from(organizationMemberships).where(and(eq(organizationMemberships.organizationId, organizationId), eq(organizationMemberships.userId, userId), eq(organizationMemberships.active, 1))).limit(1);
    if (!membership.length) throw new TRPCError({ code: "FORBIDDEN", message: "Organization access denied" });
    if (branchId !== undefined) {
      const branchMembership = await db.select({ id: branchUsers.id }).from(branchUsers).where(and(eq(branchUsers.branchId, branchId), eq(branchUsers.userId, userId), eq(branchUsers.active, 1))).limit(1);
      if (!branchMembership.length) throw new TRPCError({ code: "FORBIDDEN", message: "Branch access denied" });
    }
  }
  const configured = await db.select({ id: branches.id }).from(branches).innerJoin(branchJurisdictions, eq(branchJurisdictions.branchId, branches.id)).innerJoin(jurisdictionProfiles, eq(jurisdictionProfiles.id, branchJurisdictions.jurisdictionId)).where(and(eq(branches.organizationId, organizationId), eq(branchJurisdictions.jurisdictionId, jurisdictionId), eq(jurisdictionProfiles.countryCode, "EG"), eq(jurisdictionProfiles.active, 1), branchId === undefined ? undefined : eq(branches.id, branchId))).limit(1);
  if (!configured.length) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Active Egypt jurisdiction and branch configuration is required" });
}

async function assertAppointmentWriter(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId: number, role: string, organizationId: number, jurisdictionId: number, branchId: number) {
  await assertEgyptScope(db, userId, role, organizationId, jurisdictionId, branchId);
  if (role === "admin") return;
  const membership = await db.select({ organizationRole: organizationMemberships.organizationRole }).from(organizationMemberships).where(and(eq(organizationMemberships.organizationId, organizationId), eq(organizationMemberships.userId, userId), eq(organizationMemberships.active, 1))).limit(1);
  if (!membership.length || !["org_admin", "clinical_lead", "operations_manager"].includes(membership[0].organizationRole)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Appointment scheduling permission denied" });
  }
}

async function assertBillingWriter(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId: number, role: string, organizationId: number, jurisdictionId: number, branchId: number) {
  await assertEgyptScope(db, userId, role, organizationId, jurisdictionId, branchId);
  if (role === "admin") return;
  const membership = await db.select({ organizationRole: organizationMemberships.organizationRole }).from(organizationMemberships).where(and(eq(organizationMemberships.organizationId, organizationId), eq(organizationMemberships.userId, userId), eq(organizationMemberships.active, 1))).limit(1);
  if (!membership.length || !["org_admin", "operations_manager"].includes(membership[0].organizationRole)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Internal billing-account permission denied" });
  }
}

async function assertAppointmentReferencesInScope(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, input: { organizationId: number; jurisdictionId: number; branchId: number; patientId: number; facilityId: number }) {
  const [patient, facility] = await Promise.all([
    db.select({ id: healthcarePatients.id }).from(healthcarePatients).where(and(eq(healthcarePatients.id, input.patientId), eq(healthcarePatients.organizationId, input.organizationId), eq(healthcarePatients.jurisdictionId, input.jurisdictionId), eq(healthcarePatients.branchId, input.branchId), eq(healthcarePatients.active, 1))).limit(1),
    db.select({ id: healthcareFacilities.id }).from(healthcareFacilities).where(and(eq(healthcareFacilities.id, input.facilityId), eq(healthcareFacilities.organizationId, input.organizationId), eq(healthcareFacilities.jurisdictionId, input.jurisdictionId), eq(healthcareFacilities.branchId, input.branchId), eq(healthcareFacilities.active, 1))).limit(1),
  ]);
  if (!patient.length || !facility.length) throw new TRPCError({ code: "NOT_FOUND", message: "Patient or facility is not available in the active appointment scope" });
}

async function assertBillingReferencesInScope(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, input: { organizationId: number; jurisdictionId: number; branchId: number; patientId: number; facilityId: number; encounterId?: number }) {
  const [patient, facility] = await Promise.all([
    db.select({ id: healthcarePatients.id }).from(healthcarePatients).where(and(eq(healthcarePatients.id, input.patientId), eq(healthcarePatients.organizationId, input.organizationId), eq(healthcarePatients.jurisdictionId, input.jurisdictionId), eq(healthcarePatients.branchId, input.branchId), eq(healthcarePatients.active, 1))).limit(1),
    db.select({ id: healthcareFacilities.id }).from(healthcareFacilities).where(and(eq(healthcareFacilities.id, input.facilityId), eq(healthcareFacilities.organizationId, input.organizationId), eq(healthcareFacilities.jurisdictionId, input.jurisdictionId), eq(healthcareFacilities.branchId, input.branchId), eq(healthcareFacilities.active, 1))).limit(1),
  ]);
  if (!patient.length || !facility.length) throw new TRPCError({ code: "NOT_FOUND", message: "Patient or facility is not available in the active billing scope" });
  if (input.encounterId === undefined) return;
  const encounter = await db.select({ id: healthcareEncounters.id }).from(healthcareEncounters).where(and(eq(healthcareEncounters.id, input.encounterId), eq(healthcareEncounters.organizationId, input.organizationId), eq(healthcareEncounters.jurisdictionId, input.jurisdictionId), eq(healthcareEncounters.branchId, input.branchId), eq(healthcareEncounters.patientId, input.patientId), eq(healthcareEncounters.facilityId, input.facilityId))).limit(1);
  if (!encounter.length) throw new TRPCError({ code: "NOT_FOUND", message: "Encounter is not available in the active billing scope" });
}

function dbOrThrow(db: Awaited<ReturnType<typeof getDb>>) {
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
  return db;
}

type AppointmentAuditWriter = Pick<NonNullable<Awaited<ReturnType<typeof getDb>>>, "select" | "insert">;
type AppointmentAuditAction = "healthcare_appointment_confirmed" | "healthcare_appointment_cancelled" | "healthcare_appointment_no_show" | "healthcare_appointment_checked_in" | "healthcare_appointment_completed";

async function writeAppointmentStatusAudit(db: AppointmentAuditWriter, input: { userId: number; organizationId: number; jurisdictionId: number; branchId: number; appointmentId: number; action: AppointmentAuditAction }) {
  const previous = await db.select({ recordHash: auditLogs.recordHash }).from(auditLogs).where(and(
    eq(auditLogs.organizationId, input.organizationId),
    eq(auditLogs.branchId, input.branchId),
    eq(auditLogs.jurisdictionId, input.jurisdictionId),
  )).orderBy(desc(auditLogs.id)).limit(1);
  const previousHash = previous[0]?.recordHash ?? null;
  const createdAt = new Date().toISOString();
  const recordHash = hashAuditRecord({
    previousHash,
    eventType: input.action,
    userId: input.userId,
    organizationId: input.organizationId,
    branchId: input.branchId,
    jurisdictionId: input.jurisdictionId,
    requestId: `healthcare-appointment:${input.appointmentId}`,
    createdAt,
  });
  await db.insert(auditLogs).values({
    userId: input.userId,
    organizationId: input.organizationId,
    branchId: input.branchId,
    jurisdictionId: input.jurisdictionId,
    action: input.action,
    entityType: "healthcare_appointment",
    entityId: String(input.appointmentId),
    previousHash,
    recordHash,
  });
}

export const egyptHealthcareRouter = router({
  facilities: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive().optional(), facilityType: facilityType.optional() })).query(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const filters = [eq(healthcareFacilities.organizationId, input.organizationId), eq(healthcareFacilities.jurisdictionId, input.jurisdictionId), input.branchId ? eq(healthcareFacilities.branchId, input.branchId) : undefined, input.facilityType ? eq(healthcareFacilities.facilityType, input.facilityType) : undefined].filter(Boolean) as any[];
    return db.select().from(healthcareFacilities).where(and(...filters)).orderBy(desc(healthcareFacilities.updatedAt)).limit(200);
  }),

  createFacility: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), facilityType, licenseReference: z.string().max(160).optional(), accreditationReference: z.string().max(160).optional() })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const inserted = await db.insert(healthcareFacilities).values({ ...input, createdByUserId: ctx.user.id, licensingStatus: "unverified", accreditationStatus: "not_ready" });
    return { facilityId: Number(inserted[0].insertId), externalVerification: "blocked" as const };
  }),

  appointments: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), status: z.enum(["requested", "confirmed", "checked_in", "completed", "cancelled", "no_show"]).optional() })).query(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    return db.select().from(healthcareAppointments).where(and(eq(healthcareAppointments.organizationId, input.organizationId), eq(healthcareAppointments.jurisdictionId, input.jurisdictionId), eq(healthcareAppointments.branchId, input.branchId), input.status ? eq(healthcareAppointments.status, input.status) : undefined)).orderBy(desc(healthcareAppointments.scheduledAt)).limit(200);
  }),

  createAppointment: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), patientId: z.number().int().positive(), facilityId: z.number().int().positive(), specialty: z.string().trim().min(2).max(120), scheduledAt: z.date() })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertAppointmentWriter(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    await assertAppointmentReferencesInScope(db, input);
    const inserted = await db.insert(healthcareAppointments).values({ ...input, status: "requested", createdByUserId: ctx.user.id });
    return { appointmentId: Number(inserted[0].insertId), status: "requested" as const, externalScheduling: "blocked" as const };
  }),

  confirmAppointment: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), appointmentId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertAppointmentWriter(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const appointment = await db.select({ id: healthcareAppointments.id, status: healthcareAppointments.status }).from(healthcareAppointments).where(and(eq(healthcareAppointments.id, input.appointmentId), eq(healthcareAppointments.organizationId, input.organizationId), eq(healthcareAppointments.jurisdictionId, input.jurisdictionId), eq(healthcareAppointments.branchId, input.branchId))).limit(1);
    if (!appointment.length) throw new TRPCError({ code: "NOT_FOUND", message: "Appointment is not available in the active scope" });
    if (appointment[0].status !== "requested") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Only a requested internal appointment can be confirmed" });
    const confirmed = await db.transaction(async tx => {
      const updated = await tx.update(healthcareAppointments).set({ status: "confirmed" }).where(and(eq(healthcareAppointments.id, input.appointmentId), eq(healthcareAppointments.organizationId, input.organizationId), eq(healthcareAppointments.jurisdictionId, input.jurisdictionId), eq(healthcareAppointments.branchId, input.branchId), eq(healthcareAppointments.status, "requested")));
      if (updated[0].affectedRows !== 1) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Appointment confirmation could not be completed" });
      const confirmed = await tx.select({ id: healthcareAppointments.id, status: healthcareAppointments.status }).from(healthcareAppointments).where(and(eq(healthcareAppointments.id, input.appointmentId), eq(healthcareAppointments.organizationId, input.organizationId), eq(healthcareAppointments.jurisdictionId, input.jurisdictionId), eq(healthcareAppointments.branchId, input.branchId))).limit(1);
      if (!confirmed.length || confirmed[0].status !== "confirmed") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Appointment confirmation could not be completed" });
      await writeAppointmentStatusAudit(tx, { userId: ctx.user.id, organizationId: input.organizationId, jurisdictionId: input.jurisdictionId, branchId: input.branchId, appointmentId: input.appointmentId, action: "healthcare_appointment_confirmed" });
      return confirmed[0];
    });
    return { appointmentId: confirmed.id, status: "confirmed" as const, externalScheduling: "blocked" as const };
  }),

  cancelAppointment: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), appointmentId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertAppointmentWriter(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const appointment = await db.select({ id: healthcareAppointments.id, status: healthcareAppointments.status }).from(healthcareAppointments).where(and(eq(healthcareAppointments.id, input.appointmentId), eq(healthcareAppointments.organizationId, input.organizationId), eq(healthcareAppointments.jurisdictionId, input.jurisdictionId), eq(healthcareAppointments.branchId, input.branchId))).limit(1);
    if (!appointment.length) throw new TRPCError({ code: "NOT_FOUND", message: "Appointment is not available in the active scope" });
    if (appointment[0].status !== "requested" && appointment[0].status !== "confirmed") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Only a requested or confirmed internal appointment can be cancelled" });
    const cancelled = await db.transaction(async tx => {
      const updated = await tx.update(healthcareAppointments).set({ status: "cancelled" }).where(and(eq(healthcareAppointments.id, input.appointmentId), eq(healthcareAppointments.organizationId, input.organizationId), eq(healthcareAppointments.jurisdictionId, input.jurisdictionId), eq(healthcareAppointments.branchId, input.branchId), or(eq(healthcareAppointments.status, "requested"), eq(healthcareAppointments.status, "confirmed"))));
      if (updated[0].affectedRows !== 1) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Appointment cancellation could not be completed" });
      const cancelled = await tx.select({ id: healthcareAppointments.id, status: healthcareAppointments.status }).from(healthcareAppointments).where(and(eq(healthcareAppointments.id, input.appointmentId), eq(healthcareAppointments.organizationId, input.organizationId), eq(healthcareAppointments.jurisdictionId, input.jurisdictionId), eq(healthcareAppointments.branchId, input.branchId))).limit(1);
      if (!cancelled.length || cancelled[0].status !== "cancelled") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Appointment cancellation could not be completed" });
      await writeAppointmentStatusAudit(tx, { userId: ctx.user.id, organizationId: input.organizationId, jurisdictionId: input.jurisdictionId, branchId: input.branchId, appointmentId: input.appointmentId, action: "healthcare_appointment_cancelled" });
      return cancelled[0];
    });
    return { appointmentId: cancelled.id, status: "cancelled" as const, externalScheduling: "blocked" as const };
  }),

  markAppointmentNoShow: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), appointmentId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertAppointmentWriter(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const appointment = await db.select({ id: healthcareAppointments.id, status: healthcareAppointments.status }).from(healthcareAppointments).where(and(eq(healthcareAppointments.id, input.appointmentId), eq(healthcareAppointments.organizationId, input.organizationId), eq(healthcareAppointments.jurisdictionId, input.jurisdictionId), eq(healthcareAppointments.branchId, input.branchId))).limit(1);
    if (!appointment.length) throw new TRPCError({ code: "NOT_FOUND", message: "Appointment is not available in the active scope" });
    if (appointment[0].status !== "confirmed") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Only a confirmed internal appointment can be marked as no-show" });
    const noShow = await db.transaction(async tx => {
      const updated = await tx.update(healthcareAppointments).set({ status: "no_show" }).where(and(eq(healthcareAppointments.id, input.appointmentId), eq(healthcareAppointments.organizationId, input.organizationId), eq(healthcareAppointments.jurisdictionId, input.jurisdictionId), eq(healthcareAppointments.branchId, input.branchId), eq(healthcareAppointments.status, "confirmed")));
      if (updated[0].affectedRows !== 1) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Appointment no-show update could not be completed" });
      const noShow = await tx.select({ id: healthcareAppointments.id, status: healthcareAppointments.status }).from(healthcareAppointments).where(and(eq(healthcareAppointments.id, input.appointmentId), eq(healthcareAppointments.organizationId, input.organizationId), eq(healthcareAppointments.jurisdictionId, input.jurisdictionId), eq(healthcareAppointments.branchId, input.branchId))).limit(1);
      if (!noShow.length || noShow[0].status !== "no_show") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Appointment no-show update could not be completed" });
      await writeAppointmentStatusAudit(tx, { userId: ctx.user.id, organizationId: input.organizationId, jurisdictionId: input.jurisdictionId, branchId: input.branchId, appointmentId: input.appointmentId, action: "healthcare_appointment_no_show" });
      return noShow[0];
    });
    return { appointmentId: noShow.id, status: "no_show" as const, externalScheduling: "blocked" as const };
  }),

  checkInAppointment: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), appointmentId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertAppointmentWriter(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const appointment = await db.select({ id: healthcareAppointments.id, status: healthcareAppointments.status }).from(healthcareAppointments).where(and(eq(healthcareAppointments.id, input.appointmentId), eq(healthcareAppointments.organizationId, input.organizationId), eq(healthcareAppointments.jurisdictionId, input.jurisdictionId), eq(healthcareAppointments.branchId, input.branchId))).limit(1);
    if (!appointment.length) throw new TRPCError({ code: "NOT_FOUND", message: "Appointment is not available in the active scope" });
    if (appointment[0].status !== "confirmed") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Only a confirmed internal appointment can be checked in" });
    const checkedIn = await db.transaction(async tx => {
      const updated = await tx.update(healthcareAppointments).set({ status: "checked_in" }).where(and(eq(healthcareAppointments.id, input.appointmentId), eq(healthcareAppointments.organizationId, input.organizationId), eq(healthcareAppointments.jurisdictionId, input.jurisdictionId), eq(healthcareAppointments.branchId, input.branchId), eq(healthcareAppointments.status, "confirmed")));
      if (updated[0].affectedRows !== 1) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Appointment check-in could not be completed" });
      const checkedIn = await tx.select({ id: healthcareAppointments.id, status: healthcareAppointments.status }).from(healthcareAppointments).where(and(eq(healthcareAppointments.id, input.appointmentId), eq(healthcareAppointments.organizationId, input.organizationId), eq(healthcareAppointments.jurisdictionId, input.jurisdictionId), eq(healthcareAppointments.branchId, input.branchId))).limit(1);
      if (!checkedIn.length || checkedIn[0].status !== "checked_in") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Appointment check-in could not be completed" });
      await writeAppointmentStatusAudit(tx, { userId: ctx.user.id, organizationId: input.organizationId, jurisdictionId: input.jurisdictionId, branchId: input.branchId, appointmentId: input.appointmentId, action: "healthcare_appointment_checked_in" });
      return checkedIn[0];
    });
    return { appointmentId: checkedIn.id, status: "checked_in" as const, externalScheduling: "blocked" as const };
  }),

  completeAppointment: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), appointmentId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertAppointmentWriter(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const appointment = await db.select({ id: healthcareAppointments.id, status: healthcareAppointments.status }).from(healthcareAppointments).where(and(eq(healthcareAppointments.id, input.appointmentId), eq(healthcareAppointments.organizationId, input.organizationId), eq(healthcareAppointments.jurisdictionId, input.jurisdictionId), eq(healthcareAppointments.branchId, input.branchId))).limit(1);
    if (!appointment.length) throw new TRPCError({ code: "NOT_FOUND", message: "Appointment is not available in the active scope" });
    if (appointment[0].status !== "checked_in") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Only a checked-in internal appointment can be completed" });
    const completed = await db.transaction(async tx => {
      const updated = await tx.update(healthcareAppointments).set({ status: "completed" }).where(and(eq(healthcareAppointments.id, input.appointmentId), eq(healthcareAppointments.organizationId, input.organizationId), eq(healthcareAppointments.jurisdictionId, input.jurisdictionId), eq(healthcareAppointments.branchId, input.branchId), eq(healthcareAppointments.status, "checked_in")));
      if (updated[0].affectedRows !== 1) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Appointment completion could not be completed" });
      const completed = await tx.select({ id: healthcareAppointments.id, status: healthcareAppointments.status }).from(healthcareAppointments).where(and(eq(healthcareAppointments.id, input.appointmentId), eq(healthcareAppointments.organizationId, input.organizationId), eq(healthcareAppointments.jurisdictionId, input.jurisdictionId), eq(healthcareAppointments.branchId, input.branchId))).limit(1);
      if (!completed.length || completed[0].status !== "completed") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Appointment completion could not be completed" });
      await writeAppointmentStatusAudit(tx, { userId: ctx.user.id, organizationId: input.organizationId, jurisdictionId: input.jurisdictionId, branchId: input.branchId, appointmentId: input.appointmentId, action: "healthcare_appointment_completed" });
      return completed[0];
    });
    return { appointmentId: completed.id, status: "completed" as const, externalScheduling: "blocked" as const };
  }),

  encounters: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), status: z.enum(["scheduled", "arrived", "in_progress", "referred", "admitted", "discharged", "cancelled"]).optional() })).query(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    return db.select({ id: healthcareEncounters.id, patientId: healthcareEncounters.patientId, facilityId: healthcareEncounters.facilityId, encounterType: healthcareEncounters.encounterType, status: healthcareEncounters.status, attendingUserId: healthcareEncounters.attendingUserId, startedAt: healthcareEncounters.startedAt, endedAt: healthcareEncounters.endedAt, createdAt: healthcareEncounters.createdAt }).from(healthcareEncounters).where(and(eq(healthcareEncounters.organizationId, input.organizationId), eq(healthcareEncounters.jurisdictionId, input.jurisdictionId), eq(healthcareEncounters.branchId, input.branchId), input.status ? eq(healthcareEncounters.status, input.status) : undefined)).orderBy(desc(healthcareEncounters.createdAt)).limit(200);
  }),

  claims: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), status: claimStatus.optional() })).query(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    return db.select({ id: insuranceClaims.id, claimNumber: insuranceClaims.claimNumber, payerCode: insuranceClaims.payerCode, status: insuranceClaims.status, credentialGate: insuranceClaims.credentialGate, totalAmount: insuranceClaims.totalAmount, approvedAmount: insuranceClaims.approvedAmount, externalReference: insuranceClaims.externalReference, createdAt: insuranceClaims.createdAt, updatedAt: insuranceClaims.updatedAt }).from(insuranceClaims).where(and(eq(insuranceClaims.organizationId, input.organizationId), eq(insuranceClaims.jurisdictionId, input.jurisdictionId), eq(insuranceClaims.branchId, input.branchId), input.status ? eq(insuranceClaims.status, input.status) : undefined)).orderBy(desc(insuranceClaims.updatedAt)).limit(200);
  }),

  createClaim: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), patientId: z.number().int().positive(), memberId: z.number().int().positive().optional(), encounterId: z.number().int().positive().optional(), payerCode: z.string().regex(/^[A-Z0-9._-]{2,80}$/i), claimNumber: z.string().min(3).max(120), idempotencyKey: z.string().min(8).max(180), totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/) })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const existing = await db.select({ id: insuranceClaims.id }).from(insuranceClaims).where(eq(insuranceClaims.idempotencyKey, input.idempotencyKey)).limit(1);
    if (existing.length) return { claimId: existing[0].id, reused: true, externalSubmission: "blocked" as const };
    const inserted = await db.insert(insuranceClaims).values({ ...input, credentialGate: "not_configured", status: "draft", createdByUserId: ctx.user.id });
    return { claimId: Number(inserted[0].insertId), reused: false, externalSubmission: "blocked" as const };
  }),

  patients: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    return db.select({ id: healthcarePatients.id, branchId: healthcarePatients.branchId, localMedicalRecordNumber: healthcarePatients.localMedicalRecordNumber, sex: healthcarePatients.sex, consentStatus: healthcarePatients.consentStatus, active: healthcarePatients.active, createdAt: healthcarePatients.createdAt }).from(healthcarePatients).where(and(eq(healthcarePatients.organizationId, input.organizationId), eq(healthcarePatients.jurisdictionId, input.jurisdictionId), eq(healthcarePatients.branchId, input.branchId), eq(healthcarePatients.active, 1))).orderBy(desc(healthcarePatients.updatedAt)).limit(200);
  }),

  createPatient: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), localMedicalRecordNumber: z.string().min(2).max(80), fullName: z.string().min(2).max(200), dateOfBirth: z.string().max(40).optional(), sex: z.enum(["female", "male", "intersex", "unknown"]).default("unknown"), nationalId: z.string().max(40).optional(), phone: z.string().max(40).optional() })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const inserted = await db.insert(healthcarePatients).values({ organizationId: input.organizationId, jurisdictionId: input.jurisdictionId, branchId: input.branchId, localMedicalRecordNumber: input.localMedicalRecordNumber, fullNameEncrypted: encryptPatientValue(input.fullName), dateOfBirthEncrypted: input.dateOfBirth ? encryptPatientValue(input.dateOfBirth) : null, sex: input.sex, nationalIdHash: input.nationalId ? createHash("sha256").update(input.nationalId).digest("hex") : null, phoneHash: input.phone ? createHash("sha256").update(input.phone).digest("hex") : null, createdByUserId: ctx.user.id });
    return { patientId: Number(inserted[0].insertId), sensitiveFields: "encrypted" as const };
  }),

  referrals: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    return db.select({ id: healthcareReferrals.id, patientId: healthcareReferrals.patientId, encounterId: healthcareReferrals.encounterId, fromBranchId: healthcareReferrals.fromBranchId, toBranchId: healthcareReferrals.toBranchId, specialty: healthcareReferrals.specialty, status: healthcareReferrals.status, createdAt: healthcareReferrals.createdAt, updatedAt: healthcareReferrals.updatedAt }).from(healthcareReferrals).where(and(eq(healthcareReferrals.organizationId, input.organizationId), eq(healthcareReferrals.jurisdictionId, input.jurisdictionId), eq(healthcareReferrals.fromBranchId, input.branchId))).orderBy(desc(healthcareReferrals.updatedAt)).limit(200);
  }),

  members: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId);
    return db.select({ id: insuranceMembers.id, patientId: insuranceMembers.patientId, payerCode: insuranceMembers.payerCode, eligibilityStatus: insuranceMembers.eligibilityStatus, sourceStatus: insuranceMembers.sourceStatus, lastVerifiedAt: insuranceMembers.lastVerifiedAt, createdAt: insuranceMembers.createdAt }).from(insuranceMembers).where(and(eq(insuranceMembers.organizationId, input.organizationId), eq(insuranceMembers.jurisdictionId, input.jurisdictionId))).orderBy(desc(insuranceMembers.updatedAt)).limit(200);
  }),

  createBed: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), facilityId: z.number().int().positive(), wardCode: z.string().min(1).max(80), bedCode: z.string().min(1).max(80) })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const inserted = await db.insert(healthcareBeds).values({ ...input, status: "available" });
    return { bedId: Number(inserted[0].insertId) };
  }),

  createAdmission: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), patientId: z.number().int().positive(), encounterId: z.number().int().positive(), bedId: z.number().int().positive().optional(), admissionType: z.enum(["planned", "emergency", "observation", "transfer"]) })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const inserted = await db.insert(healthcareAdmissions).values({ ...input, status: "requested", createdByUserId: ctx.user.id });
    return { admissionId: Number(inserted[0].insertId), externalAdmission: "blocked" as const };
  }),

  createClinicalOrder: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), patientId: z.number().int().positive(), encounterId: z.number().int().positive(), orderType: z.enum(["lab", "radiology", "medication", "procedure", "referral"]), serviceCode: z.string().min(1).max(120) })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const inserted = await db.insert(healthcareClinicalOrders).values({ ...input, status: "requested", orderedByUserId: ctx.user.id });
    return { orderId: Number(inserted[0].insertId), externalOrder: "blocked" as const };
  }),

  createPayerContract: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), payerCode: z.string().min(2).max(80), contractReference: z.string().min(2).max(120) })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId);
    const inserted = await db.insert(insurancePayerContracts).values({ ...input, status: "draft", credentialGate: "not_configured", createdByUserId: ctx.user.id });
    return { contractId: Number(inserted[0].insertId), externalContract: "blocked" as const };
  }),

  createPreauthorization: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), patientId: z.number().int().positive(), encounterId: z.number().int().positive().optional(), payerCode: z.string().min(2).max(80), requestNumber: z.string().min(2).max(120), idempotencyKey: z.string().min(8).max(180), requestedAmount: z.string().regex(/^\d+(\.\d{1,2})?$/) })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const existing = await db.select({ id: insurancePreauthorizations.id }).from(insurancePreauthorizations).where(eq(insurancePreauthorizations.idempotencyKey, input.idempotencyKey)).limit(1);
    if (existing.length) return { preauthorizationId: existing[0].id, reused: true, externalSubmission: "blocked" as const };
    const inserted = await db.insert(insurancePreauthorizations).values({ ...input, status: "draft", credentialGate: "not_configured", createdByUserId: ctx.user.id });
    return { preauthorizationId: Number(inserted[0].insertId), reused: false, externalSubmission: "blocked" as const };
  }),

  createRemittance: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), payerCode: z.string().min(2).max(80), remittanceReference: z.string().min(2).max(120), amount: z.string().regex(/^\d+(\.\d{1,2})?$/) })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const inserted = await db.insert(insuranceRemittances).values({ ...input, status: "draft", credentialGate: "not_configured", createdByUserId: ctx.user.id });
    return { remittanceId: Number(inserted[0].insertId), externalSubmission: "blocked" as const };
  }),

  createAppeal: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), claimId: z.number().int().positive(), reason: z.string().min(3).max(5000) })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const inserted = await db.insert(insuranceAppeals).values({ organizationId: input.organizationId, jurisdictionId: input.jurisdictionId, branchId: input.branchId, claimId: input.claimId, reasonEncrypted: encryptPatientValue(input.reason), status: "draft", credentialGate: "not_configured", createdByUserId: ctx.user.id });
    return { appealId: Number(inserted[0].insertId), externalSubmission: "blocked" as const };
  }),

  beds: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    return db.select().from(healthcareBeds).where(and(eq(healthcareBeds.organizationId, input.organizationId), eq(healthcareBeds.jurisdictionId, input.jurisdictionId), eq(healthcareBeds.branchId, input.branchId))).orderBy(healthcareBeds.wardCode, healthcareBeds.bedCode).limit(500);
  }),

  admissions: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    return db.select().from(healthcareAdmissions).where(and(eq(healthcareAdmissions.organizationId, input.organizationId), eq(healthcareAdmissions.jurisdictionId, input.jurisdictionId), eq(healthcareAdmissions.branchId, input.branchId))).orderBy(desc(healthcareAdmissions.updatedAt)).limit(200);
  }),

  clinicalOrders: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    return db.select({ id: healthcareClinicalOrders.id, patientId: healthcareClinicalOrders.patientId, encounterId: healthcareClinicalOrders.encounterId, orderType: healthcareClinicalOrders.orderType, serviceCode: healthcareClinicalOrders.serviceCode, status: healthcareClinicalOrders.status, createdAt: healthcareClinicalOrders.createdAt }).from(healthcareClinicalOrders).where(and(eq(healthcareClinicalOrders.organizationId, input.organizationId), eq(healthcareClinicalOrders.jurisdictionId, input.jurisdictionId), eq(healthcareClinicalOrders.branchId, input.branchId))).orderBy(desc(healthcareClinicalOrders.updatedAt)).limit(200);
  }),

  payerContracts: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId);
    return db.select({ id: insurancePayerContracts.id, payerCode: insurancePayerContracts.payerCode, contractReference: insurancePayerContracts.contractReference, status: insurancePayerContracts.status, credentialGate: insurancePayerContracts.credentialGate, effectiveFrom: insurancePayerContracts.effectiveFrom, effectiveTo: insurancePayerContracts.effectiveTo }).from(insurancePayerContracts).where(and(eq(insurancePayerContracts.organizationId, input.organizationId), eq(insurancePayerContracts.jurisdictionId, input.jurisdictionId))).orderBy(desc(insurancePayerContracts.updatedAt)).limit(200);
  }),

  preauthorizations: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    return db.select({ id: insurancePreauthorizations.id, patientId: insurancePreauthorizations.patientId, payerCode: insurancePreauthorizations.payerCode, requestNumber: insurancePreauthorizations.requestNumber, status: insurancePreauthorizations.status, credentialGate: insurancePreauthorizations.credentialGate, requestedAmount: insurancePreauthorizations.requestedAmount, approvedAmount: insurancePreauthorizations.approvedAmount }).from(insurancePreauthorizations).where(and(eq(insurancePreauthorizations.organizationId, input.organizationId), eq(insurancePreauthorizations.jurisdictionId, input.jurisdictionId), eq(insurancePreauthorizations.branchId, input.branchId))).orderBy(desc(insurancePreauthorizations.updatedAt)).limit(200);
  }),

  remittances: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    return db.select({ id: insuranceRemittances.id, payerCode: insuranceRemittances.payerCode, remittanceReference: insuranceRemittances.remittanceReference, status: insuranceRemittances.status, credentialGate: insuranceRemittances.credentialGate, amount: insuranceRemittances.amount }).from(insuranceRemittances).where(and(eq(insuranceRemittances.organizationId, input.organizationId), eq(insuranceRemittances.jurisdictionId, input.jurisdictionId), eq(insuranceRemittances.branchId, input.branchId))).orderBy(desc(insuranceRemittances.updatedAt)).limit(200);
  }),

  appeals: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    return db.select({ id: insuranceAppeals.id, claimId: insuranceAppeals.claimId, status: insuranceAppeals.status, credentialGate: insuranceAppeals.credentialGate, externalReference: insuranceAppeals.externalReference, createdAt: insuranceAppeals.createdAt }).from(insuranceAppeals).where(and(eq(insuranceAppeals.organizationId, input.organizationId), eq(insuranceAppeals.jurisdictionId, input.jurisdictionId), eq(insuranceAppeals.branchId, input.branchId))).orderBy(desc(insuranceAppeals.updatedAt)).limit(200);
  }),

  billingAccounts: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    return db.select({ id: hospitalBillingAccounts.id, facilityId: hospitalBillingAccounts.facilityId, patientId: hospitalBillingAccounts.patientId, encounterId: hospitalBillingAccounts.encounterId, payerType: hospitalBillingAccounts.payerType, packageCode: hospitalBillingAccounts.packageCode, status: hospitalBillingAccounts.status, approvalStatus: hospitalBillingAccounts.approvalStatus, depositAmount: hospitalBillingAccounts.depositAmount, billedAmount: hospitalBillingAccounts.billedAmount, paidAmount: hospitalBillingAccounts.paidAmount, externalInvoiceGate: hospitalBillingAccounts.externalInvoiceGate }).from(hospitalBillingAccounts).where(and(eq(hospitalBillingAccounts.organizationId, input.organizationId), eq(hospitalBillingAccounts.jurisdictionId, input.jurisdictionId), eq(hospitalBillingAccounts.branchId, input.branchId))).orderBy(desc(hospitalBillingAccounts.updatedAt)).limit(200);
  }),

  clinicOperationsSummary: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const scopedAppointments = and(eq(healthcareAppointments.organizationId, input.organizationId), eq(healthcareAppointments.jurisdictionId, input.jurisdictionId), eq(healthcareAppointments.branchId, input.branchId));
    const scopedBillingAccounts = and(eq(hospitalBillingAccounts.organizationId, input.organizationId), eq(hospitalBillingAccounts.jurisdictionId, input.jurisdictionId), eq(hospitalBillingAccounts.branchId, input.branchId));
    const [appointments, requestedAppointments, confirmedAppointments, cancelledAppointments, noShowAppointments, checkedInAppointments, completedAppointments, billingAccounts, pendingBillingAccounts] = await Promise.all([
      db.select({ total: count() }).from(healthcareAppointments).where(scopedAppointments),
      db.select({ total: count() }).from(healthcareAppointments).where(and(scopedAppointments, eq(healthcareAppointments.status, "requested"))),
      db.select({ total: count() }).from(healthcareAppointments).where(and(scopedAppointments, eq(healthcareAppointments.status, "confirmed"))),
      db.select({ total: count() }).from(healthcareAppointments).where(and(scopedAppointments, eq(healthcareAppointments.status, "cancelled"))),
      db.select({ total: count() }).from(healthcareAppointments).where(and(scopedAppointments, eq(healthcareAppointments.status, "no_show"))),
      db.select({ total: count() }).from(healthcareAppointments).where(and(scopedAppointments, eq(healthcareAppointments.status, "checked_in"))),
      db.select({ total: count() }).from(healthcareAppointments).where(and(scopedAppointments, eq(healthcareAppointments.status, "completed"))),
      db.select({ total: count() }).from(hospitalBillingAccounts).where(scopedBillingAccounts),
      db.select({ total: count() }).from(hospitalBillingAccounts).where(and(scopedBillingAccounts, eq(hospitalBillingAccounts.approvalStatus, "pending"))),
    ]);
    return {
      generatedAt: new Date().toISOString(),
      appointments: {
        total: Number(appointments[0]?.total ?? 0),
        requested: Number(requestedAppointments[0]?.total ?? 0),
        confirmed: Number(confirmedAppointments[0]?.total ?? 0),
        cancelled: Number(cancelledAppointments[0]?.total ?? 0),
        noShow: Number(noShowAppointments[0]?.total ?? 0),
        checkedIn: Number(checkedInAppointments[0]?.total ?? 0),
        completed: Number(completedAppointments[0]?.total ?? 0),
      },
      billingAccounts: { total: Number(billingAccounts[0]?.total ?? 0), pendingApproval: Number(pendingBillingAccounts[0]?.total ?? 0) },
      externalOperations: "blocked" as const,
    };
  }),

  createBillingAccount: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), facilityId: z.number().int().positive(), patientId: z.number().int().positive(), encounterId: z.number().int().positive().optional(), payerType: z.enum(["self_pay", "insurance", "government", "employer"]), packageCode: z.string().max(120).optional(), depositAmount: z.string().regex(/^\\d+(\\.\\d{1,2})?$/).optional(), billedAmount: z.string().regex(/^\\d+(\\.\\d{1,2})?$/).optional() })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertBillingWriter(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    await assertBillingReferencesInScope(db, input);
    const inserted = await db.insert(hospitalBillingAccounts).values({ ...input, depositAmount: input.depositAmount ?? "0", billedAmount: input.billedAmount ?? "0", createdByUserId: ctx.user.id, externalInvoiceGate: "not_configured" });
    return { billingAccountId: Number(inserted[0].insertId), externalInvoiceSubmission: "blocked" as const };
  }),

  transitionBillingAccount: protectedProcedure.input(z.object({ billingAccountId: z.number().int().positive(), toStatus: z.enum(["draft", "pending_approval", "approved", "partially_paid", "paid", "disputed", "cancelled"]), approvalStatus: z.enum(["not_required", "pending", "approved", "rejected"]).optional() })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    const row = (await db.select().from(hospitalBillingAccounts).where(eq(hospitalBillingAccounts.id, input.billingAccountId)).limit(1))[0];
    if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Hospital billing account not found" });
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, row.organizationId, row.jurisdictionId, row.branchId);
    if (["approved", "paid"].includes(input.toStatus) && ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Authorized approval is required" });
    await db.update(hospitalBillingAccounts).set({ status: input.toStatus, approvalStatus: input.approvalStatus ?? row.approvalStatus }).where(and(eq(hospitalBillingAccounts.id, row.id), eq(hospitalBillingAccounts.organizationId, row.organizationId), eq(hospitalBillingAccounts.branchId, row.branchId)));
    return { success: true, status: input.toStatus, externalInvoiceSubmission: "blocked" as const };
  }),

  transitionClaim: protectedProcedure.input(z.object({ claimId: z.number().int().positive(), toStatus: claimStatus, externalReference: z.string().max(160).optional() })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    const row = (await db.select().from(insuranceClaims).where(eq(insuranceClaims.id, input.claimId)).limit(1))[0];
    if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Insurance claim not found" });
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, row.organizationId, row.jurisdictionId, row.branchId);
    if (["submitted", "received", "under_review", "approved", "partially_approved", "paid", "reconciled"].includes(input.toStatus) && row.credentialGate !== "production_ready") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Official payer credentials and acceptance evidence are required before external claim states" });
    await db.update(insuranceClaims).set({ status: input.toStatus, externalReference: input.externalReference }).where(and(eq(insuranceClaims.id, row.id), eq(insuranceClaims.organizationId, row.organizationId), eq(insuranceClaims.branchId, row.branchId)));
    return { success: true, status: input.toStatus, externalSubmission: "blocked" as const };
  }),

  gaharProfiles: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    return db.select().from(gaharReadinessProfiles).where(and(eq(gaharReadinessProfiles.organizationId, input.organizationId), eq(gaharReadinessProfiles.jurisdictionId, input.jurisdictionId), eq(gaharReadinessProfiles.branchId, input.branchId))).orderBy(desc(gaharReadinessProfiles.updatedAt)).limit(100);
  }),

  createGaharProfile: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), facilityId: z.number().int().positive(), facilityType: z.enum(["government_hospital", "private_hospital", "primary_care", "laboratory", "radiology", "rehabilitation", "mental_health", "extended_care"]), standardFamily: z.string().min(2).max(160), standardVersion: z.string().min(1).max(80), effectiveFrom: z.date().optional(), reviewDueAt: z.date().optional() })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const inserted = await db.insert(gaharReadinessProfiles).values({ ...input, ownerUserId: ctx.user.id, status: "draft", officialSubmissionGate: "not_authorized" });
    return { profileId: Number(inserted[0].insertId), officialSubmission: "blocked" as const };
  }),

  gaharCriteria: protectedProcedure.input(z.object({ profileId: z.number().int().positive(), organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const profile = (await db.select({ id: gaharReadinessProfiles.id }).from(gaharReadinessProfiles).where(and(eq(gaharReadinessProfiles.id, input.profileId), eq(gaharReadinessProfiles.organizationId, input.organizationId), eq(gaharReadinessProfiles.jurisdictionId, input.jurisdictionId), eq(gaharReadinessProfiles.branchId, input.branchId))).limit(1))[0];
    if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "GAHAR readiness profile not found" });
    return db.select().from(gaharCriteria).where(eq(gaharCriteria.profileId, input.profileId)).orderBy(gaharCriteria.domainCode, gaharCriteria.criterionCode).limit(500);
  }),

  createGaharCriterion: protectedProcedure.input(z.object({ profileId: z.number().int().positive(), organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), orientation: z.enum(["patient_centered", "organization_centered"]), domainCode: z.string().min(1).max(80), criterionCode: z.string().min(1).max(120), title: z.string().min(2).max(240), requirementSummary: z.string().min(2).max(5000), reviewCycleDays: z.number().int().min(1).max(3650).optional() })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const profile = (await db.select({ id: gaharReadinessProfiles.id }).from(gaharReadinessProfiles).where(and(eq(gaharReadinessProfiles.id, input.profileId), eq(gaharReadinessProfiles.organizationId, input.organizationId), eq(gaharReadinessProfiles.jurisdictionId, input.jurisdictionId), eq(gaharReadinessProfiles.branchId, input.branchId))).limit(1))[0];
    if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "GAHAR readiness profile not found" });
    const inserted = await db.insert(gaharCriteria).values({ profileId: input.profileId, orientation: input.orientation, domainCode: input.domainCode, criterionCode: input.criterionCode, title: input.title, requirementSummary: input.requirementSummary, reviewCycleDays: input.reviewCycleDays ?? 365, status: "not_started" });
    return { criterionId: Number(inserted[0].insertId) };
  }),

  gaharEvidence: protectedProcedure.input(z.object({ profileId: z.number().int().positive(), organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const profile = (await db.select({ id: gaharReadinessProfiles.id }).from(gaharReadinessProfiles).where(and(eq(gaharReadinessProfiles.id, input.profileId), eq(gaharReadinessProfiles.organizationId, input.organizationId), eq(gaharReadinessProfiles.jurisdictionId, input.jurisdictionId), eq(gaharReadinessProfiles.branchId, input.branchId))).limit(1))[0];
    if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "GAHAR readiness profile not found" });
    return db.select({ id: gaharEvidence.id, criterionId: gaharEvidence.criterionId, evidenceType: gaharEvidence.evidenceType, title: gaharEvidence.title, referenceKey: gaharEvidence.referenceKey, verificationStatus: gaharEvidence.verificationStatus, validUntil: gaharEvidence.validUntil }).from(gaharEvidence).where(eq(gaharEvidence.profileId, input.profileId)).orderBy(desc(gaharEvidence.updatedAt)).limit(500);
  }),

  createGaharCorrectiveAction: protectedProcedure.input(z.object({ profileId: z.number().int().positive(), criterionId: z.number().int().positive(), organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive(), title: z.string().min(2).max(240), riskLevel: z.enum(["low", "moderate", "high", "critical"]), ownerUserId: z.number().int().positive(), dueAt: z.date().optional(), resolution: z.string().max(5000).optional() })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const profile = (await db.select({ id: gaharReadinessProfiles.id }).from(gaharReadinessProfiles).where(and(eq(gaharReadinessProfiles.id, input.profileId), eq(gaharReadinessProfiles.organizationId, input.organizationId), eq(gaharReadinessProfiles.jurisdictionId, input.jurisdictionId), eq(gaharReadinessProfiles.branchId, input.branchId))).limit(1))[0];
    if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "GAHAR readiness profile not found" });
    const inserted = await db.insert(gaharCorrectiveActions).values({ profileId: input.profileId, criterionId: input.criterionId, title: input.title, riskLevel: input.riskLevel, ownerUserId: input.ownerUserId, dueAt: input.dueAt, resolutionEncrypted: input.resolution ? encryptPatientValue(input.resolution) : undefined, createdByUserId: ctx.user.id });
    return { actionId: Number(inserted[0].insertId), officialAccreditation: "not_claimed" as const };
  }),

  gaharQualityIndicators: protectedProcedure.input(z.object({ profileId: z.number().int().positive(), organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    const profile = (await db.select({ id: gaharReadinessProfiles.id }).from(gaharReadinessProfiles).where(and(eq(gaharReadinessProfiles.id, input.profileId), eq(gaharReadinessProfiles.organizationId, input.organizationId), eq(gaharReadinessProfiles.jurisdictionId, input.jurisdictionId), eq(gaharReadinessProfiles.branchId, input.branchId))).limit(1))[0];
    if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "GAHAR readiness profile not found" });
    return db.select().from(gaharQualityIndicators).where(eq(gaharQualityIndicators.profileId, input.profileId)).orderBy(desc(gaharQualityIndicators.periodEnd)).limit(500);
  }),

  submitGaharOfficial: protectedProcedure.input(z.object({ profileId: z.number().int().positive(), organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = dbOrThrow(await getDb());
    await assertEgyptScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId, input.branchId);
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "GAHAR official submission remains blocked until written authorization, endpoint specification, test environment, credentials, and acceptance evidence are provided" });
  }),
});

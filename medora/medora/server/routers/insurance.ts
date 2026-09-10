import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { branches, branchJurisdictions, complianceEvidence, compliancePacks, insuranceRequests, jurisdictionProfiles, organizationMemberships } from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { validateInsuranceRequest, type InsuranceRequestStatus } from "../domain/insurance-policy";
import { assertInsuranceTransitionAuthorized, assertPersistedInsuranceTransition, buildInsuranceRequestPayload, hashInsuranceMemberReference } from "../domain/insurance-persistence-policy";
import { assertCompliancePackUsable } from "../domain/regional-engine";

const requestType = z.enum(["ELIGIBILITY", "PREAUTHORIZATION"]);
const statuses = z.enum(["DRAFT", "READY_FOR_SUBMISSION", "SUBMITTED", "APPROVED", "PARTIALLY_APPROVED", "REJECTED", "CANCELLED"]);

async function accessibleOrganizationIds(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId: number, role: string) {
  if (role === "admin") return null;
  const rows = await db.select({ organizationId: organizationMemberships.organizationId }).from(organizationMemberships).where(and(eq(organizationMemberships.userId, userId), eq(organizationMemberships.active, 1)));
  return rows.map(row => row.organizationId);
}

async function assertScope(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId: number, role: string, organizationId: number, jurisdictionId: number) {
  const ids = await accessibleOrganizationIds(db, userId, role);
  if (ids !== null && !ids.includes(organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Organization is outside the active scope" });
  const configured = await db.select({ id: branches.id }).from(branches).innerJoin(branchJurisdictions, eq(branchJurisdictions.branchId, branches.id)).where(and(eq(branches.organizationId, organizationId), eq(branchJurisdictions.jurisdictionId, jurisdictionId))).limit(1);
  if (!configured.length) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Jurisdiction is not configured for this organization" });
  const profile = (await db.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.id, jurisdictionId)).limit(1))[0];
  const pack = (await db.select().from(compliancePacks).where(and(eq(compliancePacks.jurisdictionId, jurisdictionId), eq(compliancePacks.status, "approved"))).orderBy(desc(compliancePacks.createdAt)).limit(1))[0];
  const evidence = pack ? await db.select({ id: complianceEvidence.id }).from(complianceEvidence).where(and(eq(complianceEvidence.packId, pack.id), eq(complianceEvidence.verificationStatus, "verified"))) : [];
  if (!profile || !pack) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Approved insurance compliance pack is required" });
  try { assertCompliancePackUsable({ countryCode: profile.countryCode, active: profile.active === 1, legalAuthorityProfile: profile.legalAuthorityProfile, language: profile.language, defaultLocale: profile.defaultLocale, currencyCode: profile.currencyCode, timezone: profile.timezone, taxProfile: profile.taxProfile, dateFormat: profile.dateFormat, numberSystem: profile.numberSystem }, { jurisdictionId: pack.jurisdictionId, packVersion: pack.packVersion, status: pack.status, effectiveFrom: pack.effectiveFrom, reviewDueAt: pack.reviewDueAt, rules: JSON.parse(pack.rulesJson) as Record<string, boolean>, evidenceCount: evidence.length }, "insurance"); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Insurance compliance policy rejected the request" }); }
}

export const insuranceRouter = router({
  list: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), requestType: requestType.optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await assertScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId);
      const filters = [eq(insuranceRequests.organizationId, input.organizationId), eq(insuranceRequests.jurisdictionId, input.jurisdictionId), input.requestType === undefined ? undefined : eq(insuranceRequests.requestType, input.requestType)].filter(Boolean) as any[];
      return db.select({ id: insuranceRequests.id, organizationId: insuranceRequests.organizationId, jurisdictionId: insuranceRequests.jurisdictionId, requestType: insuranceRequests.requestType, payerCode: insuranceRequests.payerCode, serviceCode: insuranceRequests.serviceCode, status: insuranceRequests.status, externalReference: insuranceRequests.externalReference, credentialGate: insuranceRequests.credentialGate, idempotencyKey: insuranceRequests.idempotencyKey, createdByUserId: insuranceRequests.createdByUserId, createdAt: insuranceRequests.createdAt, updatedAt: insuranceRequests.updatedAt }).from(insuranceRequests).where(and(...filters)).orderBy(desc(insuranceRequests.updatedAt)).limit(100);
    }),

  create: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), requestType, payerCode: z.string().regex(/^[A-Z0-9._-]{2,80}$/i), memberReference: z.string().min(2).max(200), serviceCode: z.string().min(1).max(120), idempotencyKey: z.string().min(8).max(180) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await assertScope(db, ctx.user.id, ctx.user.role, input.organizationId, input.jurisdictionId);
      const request = { requestType: input.requestType, organizationId: input.organizationId, jurisdictionId: input.jurisdictionId, payerCode: input.payerCode, memberReference: input.memberReference, serviceCode: input.serviceCode, status: "DRAFT" as const, credentialGate: "NOT_CONFIGURED" as const };
      try { validateInsuranceRequest(request); } catch { throw new TRPCError({ code: "BAD_REQUEST", message: "Insurance request validation failed" }); }
      const existing = await db.select({ id: insuranceRequests.id }).from(insuranceRequests).where(eq(insuranceRequests.idempotencyKey, input.idempotencyKey)).limit(1);
      if (existing.length) return { requestId: existing[0].id, reused: true, credentialGate: "NOT_CONFIGURED" as const };
      const inserted = await db.insert(insuranceRequests).values({ organizationId: input.organizationId, jurisdictionId: input.jurisdictionId, requestType: input.requestType, payerCode: input.payerCode, memberReferenceHash: hashInsuranceMemberReference(input.memberReference), serviceCode: input.serviceCode, status: "DRAFT", credentialGate: "NOT_CONFIGURED", requestJson: buildInsuranceRequestPayload(input.serviceCode), idempotencyKey: input.idempotencyKey, createdByUserId: ctx.user.id });
      return { requestId: Number(inserted[0].insertId), reused: false, credentialGate: "NOT_CONFIGURED" as const, networkSubmission: "disabled" as const };
    }),

  transition: protectedProcedure
    .input(z.object({ requestId: z.number().int().positive(), toStatus: statuses, externalReference: z.string().max(160).optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const row = (await db.select().from(insuranceRequests).where(eq(insuranceRequests.id, input.requestId)).limit(1))[0];
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Insurance request not found" });
      await assertScope(db, ctx.user.id, ctx.user.role, row.organizationId, row.jurisdictionId);
      try {
        assertInsuranceTransitionAuthorized(ctx.user.role, input.toStatus as InsuranceRequestStatus, input.externalReference);
        assertPersistedInsuranceTransition(row.status as InsuranceRequestStatus, input.toStatus as InsuranceRequestStatus, row.credentialGate);
      } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Insurance state transition rejected" }); }
      const updated = await db.update(insuranceRequests).set({ status: input.toStatus, externalReference: input.externalReference }).where(and(eq(insuranceRequests.id, input.requestId), eq(insuranceRequests.organizationId, row.organizationId), eq(insuranceRequests.jurisdictionId, row.jurisdictionId)));
      const affectedRows = Number((updated[0] as { affectedRows?: number } | undefined)?.affectedRows ?? 0);
      if (affectedRows !== 1) throw new TRPCError({ code: "CONFLICT", message: "Insurance request changed before transition" });
      return { success: true, status: input.toStatus, networkSubmission: "disabled" as const };
    }),
});

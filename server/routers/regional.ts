import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { branchJurisdictions, branchUsers, branches, complianceEvidence, compliancePacks, complianceRuleAudits, jurisdictionProfiles } from "../../drizzle/schema";
import { getDb } from "../db";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";
import { ARAB_COUNTRY_REGISTRY, normalizeCountryCode } from "../domain/regional-engine";
import { assertPackApprovalReady, transitionPackStatus } from "../domain/compliance-lifecycle";
import { canAccessJurisdiction } from "../domain/jurisdiction-access";
import { countryPackRulesReady } from "../domain/country-pack-policy";

const profileInput = z.object({
  countryCode: z.string().length(2),
  countryNameAr: z.string().min(2).max(120),
  legalAuthorityProfile: z.string().min(2).max(240),
  language: z.string().min(2).max(16).default("ar"),
  defaultLocale: z.string().min(2).max(16),
  currencyCode: z.string().length(3),
  timezone: z.string().min(3).max(64),
  taxProfile: z.string().min(2).max(80),
  dateFormat: z.string().min(2).max(32),
  numberSystem: z.string().min(2).max(16).default("latn"),
});

async function getUserJurisdictionAssignments(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId: number) {
  return db
    .select({ jurisdictionId: branchJurisdictions.jurisdictionId, active: branchUsers.active })
    .from(branchJurisdictions)
    .innerJoin(branchUsers, eq(branchUsers.branchId, branchJurisdictions.branchId))
    .where(and(eq(branchUsers.userId, userId), eq(branchUsers.active, 1)));
}

export const regionalRouter = router({
  registry: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const profiles = await db.select().from(jurisdictionProfiles).orderBy(jurisdictionProfiles.countryCode);
    const packs = await db.select().from(compliancePacks).orderBy(desc(compliancePacks.createdAt));
    const evidence = await db.select().from(complianceEvidence);
    const profileByCode = new Map(profiles.map(profile => [profile.countryCode, profile]));
    const now = new Date();
    const registry = ARAB_COUNTRY_REGISTRY.map(country => {
      const profile = profileByCode.get(country.countryCode) ?? null;
      const pack = profile ? packs.find(candidate => candidate.jurisdictionId === profile.id && candidate.status === "approved") ?? null : null;
      let evidenceReady = false;
      if (pack) {
        const rules = JSON.parse(pack.rulesJson || "{}") as Record<string, boolean>;
        const requiredRuleKeys = Object.entries(rules).filter(([, enabled]) => enabled).map(([key]) => key);
        const completeDomainMatrix = countryPackRulesReady(rules);
        evidenceReady = completeDomainMatrix && requiredRuleKeys.length > 0 && requiredRuleKeys.every(ruleKey => evidence.some(item => item.packId === pack.id && item.ruleKey === ruleKey && item.verificationStatus === "verified"));
      }
      const packReady = Boolean(pack && pack.effectiveFrom.getTime() <= now.getTime() && (!pack.reviewDueAt || pack.reviewDueAt.getTime() >= now.getTime()) && evidenceReady);
      return { ...country, status: profile?.active && packReady ? "configured" : profile ? "pending_approval" : "not_configured", profile, packReady };
    });
    if (ctx.user.role === "admin") return registry;
    return registry.map(country => ({ ...country, profile: null }));
  }),

  myBranchJurisdictions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const memberships = await db.select().from(branchUsers).where(and(eq(branchUsers.userId, ctx.user.id), eq(branchUsers.active, 1)));
    const result = [];
    for (const membership of memberships) {
      const branch = (await db.select().from(branches).where(and(eq(branches.id, membership.branchId), eq(branches.active, 1))).limit(1))[0];
      const assignment = branch ? (await db.select().from(branchJurisdictions).where(eq(branchJurisdictions.branchId, branch.id)).limit(1))[0] : undefined;
      const profile = assignment ? (await db.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.id, assignment.jurisdictionId)).limit(1))[0] : undefined;
      result.push({ branch, assignment: assignment ?? null, profile: profile ?? null });
    }
    return result;
  }),

  assignBranchJurisdiction: adminProcedure.input(z.object({ branchId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), latitude: z.number().min(-90).max(90).nullable().optional(), longitude: z.number().min(-180).max(180).nullable().optional(), locationSource: z.enum(["admin_confirmed", "manual_override"]) })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const branch = (await db.select().from(branches).where(eq(branches.id, input.branchId)).limit(1))[0];
    const profile = (await db.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.id, input.jurisdictionId)).limit(1))[0];
    if (!branch || !profile) throw new TRPCError({ code: "NOT_FOUND", message: "Branch or jurisdiction not found" });
    const existing = (await db.select().from(branchJurisdictions).where(eq(branchJurisdictions.branchId, input.branchId)).limit(1))[0];
    const values = { branchId: input.branchId, jurisdictionId: input.jurisdictionId, latitude: input.latitude === null || input.latitude === undefined ? null : String(input.latitude), longitude: input.longitude === null || input.longitude === undefined ? null : String(input.longitude), locationSource: input.locationSource, confirmedByUserId: ctx.user.id, confirmedAt: new Date() };
    if (existing) await db.update(branchJurisdictions).set(values).where(eq(branchJurisdictions.id, existing.id));
    else await db.insert(branchJurisdictions).values(values);
    return { branchId: input.branchId, jurisdictionId: input.jurisdictionId, locationSource: input.locationSource, confirmedBy: ctx.user.id };
  }),

  saveProfile: adminProcedure.input(profileInput).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const countryCode = normalizeCountryCode(input.countryCode);
    const existing = (await db.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.countryCode, countryCode)).limit(1))[0];
    if (existing) {
      await db.update(jurisdictionProfiles).set({ ...input, countryCode, active: 0, approvedByUserId: null }).where(eq(jurisdictionProfiles.id, existing.id));
      return { jurisdictionId: existing.id, status: "pending_approval" as const };
    }
    const inserted = await db.insert(jurisdictionProfiles).values({ ...input, countryCode, active: 0 });
    return { jurisdictionId: Number(inserted[0].insertId), status: "pending_approval" as const, createdBy: ctx.user.id };
  }),

  approveProfile: adminProcedure.input(z.object({ jurisdictionId: z.number().int().positive(), approved: z.boolean() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    await db.update(jurisdictionProfiles).set({ active: input.approved ? 1 : 0, approvedByUserId: input.approved ? ctx.user.id : null }).where(eq(jurisdictionProfiles.id, input.jurisdictionId));
    return { jurisdictionId: input.jurisdictionId, active: input.approved };
  }),

  createPack: adminProcedure.input(z.object({ jurisdictionId: z.number().int().positive(), packVersion: z.string().min(1).max(40), authorityName: z.string().min(2).max(160), sourceUrl: z.string().url().max(500), effectiveFrom: z.coerce.date(), reviewDueAt: z.coerce.date().nullable().optional(), rules: z.record(z.string(), z.boolean()), })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const profile = (await db.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.id, input.jurisdictionId)).limit(1))[0];
    if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Jurisdiction profile not found" });
    const inserted = await db.insert(compliancePacks).values({ jurisdictionId: input.jurisdictionId, packVersion: input.packVersion, authorityName: input.authorityName, sourceUrl: input.sourceUrl, effectiveFrom: input.effectiveFrom, reviewDueAt: input.reviewDueAt ?? null, rulesJson: JSON.stringify(input.rules), createdByUserId: ctx.user.id, status: "draft" });
    return { packId: Number(inserted[0].insertId), status: "draft" as const, requiresEvidenceAndApproval: true };
  }),

  approvePack: adminProcedure.input(z.object({ packId: z.number().int().positive(), reason: z.string().min(5).max(1000).optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const pack = (await db.select().from(compliancePacks).where(eq(compliancePacks.id, input.packId)).limit(1))[0];
    if (!pack) throw new TRPCError({ code: "NOT_FOUND", message: "Compliance pack not found" });
    const rules = JSON.parse(pack.rulesJson || "{}") as Record<string, boolean>;
    if (!countryPackRulesReady(rules)) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Compliance pack approval rejected" });
    const evidence = await db.select().from(complianceEvidence).where(and(eq(complianceEvidence.packId, pack.id), eq(complianceEvidence.verificationStatus, "verified")));
    try {
      assertPackApprovalReady({ status: pack.status, rules, evidence, effectiveFrom: pack.effectiveFrom, reviewDueAt: pack.reviewDueAt });
      transitionPackStatus(pack.status, "approved");
    } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Compliance pack approval rejected" }); }
    await db.update(compliancePacks).set({ status: "approved", approvedByUserId: ctx.user.id }).where(eq(compliancePacks.id, pack.id));
    await db.insert(complianceRuleAudits).values({ packId: pack.id, action: "approved", actorUserId: ctx.user.id, reason: input.reason ?? "Approved after verified evidence review" });
    await db.insert(complianceRuleAudits).values({ packId: pack.id, action: "activated", actorUserId: ctx.user.id, reason: "Activated as current approved pack" });
    return { packId: pack.id, status: "approved" as const, approvedBy: ctx.user.id };
  }),

  rollbackPack: adminProcedure.input(z.object({ packId: z.number().int().positive(), reason: z.string().min(5).max(1000) })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const pack = (await db.select().from(compliancePacks).where(eq(compliancePacks.id, input.packId)).limit(1))[0];
    if (!pack) throw new TRPCError({ code: "NOT_FOUND", message: "Compliance pack not found" });
    if (pack.status === "rolled_back") return { packId: pack.id, status: "rolled_back" as const, alreadyRolledBack: true };
    try { transitionPackStatus(pack.status, "rolled_back"); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Compliance pack rollback rejected" }); }
    await db.update(compliancePacks).set({ status: "rolled_back", approvedByUserId: null }).where(eq(compliancePacks.id, pack.id));
    await db.insert(complianceRuleAudits).values({ packId: pack.id, action: "rolled_back", actorUserId: ctx.user.id, reason: input.reason });
    return { packId: pack.id, status: "rolled_back" as const, alreadyRolledBack: false };
  }),

  listPacks: protectedProcedure.input(z.object({ jurisdictionId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const assignments = await getUserJurisdictionAssignments(db, ctx.user.id);
    if (!canAccessJurisdiction(ctx.user.role, assignments, input.jurisdictionId)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Jurisdiction access denied" });
    }
    return db.select().from(compliancePacks).where(eq(compliancePacks.jurisdictionId, input.jurisdictionId)).orderBy(desc(compliancePacks.createdAt));
  }),

  listEvidence: protectedProcedure.input(z.object({ packId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const pack = (await db.select({ jurisdictionId: compliancePacks.jurisdictionId }).from(compliancePacks).where(eq(compliancePacks.id, input.packId)).limit(1))[0];
    if (!pack) throw new TRPCError({ code: "NOT_FOUND", message: "Compliance pack not found" });
    const assignments = await getUserJurisdictionAssignments(db, ctx.user.id);
    if (!canAccessJurisdiction(ctx.user.role, assignments, pack.jurisdictionId)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Jurisdiction access denied" });
    }
    return db.select().from(complianceEvidence).where(eq(complianceEvidence.packId, input.packId)).orderBy(desc(complianceEvidence.createdAt));
  }),

  listPackAudits: adminProcedure.input(z.object({ packId: z.number().int().positive() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    return db.select().from(complianceRuleAudits).where(eq(complianceRuleAudits.packId, input.packId)).orderBy(desc(complianceRuleAudits.createdAt));
  }),

  addEvidence: adminProcedure.input(z.object({ jurisdictionId: z.number().int().positive(), packId: z.number().int().positive(),   operation: z.string().min(2).max(40),
    ruleKey: z.string().max(120).optional(),
    catalogField: z.string().max(120).optional(),
    authorityName: z.string().min(2).max(160), sourceUrl: z.string().url().max(500), sourceRecordId: z.string().max(160).optional(), sourceRetrievedAt: z.coerce.date(), effectiveFrom: z.coerce.date().nullable().optional(), reviewDueAt: z.coerce.date().nullable().optional(), notes: z.string().max(4000).optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const pack = (await db.select().from(compliancePacks).where(and(eq(compliancePacks.id, input.packId), eq(compliancePacks.jurisdictionId, input.jurisdictionId))).limit(1))[0];
    if (!pack) throw new TRPCError({ code: "NOT_FOUND", message: "Compliance pack not found for jurisdiction" });
    const inserted = await db.insert(complianceEvidence).values({ ...input, ruleKey: input.ruleKey ?? null, catalogField: input.catalogField ?? null, sourceRecordId: input.sourceRecordId ?? null, effectiveFrom: input.effectiveFrom ?? null, reviewDueAt: input.reviewDueAt ?? null, verificationStatus: "review", verifiedByUserId: null, createdAt: new Date() });
    return { evidenceId: Number(inserted[0].insertId), status: "review" as const, createdBy: ctx.user.id };
  }),

  verifyEvidence: adminProcedure.input(z.object({ evidenceId: z.number().int().positive(), decision: z.enum(["verified", "rejected"]), notes: z.string().max(4000).optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const evidence = (await db.select().from(complianceEvidence).where(eq(complianceEvidence.id, input.evidenceId)).limit(1))[0];
    if (!evidence) throw new TRPCError({ code: "NOT_FOUND", message: "Compliance evidence not found" });
    const verifiedAt = new Date();
    await db.update(complianceEvidence).set({ verificationStatus: input.decision, verifiedByUserId: ctx.user.id, verifiedAt, notes: input.notes ?? evidence.notes }).where(eq(complianceEvidence.id, evidence.id));
    return { evidenceId: evidence.id, status: input.decision, verifiedBy: ctx.user.id, verifiedAt };
  }),
});

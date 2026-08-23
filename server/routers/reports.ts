import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { branches, branchJurisdictions, branchUsers, complianceEvidence, compliancePacks, jurisdictionProfiles, organizationMemberships, reportDefinitions, reportDeliveryAttempts, reportRuns } from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { parse as parseCookie } from "cookie";
import { COOKIE_NAME } from "@shared/const";
import { createHeartbeatJob } from "../_core/heartbeat";
import { assertCompliancePackUsable } from "../domain/regional-engine";
import { assertReportJurisdictionAccess } from "../domain/reporting-policy";
import { assertReportSchedulingEnabled, getReportSchedulingReadiness } from "../domain/report-scheduling-policy";
import { ENV } from "../_core/env";

const REPORT_CATALOG = {
  "inventory.alerts": { name: "Inventory alerts", queryKey: "inventory.alerts.v1" },
  "procurement.purchases": { name: "Procurement purchases", queryKey: "procurement.purchases.v1" },
  "finance.balances": { name: "Supplier and customer balances", queryKey: "finance.balances.v1" },
  "sales.daily": { name: "Daily sales", queryKey: "sales.daily.v1" },
  "compliance.expiry": { name: "Compliance and expiry review", queryKey: "compliance.expiry.v1" },
  "operations.summary": { name: "Operations summary", queryKey: "operations.summary.v1" },
} as const;

const reportKey = z.enum(["inventory.alerts", "procurement.purchases", "finance.balances", "sales.daily", "compliance.expiry", "operations.summary"]);
const recipientRole = z.enum(["owner", "org_admin", "compliance_officer", "clinical_lead", "operations_manager", "staff", "auditor"]);

async function accessibleJurisdictionIds(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId: number, role: string, organizationId: number) {
  if (role === "admin") return null;
  const rows = await db.select({ jurisdictionId: branchJurisdictions.jurisdictionId })
    .from(branchUsers)
    .innerJoin(branches, eq(branches.id, branchUsers.branchId))
    .innerJoin(branchJurisdictions, eq(branchJurisdictions.branchId, branchUsers.branchId))
    .where(and(eq(branchUsers.userId, userId), eq(branchUsers.active, 1), eq(branches.organizationId, organizationId)));
  return Array.from(new Set(rows.map(row => row.jurisdictionId)));
}

async function accessibleOrganizationIds(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId: number, role: string) {
  if (role === "admin") return null;
  const rows = await db.select({ organizationId: organizationMemberships.organizationId }).from(organizationMemberships).where(and(eq(organizationMemberships.userId, userId), eq(organizationMemberships.active, 1)));
  return rows.map(row => row.organizationId);
}

async function assertOrganizationAccess(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId: number, role: string, organizationId: number) {
  const ids = await accessibleOrganizationIds(db, userId, role);
  if (ids !== null && !ids.includes(organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Organization is outside the active scope" });
}

async function assertReportRegulatoryScope(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, organizationId: number, jurisdictionId: number) {
  const profile = (await db.select().from(jurisdictionProfiles).where(eq(jurisdictionProfiles.id, jurisdictionId)).limit(1))[0];
  const pack = (await db.select().from(compliancePacks).where(and(eq(compliancePacks.jurisdictionId, jurisdictionId), eq(compliancePacks.status, "approved"))).orderBy(desc(compliancePacks.createdAt)).limit(1))[0];
  const evidence = pack ? await db.select({ id: complianceEvidence.id }).from(complianceEvidence).where(and(eq(complianceEvidence.packId, pack.id), eq(complianceEvidence.verificationStatus, "verified"))) : [];
  if (!profile || !pack) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Approved reporting compliance pack is required" });
  try { assertCompliancePackUsable({ countryCode: profile.countryCode, active: profile.active === 1, legalAuthorityProfile: profile.legalAuthorityProfile, language: profile.language, defaultLocale: profile.defaultLocale, currencyCode: profile.currencyCode, timezone: profile.timezone, taxProfile: profile.taxProfile, dateFormat: profile.dateFormat, numberSystem: profile.numberSystem }, { jurisdictionId: pack.jurisdictionId, packVersion: pack.packVersion, status: pack.status, effectiveFrom: pack.effectiveFrom, reviewDueAt: pack.reviewDueAt, rules: JSON.parse(pack.rulesJson) as Record<string, boolean>, evidenceCount: evidence.length }, "report"); } catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Reporting compliance policy rejected the request" }); }
}

export const reportsRouter = router({
  catalog: protectedProcedure.query(() => Object.entries(REPORT_CATALOG).map(([key, value]) => ({ key, ...value, deliveryEnabledByDefault: false }))),
  automationStatus: protectedProcedure.query(() => getReportSchedulingReadiness(process.env.REPORT_SCHEDULING_ENABLED)),

  definitions: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const ids = await accessibleOrganizationIds(db, ctx.user.id, ctx.user.role);
      const organizationId = input?.organizationId;
      if (organizationId !== undefined) await assertOrganizationAccess(db, ctx.user.id, ctx.user.role, organizationId);
      const jurisdictionIds = organizationId === undefined ? null : await accessibleJurisdictionIds(db, ctx.user.id, ctx.user.role, organizationId);
      if (input?.jurisdictionId !== undefined) {
        try { assertReportJurisdictionAccess(input.jurisdictionId, jurisdictionIds); }
        catch { throw new TRPCError({ code: "FORBIDDEN", message: "Report jurisdiction is outside the active scope" }); }
      }
      const filters = [
        ids === null ? undefined : ids.length ? inArray(reportDefinitions.organizationId, ids) : eq(reportDefinitions.id, -1),
        organizationId === undefined ? undefined : eq(reportDefinitions.organizationId, organizationId),
        jurisdictionIds === null ? undefined : jurisdictionIds.length ? inArray(reportDefinitions.jurisdictionId, jurisdictionIds) : eq(reportDefinitions.id, -1),
        input?.jurisdictionId === undefined ? undefined : eq(reportDefinitions.jurisdictionId, input.jurisdictionId),
      ].filter(Boolean) as any[];
      return db.select().from(reportDefinitions).where(filters.length ? and(...filters) : undefined).orderBy(desc(reportDefinitions.updatedAt)).limit(100);
    }),

  createDefinition: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), reportKey, name: z.string().min(2).max(180).optional(), description: z.string().max(2000).optional(), cronExpression: z.string().regex(/^\d+ \S+ \S+ \S+ \S+ \S+$/).optional(), recipientUserId: z.number().int().positive().optional(), recipientRole: recipientRole.optional(), deliveryChannel: z.enum(["in_app", "email"]).default("in_app") }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await assertOrganizationAccess(db, ctx.user.id, ctx.user.role, input.organizationId);
      if (ctx.user.role !== "admin") {
        const manager = await db.select({ id: organizationMemberships.id }).from(organizationMemberships).where(and(eq(organizationMemberships.organizationId, input.organizationId), eq(organizationMemberships.userId, ctx.user.id), eq(organizationMemberships.active, 1), inArray(organizationMemberships.organizationRole, ["owner", "org_admin", "compliance_officer", "operations_manager"]))).limit(1);
        if (!manager.length) throw new TRPCError({ code: "FORBIDDEN", message: "Report definition requires organization management access" });
      }
      const jurisdiction = await db.select({ branchId: branches.id }).from(branches).innerJoin(branchJurisdictions, eq(branchJurisdictions.branchId, branches.id)).where(and(eq(branches.organizationId, input.organizationId), eq(branchJurisdictions.jurisdictionId, input.jurisdictionId))).limit(1);
      if (!jurisdiction.length) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Jurisdiction is not configured for this organization" });
      await assertReportRegulatoryScope(db, input.organizationId, input.jurisdictionId);
      if (input.recipientUserId !== undefined) {
        const recipient = await db.select({ id: organizationMemberships.id }).from(organizationMemberships).where(and(eq(organizationMemberships.organizationId, input.organizationId), eq(organizationMemberships.userId, input.recipientUserId), eq(organizationMemberships.active, 1))).limit(1);
        if (!recipient.length) throw new TRPCError({ code: "FORBIDDEN", message: "Recipient is outside the organization" });
      }
      const selected = REPORT_CATALOG[input.reportKey];
      const inserted = await db.insert(reportDefinitions).values({ organizationId: input.organizationId, jurisdictionId: input.jurisdictionId, reportKey: input.reportKey, name: input.name ?? selected.name, description: input.description, cronExpression: input.cronExpression, status: "draft", queryKey: selected.queryKey, recipientUserId: input.recipientUserId, recipientRole: input.recipientRole, deliveryChannel: input.deliveryChannel, deliveryEnabled: input.deliveryChannel === "email" ? 1 : 0, createdByUserId: ctx.user.id });
      return { definitionId: Number(inserted[0].insertId), status: "draft" as const, deliveryEnabled: false };
    }),

  schedule: protectedProcedure
    .input(z.object({ definitionId: z.number().int().positive(), cronExpression: z.string().regex(/^\\d+ \\S+ \\S+ \\S+ \\S+ \\S+$/) }))
    .mutation(async ({ ctx, input }) => {
      try { assertReportSchedulingEnabled(process.env.REPORT_SCHEDULING_ENABLED); }
      catch { throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Report automation is disabled pending explicit production release approval" }); }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const definition = (await db.select().from(reportDefinitions).where(eq(reportDefinitions.id, input.definitionId)).limit(1))[0];
      if (!definition) throw new TRPCError({ code: "NOT_FOUND", message: "Report definition not found" });
      if (definition.deliveryChannel === "email" && (!ENV.reportMailApiKey || !ENV.reportMailFrom)) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Email scheduling is unavailable until approved mail configuration is present" });
      await assertOrganizationAccess(db, ctx.user.id, ctx.user.role, definition.organizationId);
      if (definition.jurisdictionId === null) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Report jurisdiction scope is required" });
      await assertReportRegulatoryScope(db, definition.organizationId, definition.jurisdictionId);
      if (ctx.user.role !== "admin") {
        const manager = await db.select({ id: organizationMemberships.id }).from(organizationMemberships).where(and(eq(organizationMemberships.organizationId, definition.organizationId), eq(organizationMemberships.userId, ctx.user.id), eq(organizationMemberships.active, 1), inArray(organizationMemberships.organizationRole, ["owner", "org_admin", "compliance_officer", "operations_manager"]))).limit(1);
        if (!manager.length) throw new TRPCError({ code: "FORBIDDEN", message: "Report scheduling requires organization management access" });
      }
      if (definition.scheduleCronTaskUid) return { taskUid: definition.scheduleCronTaskUid, status: "already_scheduled" as const };
      const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
      const job = await createHeartbeatJob({ name: `report-${definition.id}`, cron: input.cronExpression, path: "/api/scheduled/report-execution", description: `Scheduled report ${definition.reportKey}` }, sessionToken);
      await db.update(reportDefinitions).set({ scheduleCronTaskUid: job.taskUid, cronExpression: input.cronExpression, status: "active" }).where(eq(reportDefinitions.id, definition.id));
      return { taskUid: job.taskUid, status: "scheduled" as const, nextExecutionAt: job.nextExecutionAt ?? null };
    }),

  runs: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), definitionId: z.number().int().positive().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await assertOrganizationAccess(db, ctx.user.id, ctx.user.role, input.organizationId);
      const jurisdictionIds = await accessibleJurisdictionIds(db, ctx.user.id, ctx.user.role, input.organizationId);
      const filters = [eq(reportRuns.organizationId, input.organizationId), jurisdictionIds === null ? undefined : jurisdictionIds.length ? inArray(reportRuns.jurisdictionId, jurisdictionIds) : eq(reportRuns.id, -1), input.definitionId === undefined ? undefined : eq(reportRuns.definitionId, input.definitionId)].filter(Boolean) as any[];
      return db.select().from(reportRuns).where(and(...filters)).orderBy(desc(reportRuns.createdAt)).limit(100);
    }),

  deliveryAttempts: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), definitionId: z.number().int().positive().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await assertOrganizationAccess(db, ctx.user.id, ctx.user.role, input.organizationId);
      const jurisdictionIds = await accessibleJurisdictionIds(db, ctx.user.id, ctx.user.role, input.organizationId);
      const filters = [eq(reportDeliveryAttempts.organizationId, input.organizationId), jurisdictionIds === null ? undefined : jurisdictionIds.length ? inArray(reportDeliveryAttempts.jurisdictionId, jurisdictionIds) : eq(reportDeliveryAttempts.id, -1), input.definitionId === undefined ? undefined : eq(reportDeliveryAttempts.definitionId, input.definitionId)].filter(Boolean) as any[];
      return db.select().from(reportDeliveryAttempts).where(and(...filters)).orderBy(desc(reportDeliveryAttempts.createdAt)).limit(100);
    }),
});

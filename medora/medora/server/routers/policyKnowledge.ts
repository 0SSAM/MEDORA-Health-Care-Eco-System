import { TRPCError } from "@trpc/server";
import { and, desc, eq, gt, isNull, lte, or } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { auditLogs, branches, organizationMemberships, policyKnowledgeArticles } from "../../drizzle/schema";
import { hashAuditRecord } from "../domain/internal-auth";

const scopeInput = z.object({
  organizationId: z.number().int().positive(),
  branchId: z.number().int().positive().nullable().optional(),
});
type Db = NonNullable<Awaited<ReturnType<typeof getDb>>>;
async function auditPolicyChange(db: Db, userId: number, organizationId: number, branchId: number | null | undefined, jurisdictionId: number | null | undefined, action: string, articleId: number) {
  const previousHash = (await db.select({ recordHash: auditLogs.recordHash }).from(auditLogs).where(and(
    eq(auditLogs.organizationId, organizationId),
    branchId ? eq(auditLogs.branchId, branchId) : isNull(auditLogs.branchId),
  )).orderBy(desc(auditLogs.id)).limit(1))[0]?.recordHash ?? null;
  const createdAt = new Date().toISOString();
  const event = { eventType: action, userId, organizationId, branchId: branchId ?? null, jurisdictionId: jurisdictionId ?? null, requestId: `policy:${articleId}`, createdAt };
  await db.insert(auditLogs).values({ userId, organizationId, branchId: branchId ?? null, action, entityType: "policy_knowledge_article", entityId: String(articleId), previousHash, recordHash: hashAuditRecord({ ...event, previousHash }) });
}

async function assertScope(userId: number, role: string, organizationId: number, branchId?: number | null, manage = false) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "قاعدة البيانات غير متاحة حالياً" });
  if (role !== "admin") {
    const membership = await db.select({ id: organizationMemberships.id }).from(organizationMemberships).where(and(
      eq(organizationMemberships.organizationId, organizationId),
      eq(organizationMemberships.userId, userId),
      eq(organizationMemberships.active, 1),
    )).limit(1);
    if (!membership.length) throw new TRPCError({ code: "FORBIDDEN", message: "الحساب خارج نطاق المؤسسة" });
    if (manage) throw new TRPCError({ code: "FORBIDDEN", message: "إدارة سياسات قاعدة المعرفة تتطلب صلاحية مسؤول" });
  }
  if (branchId) {
    const branch = await db.select({ id: branches.id }).from(branches).where(and(eq(branches.id, branchId), eq(branches.organizationId, organizationId), eq(branches.active, 1))).limit(1);
    if (!branch.length) throw new TRPCError({ code: "FORBIDDEN", message: "الفرع خارج نطاق المؤسسة" });
  }
  return db;
}

const articleInput = z.object({
  organizationId: z.number().int().positive(),
  branchId: z.number().int().positive().nullable().optional(),
  jurisdictionId: z.number().int().positive().nullable().optional(),
  title: z.string().trim().min(4).max(220),
  category: z.string().trim().min(2).max(100),
  content: z.string().trim().min(20).max(20000),
  sourceReference: z.string().trim().max(500).optional(),
  supersedesId: z.number().int().positive().nullable().optional(),
});

export const policyKnowledgeRouter = router({
  list: protectedProcedure.input(z.object({ ...scopeInput.shape, includeDrafts: z.boolean().default(false) })).query(async ({ ctx, input }) => {
    const db = await assertScope(ctx.user.id, ctx.user.role, input.organizationId, input.branchId, input.includeDrafts);
    const statusFilter = input.includeDrafts && ctx.user.role === "admin"
      ? undefined
      : eq(policyKnowledgeArticles.status, "approved");
    const now = new Date();
    const effectiveFilter = input.includeDrafts && ctx.user.role === "admin" ? undefined : and(
      or(isNull(policyKnowledgeArticles.effectiveFrom), lte(policyKnowledgeArticles.effectiveFrom, now)),
      or(isNull(policyKnowledgeArticles.effectiveTo), gt(policyKnowledgeArticles.effectiveTo, now)),
    );
    return db.select().from(policyKnowledgeArticles).where(and(
      eq(policyKnowledgeArticles.organizationId, input.organizationId),
      input.branchId ? or(eq(policyKnowledgeArticles.branchId, input.branchId), isNull(policyKnowledgeArticles.branchId)) : isNull(policyKnowledgeArticles.branchId),
      statusFilter,
      effectiveFilter,
    )).orderBy(desc(policyKnowledgeArticles.updatedAt)).limit(200);
  }),
  getApprovedContext: protectedProcedure.input(z.object({ ...scopeInput.shape, query: z.string().trim().min(1).max(300) })).query(async ({ ctx, input }) => {
    const db = await assertScope(ctx.user.id, ctx.user.role, input.organizationId, input.branchId);
    const now = new Date();
    const rows = await db.select({ id: policyKnowledgeArticles.id, title: policyKnowledgeArticles.title, category: policyKnowledgeArticles.category, content: policyKnowledgeArticles.content, version: policyKnowledgeArticles.version, sourceReference: policyKnowledgeArticles.sourceReference }).from(policyKnowledgeArticles).where(and(
      eq(policyKnowledgeArticles.organizationId, input.organizationId),
      eq(policyKnowledgeArticles.status, "approved"),
      input.branchId ? or(eq(policyKnowledgeArticles.branchId, input.branchId), isNull(policyKnowledgeArticles.branchId)) : isNull(policyKnowledgeArticles.branchId),
      or(isNull(policyKnowledgeArticles.effectiveFrom), lte(policyKnowledgeArticles.effectiveFrom, now)),
      or(isNull(policyKnowledgeArticles.effectiveTo), gt(policyKnowledgeArticles.effectiveTo, now)),
    )).orderBy(desc(policyKnowledgeArticles.updatedAt)).limit(20);
    const terms = input.query.toLowerCase().split(/\s+/).filter(Boolean);
    return rows.filter((row) => terms.some((term) => `${row.title} ${row.category} ${row.content}`.toLowerCase().includes(term))).slice(0, 8);
  }),
  create: protectedProcedure.input(articleInput).mutation(async ({ ctx, input }) => {
    const db = await assertScope(ctx.user.id, ctx.user.role, input.organizationId, input.branchId, true);
    const result = await db.insert(policyKnowledgeArticles).values({
      organizationId: input.organizationId, branchId: input.branchId ?? null, jurisdictionId: input.jurisdictionId ?? null,
      title: input.title, category: input.category, content: input.content, sourceReference: input.sourceReference ?? null,
      supersedesId: input.supersedesId ?? null, version: input.supersedesId ? 2 : 1, status: "draft", createdByUserId: ctx.user.id,
    });
    const id = Number(result[0].insertId);
    await auditPolicyChange(db, ctx.user.id, input.organizationId, input.branchId, input.jurisdictionId, "policy_article_created", id);
    return { id, status: "draft" as const };
  }),
  update: protectedProcedure.input(articleInput.extend({ articleId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = await assertScope(ctx.user.id, ctx.user.role, input.organizationId, input.branchId, true);
    await db.update(policyKnowledgeArticles).set({
      branchId: input.branchId ?? null, jurisdictionId: input.jurisdictionId ?? null, title: input.title, category: input.category,
      content: input.content, sourceReference: input.sourceReference ?? null, supersedesId: input.supersedesId ?? null,
      status: "draft", updatedAt: new Date(),
    }).where(and(eq(policyKnowledgeArticles.id, input.articleId), eq(policyKnowledgeArticles.organizationId, input.organizationId), eq(policyKnowledgeArticles.status, "draft")));
    await auditPolicyChange(db, ctx.user.id, input.organizationId, input.branchId, input.jurisdictionId, "policy_article_updated", input.articleId);
    return { status: "draft" as const };
  }),
  submitForReview: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive().nullable().optional(), jurisdictionId: z.number().int().positive().nullable().optional(), articleId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = await assertScope(ctx.user.id, ctx.user.role, input.organizationId, input.branchId, true);
    await db.update(policyKnowledgeArticles).set({ status: "pending_review" }).where(and(eq(policyKnowledgeArticles.id, input.articleId), eq(policyKnowledgeArticles.organizationId, input.organizationId), eq(policyKnowledgeArticles.status, "draft")));
    await auditPolicyChange(db, ctx.user.id, input.organizationId, input.branchId, input.jurisdictionId, "policy_article_submitted_for_review", input.articleId);
    return { status: "pending_review" as const };
  }),
  approve: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive().nullable().optional(), jurisdictionId: z.number().int().positive().nullable().optional(), articleId: z.number().int().positive(), reviewNote: z.string().trim().max(1000).optional() })).mutation(async ({ ctx, input }) => {
    const db = await assertScope(ctx.user.id, ctx.user.role, input.organizationId, input.branchId, true);
    await db.update(policyKnowledgeArticles).set({ status: "approved", reviewedByUserId: ctx.user.id, reviewedAt: new Date(), reviewNote: input.reviewNote ?? null, effectiveFrom: new Date() }).where(and(eq(policyKnowledgeArticles.id, input.articleId), eq(policyKnowledgeArticles.organizationId, input.organizationId), eq(policyKnowledgeArticles.status, "pending_review")));
    await auditPolicyChange(db, ctx.user.id, input.organizationId, input.branchId, input.jurisdictionId, "policy_article_approved", input.articleId);
    return { status: "approved" as const };
  }),
  archive: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive().nullable().optional(), jurisdictionId: z.number().int().positive().nullable().optional(), articleId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = await assertScope(ctx.user.id, ctx.user.role, input.organizationId, input.branchId, true);
    await db.update(policyKnowledgeArticles).set({ status: "archived", effectiveTo: new Date() }).where(and(eq(policyKnowledgeArticles.id, input.articleId), eq(policyKnowledgeArticles.organizationId, input.organizationId), eq(policyKnowledgeArticles.status, "approved")));
    await auditPolicyChange(db, ctx.user.id, input.organizationId, input.branchId, input.jurisdictionId, "policy_article_archived", input.articleId);
    return { status: "archived" as const };
  }),
});

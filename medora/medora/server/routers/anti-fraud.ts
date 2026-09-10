import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { auditLogs, branches, branchUsers, fraudCases, organizationMemberships } from "../../drizzle/schema";
import { getDb } from "../db";
import { hashAuditRecord } from "../domain/internal-auth";
import { assessRiskSignals, canContainFraudCase, canReviewFraudCases, nextFraudCaseStatus, validateCaseResolution } from "../domain/anti-fraud-policy";
import { protectedProcedure, router } from "../_core/trpc";

const scopeInput = z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive().nullable().optional() });
const reviewerRoles = ["owner", "org_admin", "compliance_officer", "auditor", "operations_manager"] as const;

async function assertScope(userId: number, systemRole: string, organizationId: number, branchId?: number | null) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "قاعدة البيانات غير متاحة حالياً" });
  if (systemRole !== "admin") {
    const membership = await db.select({ id: organizationMemberships.id, role: organizationMemberships.organizationRole }).from(organizationMemberships).where(and(eq(organizationMemberships.organizationId, organizationId), eq(organizationMemberships.userId, userId), eq(organizationMemberships.active, 1), inArray(organizationMemberships.organizationRole, [...reviewerRoles]))).limit(1);
    if (!membership.length) throw new TRPCError({ code: "FORBIDDEN", message: "صلاحية مراجعة المخاطر غير متاحة لهذا الحساب" });
  }
  if (branchId) {
    const branch = await db.select({ id: branches.id }).from(branches).where(and(eq(branches.id, branchId), eq(branches.organizationId, organizationId), eq(branches.active, 1))).limit(1);
    if (!branch.length) throw new TRPCError({ code: "FORBIDDEN", message: "الفرع خارج نطاق المؤسسة" });
    if (systemRole !== "admin") {
      const assignment = await db.select({ id: branchUsers.id }).from(branchUsers).where(and(eq(branchUsers.branchId, branchId), eq(branchUsers.userId, userId), eq(branchUsers.active, 1))).limit(1);
      if (!assignment.length) throw new TRPCError({ code: "FORBIDDEN", message: "لا يوجد تعيين لهذا المستخدم في الفرع" });
    }
  }
  return db;
}

async function auditCase(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, input: { userId: number; organizationId: number; branchId?: number | null; caseId: number; action: string }) {
  const previous = await db.select({ recordHash: auditLogs.recordHash }).from(auditLogs).where(and(eq(auditLogs.organizationId, input.organizationId), input.branchId ? eq(auditLogs.branchId, input.branchId) : eq(auditLogs.organizationId, input.organizationId))).orderBy(desc(auditLogs.id)).limit(1);
  const createdAt = new Date().toISOString();
  const event = { eventType: input.action, entityType: "fraud_case", entityId: input.caseId, actorUserId: input.userId, organizationId: input.organizationId, branchId: input.branchId ?? null, createdAt };
  await db.insert(auditLogs).values({ userId: input.userId, organizationId: input.organizationId, branchId: input.branchId ?? null, action: input.action, entityType: event.entityType, entityId: String(input.caseId), previousHash: previous[0]?.recordHash ?? null, recordHash: hashAuditRecord({ ...event, requestId: `fraud-case:${input.caseId}` }) });
}

export const antiFraudRouter = router({
  listCases: protectedProcedure.input(scopeInput.extend({ status: z.enum(["new", "under_review", "contained", "resolved", "dismissed"]).optional() })).query(async ({ ctx, input }) => {
    const db = await assertScope(ctx.user.id, ctx.user.role, input.organizationId, input.branchId);
    return db.select().from(fraudCases).where(and(eq(fraudCases.organizationId, input.organizationId), input.branchId ? eq(fraudCases.branchId, input.branchId) : undefined, input.status ? eq(fraudCases.status, input.status) : undefined)).orderBy(desc(fraudCases.createdAt)).limit(100);
  }),
  assess: protectedProcedure.input(z.object({ category: z.enum(["cash", "inventory", "procurement", "prescription", "access", "identity", "data", "other"]), subjectType: z.string().max(40).optional(), subjectId: z.union([z.string(), z.number()]).optional(), amount: z.number().finite().optional(), baseAmount: z.number().finite().nonnegative().optional(), quantity: z.number().finite().optional(), reorderPoint: z.number().finite().nonnegative().optional(), createdByUserId: z.number().int().positive().optional(), approvedByUserId: z.number().int().positive().optional(), action: z.enum(["discount", "void", "return", "inventory_adjustment", "purchase_approval", "role_change", "export", "login", "other"]).optional(), hourUtc: z.number().int().min(0).max(23).optional(), recentSameSubjectCount: z.number().int().nonnegative().optional() })).query(({ input }) => ({ humanReviewRequired: true as const, signals: assessRiskSignals(input), disclaimer: "هذه إشارات مراجعة وليست إثباتاً للذنب أو قراراً تأديبياً." })),
  createCase: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive().nullable().optional(), jurisdictionId: z.number().int().positive().nullable().optional(), category: z.enum(["cash", "inventory", "procurement", "prescription", "access", "identity", "data", "other"]), severity: z.enum(["low", "medium", "high", "critical"]), signalCode: z.string().trim().min(3).max(100), subjectType: z.string().trim().max(40).optional(), subjectId: z.string().trim().max(80).optional(), summary: z.string().trim().min(10).max(1000), evidence: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}), assignedToUserId: z.number().int().positive().nullable().optional() })).mutation(async ({ ctx, input }) => {
    const db = await assertScope(ctx.user.id, ctx.user.role, input.organizationId, input.branchId);
    const result = await db.insert(fraudCases).values({ ...input, branchId: input.branchId ?? null, jurisdictionId: input.jurisdictionId ?? null, subjectType: input.subjectType ?? null, subjectId: input.subjectId ?? null, evidenceJson: JSON.stringify(input.evidence), assignedToUserId: input.assignedToUserId ?? null, createdByUserId: ctx.user.id });
    const caseId = Number(result[0].insertId);
    await auditCase(db, { userId: ctx.user.id, organizationId: input.organizationId, branchId: input.branchId, caseId, action: "fraud_case_created" });
    return { id: caseId, status: "new" as const, humanReviewRequired: true as const };
  }),
  transitionCase: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), caseId: z.number().int().positive(), nextStatus: z.enum(["new", "under_review", "contained", "resolved", "dismissed"]), resolutionCode: z.string().trim().max(100).optional(), resolutionNote: z.string().trim().max(1000).optional(), assignedToUserId: z.number().int().positive().nullable().optional() })).mutation(async ({ ctx, input }) => {
    const db = await assertScope(ctx.user.id, ctx.user.role, input.organizationId);
    const current = await db.select().from(fraudCases).where(and(eq(fraudCases.id, input.caseId), eq(fraudCases.organizationId, input.organizationId))).limit(1);
    if (!current[0]) throw new TRPCError({ code: "NOT_FOUND", message: "قضية المخاطر غير موجودة ضمن نطاق المؤسسة" });
    if (input.nextStatus === "contained" && !canContainFraudCase(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "الاحتواء يتطلب صلاحية إدارية مرتفعة" });
    if (!canReviewFraudCases(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "المراجعة البشرية غير متاحة لهذا الحساب" });
    try { nextFraudCaseStatus(current[0].status, input.nextStatus); validateCaseResolution({ status: input.nextStatus, resolutionCode: input.resolutionCode, resolutionNote: input.resolutionNote }); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "انتقال الحالة غير صالح" }); }
    await db.update(fraudCases).set({ status: input.nextStatus, resolutionCode: input.resolutionCode ?? null, resolutionNote: input.resolutionNote ?? null, assignedToUserId: input.assignedToUserId ?? current[0].assignedToUserId, resolvedByUserId: ["resolved", "dismissed"].includes(input.nextStatus) ? ctx.user.id : current[0].resolvedByUserId }).where(and(eq(fraudCases.id, input.caseId), eq(fraudCases.organizationId, input.organizationId)));
    await auditCase(db, { userId: ctx.user.id, organizationId: input.organizationId, branchId: current[0].branchId, caseId: input.caseId, action: `fraud_case_${input.nextStatus}` });
    return { success: true as const, status: input.nextStatus };
  }),
});

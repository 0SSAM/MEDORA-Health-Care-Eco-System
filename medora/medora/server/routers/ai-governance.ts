import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { auditLogs, organizationMemberships } from "../../drizzle/schema";
import { getDb } from "../db";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";
import { assertOperationalAiRequestSafe, buildAiGovernanceReadiness, buildWorkplaceMonitoringReadiness, OPERATIONAL_AI_USE_CASES } from "../domain/ai-governance-policy";
import { hashAuditRecord } from "../domain/internal-auth";

type Database = NonNullable<Awaited<ReturnType<typeof getDb>>>;
const managementRoles = ["owner", "org_admin", "operations_manager"] as const;

async function assertManagementAccess(db: Database, userId: number, systemRole: string, organizationId: number) {
  if (systemRole === "admin") return;
  const membership = await db.select({ id: organizationMemberships.id }).from(organizationMemberships)
    .where(and(eq(organizationMemberships.organizationId, organizationId), eq(organizationMemberships.userId, userId), eq(organizationMemberships.active, 1), inArray(organizationMemberships.organizationRole, [...managementRoles])))
    .limit(1);
  if (!membership.length) throw new TRPCError({ code: "FORBIDDEN", message: "Organization management access is required" });
}

async function writeAiAudit(db: Database, input: { userId: number; organizationId: number; action: string }) {
  const previous = await db.select({ recordHash: auditLogs.recordHash }).from(auditLogs)
    .where(eq(auditLogs.organizationId, input.organizationId)).orderBy(desc(auditLogs.id)).limit(1);
  const createdAt = new Date().toISOString();
  const recordHash = hashAuditRecord({ eventType: input.action, userId: input.userId, organizationId: input.organizationId, branchId: null, jurisdictionId: null, requestId: `ai:${input.action}`, createdAt });
  await db.insert(auditLogs).values({ userId: input.userId, organizationId: input.organizationId, branchId: null, action: input.action, entityType: "ai_governance", entityId: input.action, previousHash: previous[0]?.recordHash ?? null, recordHash });
}

const operationalBriefInput = z.object({
  organizationId: z.number().int().positive(),
  useCase: z.enum(OPERATIONAL_AI_USE_CASES),
  operationalFacts: z.array(z.string().trim().min(1).max(280)).min(1).max(30),
  containsProtectedData: z.literal(false),
  humanReviewAcknowledged: z.literal(true),
});

type GeneratedOperationalBrief = {
  summary: string;
  prioritizedActions: Array<{ action: string; rationale: string; priority: "low" | "medium" | "high" }>;
  requiresHumanReview: boolean;
  limitations: string[];
};

export const aiGovernanceRouter = router({
  readiness: protectedProcedure.input(z.object({ organizationId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    await assertManagementAccess(db, ctx.user.id, ctx.user.role, input.organizationId);
    return buildAiGovernanceReadiness(input.organizationId);
  }),
  workplaceMonitoringReadiness: protectedProcedure.input(z.object({ organizationId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    await assertManagementAccess(db, ctx.user.id, ctx.user.role, input.organizationId);
    return buildWorkplaceMonitoringReadiness(input.organizationId);
  }),
  generateOperationalBrief: protectedProcedure.input(operationalBriefInput).mutation(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    await assertManagementAccess(db, ctx.user.id, ctx.user.role, input.organizationId);
    try { assertOperationalAiRequestSafe(input); } catch (error) { throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "AI safety policy rejected the request" }); }
    const response = await invokeLLM({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: "You are an operational analyst for a healthcare organization. Use only the supplied non-sensitive operational facts. Never infer patient, employee, identity, clinical, legal, financial, or regulatory information. Do not make decisions, give clinical guidance, or recommend automatic action. Return concise Arabic JSON only." },
        { role: "user", content: `Use case: ${input.useCase}\nOperational facts:\n${input.operationalFacts.map((fact, index) => `${index + 1}. ${fact}`).join("\n")}` },
      ],
      response_format: { type: "json_schema", json_schema: { name: "operational_brief", strict: true, schema: { type: "object", properties: { summary: { type: "string" }, prioritizedActions: { type: "array", items: { type: "object", properties: { action: { type: "string" }, rationale: { type: "string" }, priority: { type: "string", enum: ["low", "medium", "high"] } }, required: ["action", "rationale", "priority"], additionalProperties: false } }, requiresHumanReview: { type: "boolean" }, limitations: { type: "array", items: { type: "string" } } }, required: ["summary", "prioritizedActions", "requiresHumanReview", "limitations"], additionalProperties: false } } },
    });
    const content = response.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Operational AI returned no structured result" });
    const brief = JSON.parse(content) as GeneratedOperationalBrief;
    if (brief.requiresHumanReview !== true) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Operational AI response did not preserve human review" });
    await writeAiAudit(db, { userId: ctx.user.id, organizationId: input.organizationId, action: `ai_operational_brief_${input.useCase}` });
    return { brief, advisoryOnly: true as const, generatedAt: new Date().toISOString() };
  }),
});

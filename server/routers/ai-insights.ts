import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import {
  aiInsights,
  auditLogs,
  branches,
  branchJurisdictions,
  branchUsers,
  crmLeads,
  employeeAttendance,
  inventoryBatches,
  organizationMemberships,
  products,
  procurementRequests,
  saleItems,
  sales,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";
import { hashAuditRecord } from "../domain/internal-auth";

type Database = NonNullable<Awaited<ReturnType<typeof getDb>>>;
const managementRoles = ["owner", "org_admin", "operations_manager"] as const;
const insightTypes = [
  "purchasing_analysis",
  "decision_support",
  "improvement_proposal",
] as const;

type InsightType = (typeof insightTypes)[number];
type GeneratedInsight = {
  title: string;
  summary: string;
  evidence: Array<{ metric: string; value: string; source: string }>;
  recommendations: Array<{
    action: string;
    rationale: string;
    priority: "low" | "medium" | "high";
  }>;
  confidence: number;
  limitations: string[];
};

async function assertManagementScope(
  db: Database,
  userId: number,
  systemRole: string,
  organizationId: number,
  branchId: number,
  jurisdictionId?: number
) {
  const branch = await db
    .select({ id: branches.id })
    .from(branches)
    .where(
      and(
        eq(branches.id, branchId),
        eq(branches.organizationId, organizationId),
        eq(branches.active, 1)
      )
    )
    .limit(1);
  if (!branch.length)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Branch is outside the selected organization",
    });
  if (systemRole !== "admin") {
    const membership = await db
      .select({ id: organizationMemberships.id })
      .from(organizationMemberships)
      .where(
        and(
          eq(organizationMemberships.organizationId, organizationId),
          eq(organizationMemberships.userId, userId),
          eq(organizationMemberships.active, 1),
          inArray(organizationMemberships.organizationRole, [
            ...managementRoles,
          ])
        )
      )
      .limit(1);
    if (!membership.length)
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Organization management access is required",
      });
    const branchMembership = await db
      .select({ id: branchUsers.id })
      .from(branchUsers)
      .where(
        and(
          eq(branchUsers.branchId, branchId),
          eq(branchUsers.userId, userId),
          eq(branchUsers.active, 1)
        )
      )
      .limit(1);
    if (!branchMembership.length)
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Branch management access is required",
      });
  }
  if (jurisdictionId !== undefined) {
    const assignment = await db
      .select({ id: branchJurisdictions.id })
      .from(branchJurisdictions)
      .where(
        and(
          eq(branchJurisdictions.branchId, branchId),
          eq(branchJurisdictions.jurisdictionId, jurisdictionId)
        )
      )
      .limit(1);
    if (!assignment.length)
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Jurisdiction is not assigned to the selected branch",
      });
  }
}

async function writeInsightAudit(
  db: Database,
  input: {
    userId: number;
    organizationId: number;
    branchId: number;
    insightType: InsightType;
    insightId?: number;
    action: string;
  }
) {
  const previous = await db
    .select({ recordHash: auditLogs.recordHash })
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.organizationId, input.organizationId),
        eq(auditLogs.branchId, input.branchId)
      )
    )
    .orderBy(desc(auditLogs.id))
    .limit(1);
  const createdAt = new Date().toISOString();
  const recordHash = hashAuditRecord({
    eventType: input.action,
    userId: input.userId,
    organizationId: input.organizationId,
    branchId: input.branchId,
    jurisdictionId: null,
    requestId: `${input.insightType}:${input.insightId ?? "new"}`,
    createdAt,
  });
  await db.insert(auditLogs).values({
    userId: input.userId,
    organizationId: input.organizationId,
    branchId: input.branchId,
    action: input.action,
    entityType: "ai_insight",
    entityId: String(input.insightId ?? input.insightType),
    previousHash: previous[0]?.recordHash ?? null,
    recordHash,
  });
}

const scopeInput = z.object({
  organizationId: z.number().int().positive(),
  branchId: z.number().int().positive(),
  jurisdictionId: z.number().int().positive().optional(),
});
const generationInput = scopeInput.extend({
  historyDays: z.number().int().min(14).max(180).default(56),
  productIds: z.array(z.number().int().positive()).max(100).optional(),
});

const structuredSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    evidence: {
      type: "array",
      items: {
        type: "object",
        properties: {
          metric: { type: "string" },
          value: { type: "string" },
          source: { type: "string" },
        },
        required: ["metric", "value", "source"],
        additionalProperties: false,
      },
    },
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          action: { type: "string" },
          rationale: { type: "string" },
          priority: { type: "string", enum: ["low", "medium", "high"] },
        },
        required: ["action", "rationale", "priority"],
        additionalProperties: false,
      },
    },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    limitations: { type: "array", items: { type: "string" } },
  },
  required: [
    "title",
    "summary",
    "evidence",
    "recommendations",
    "confidence",
    "limitations",
  ],
  additionalProperties: false,
} as const;

export function validateGovernedInsight(value: unknown): GeneratedInsight {
  if (!value || typeof value !== "object")
    throw new Error("AI result must be an object");
  const parsed = value as Partial<GeneratedInsight>;
  if (
    typeof parsed.title !== "string" ||
    !parsed.title.trim() ||
    typeof parsed.summary !== "string" ||
    !parsed.summary.trim() ||
    !Array.isArray(parsed.evidence) ||
    !Array.isArray(parsed.recommendations) ||
    !Array.isArray(parsed.limitations) ||
    typeof parsed.confidence !== "number" ||
    !Number.isFinite(parsed.confidence) ||
    parsed.confidence < 0 ||
    parsed.confidence > 1
  )
    throw new Error("AI result failed governance validation");
  return parsed as GeneratedInsight;
}

async function callGovernedInsight(type: InsightType, facts: unknown) {
  const response = await invokeLLM({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content:
          "أنت محلل عمليات لمنشأة رعاية صحية. استخدم البيانات المجمعة المقدمة فقط. لا تستنتج هوية مريض أو موظف، ولا تقدم قرارًا سريريًا أو ماليًا أو وظيفيًا أو قانونيًا، ولا تنفذ شراءً أو تغييرًا. أخرج JSON عربيًا موجزًا. كل نتيجة استشارية وتتطلب مراجعة بشرية صريحة. اذكر القيود ونقص البيانات بوضوح.",
      },
      { role: "user", content: JSON.stringify({ insightType: type, facts }) },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: `ai_${type}`,
        strict: true,
        schema: structuredSchema,
      },
    },
  });
  const content = response.choices?.[0]?.message?.content;
  if (typeof content !== "string")
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "AI returned no structured result",
    });
  let parsed: GeneratedInsight;
  try {
    parsed = validateGovernedInsight(JSON.parse(content));
  } catch {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "AI result failed governance validation",
    });
  }
  return {
    ...parsed,
    confidence: Number(parsed.confidence),
    requiresHumanReview: true as const,
    advisoryOnly: true as const,
  };
}

async function getPurchasingFacts(
  db: Database,
  input: z.infer<typeof generationInput>
) {
  const start = new Date(Date.now() - (input.historyDays - 1) * 86_400_000);
  const salesFilter = [
    eq(sales.organizationId, input.organizationId),
    eq(sales.branchId, input.branchId),
    eq(sales.saleStatus, "completed"),
    gte(sales.createdAt, start),
    input.jurisdictionId
      ? eq(sales.jurisdictionId, input.jurisdictionId)
      : undefined,
  ].filter(Boolean) as any[];
  const demandRows = await db
    .select({
      productId: saleItems.productId,
      units: sql<string>`SUM(${saleItems.quantity})`,
      observedDays: sql<string>`COUNT(DISTINCT DATE(${sales.createdAt}))`,
    })
    .from(saleItems)
    .innerJoin(sales, eq(saleItems.saleId, sales.id))
    .where(
      and(
        ...salesFilter,
        ...(input.productIds?.length
          ? [inArray(saleItems.productId, input.productIds)]
          : [])
      )
    )
    .groupBy(saleItems.productId)
    .limit(100);
  const ids = demandRows.map(row => row.productId);
  const productRows = ids.length
    ? await db
        .select({ id: products.id, sku: products.sku, nameAr: products.nameAr })
        .from(products)
        .where(
          and(
            eq(products.organizationId, input.organizationId),
            inArray(products.id, ids)
          )
        )
        .limit(100)
    : [];
  const stockRows = ids.length
    ? await db
        .select({
          productId: inventoryBatches.productId,
          quantity: sql<string>`SUM(${inventoryBatches.quantityOnHand})`,
          reorderPoint: sql<string>`MAX(${inventoryBatches.reorderPoint})`,
        })
        .from(inventoryBatches)
        .where(
          and(
            eq(inventoryBatches.organizationId, input.organizationId),
            eq(inventoryBatches.branchId, input.branchId),
            inArray(inventoryBatches.productId, ids)
          )
        )
        .groupBy(inventoryBatches.productId)
    : [];
  const requests = await db
    .select({
      status: procurementRequests.status,
      count: sql<string>`COUNT(*)`,
    })
    .from(procurementRequests)
    .where(
      and(
        eq(procurementRequests.organizationId, input.organizationId),
        eq(procurementRequests.branchId, input.branchId)
      )
    )
    .groupBy(procurementRequests.status);
  const productsById = new Map(productRows.map(row => [row.id, row]));
  const stockById = new Map(stockRows.map(row => [row.productId, row]));
  return {
    scope: input,
    historyStart: start.toISOString(),
    products: demandRows.map(row => {
      const product = productsById.get(row.productId);
      const stock = stockById.get(row.productId);
      const units = Number(row.units ?? 0);
      const observedDays = Number(row.observedDays ?? 0);
      const averageDailyUnits = observedDays ? units / observedDays : 0;
      const currentStock = Number(stock?.quantity ?? 0);
      const reorderPoint = Number(stock?.reorderPoint ?? 0);
      return {
        productId: row.productId,
        sku: product?.sku ?? "unknown",
        nameAr: product?.nameAr ?? "منتج غير معروف",
        totalUnits: units,
        observedDays,
        averageDailyUnits: Number(averageDailyUnits.toFixed(3)),
        currentStock,
        reorderPoint,
        stockGap: Number((reorderPoint - currentStock).toFixed(3)),
      };
    }),
    procurementQueue: requests.map(row => ({
      status: row.status,
      count: Number(row.count ?? 0),
    })),
  };
}

async function getDecisionFacts(
  db: Database,
  input: z.infer<typeof scopeInput>
) {
  const start = new Date(Date.now() - 30 * 86_400_000);
  const salesSummary = await db
    .select({
      salesCount: sql<string>`COUNT(*)`,
      totalAmount: sql<string>`COALESCE(SUM(${sales.totalAmount}), 0)`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.organizationId, input.organizationId),
        eq(sales.branchId, input.branchId),
        eq(sales.saleStatus, "completed"),
        gte(sales.createdAt, start),
        input.jurisdictionId
          ? eq(sales.jurisdictionId, input.jurisdictionId)
          : undefined
      )
    );
  const procurementSummary = await db
    .select({
      status: procurementRequests.status,
      count: sql<string>`COUNT(*)`,
    })
    .from(procurementRequests)
    .where(
      and(
        eq(procurementRequests.organizationId, input.organizationId),
        eq(procurementRequests.branchId, input.branchId)
      )
    )
    .groupBy(procurementRequests.status);
  const attendanceSummary = await db
    .select({ status: employeeAttendance.status, count: sql<string>`COUNT(*)` })
    .from(employeeAttendance)
    .where(
      and(
        eq(employeeAttendance.organizationId, input.organizationId),
        eq(employeeAttendance.branchId, input.branchId),
        gte(employeeAttendance.workDate, start)
      )
    )
    .groupBy(employeeAttendance.status);
  const crmSummary = await db
    .select({ stage: crmLeads.stage, count: sql<string>`COUNT(*)` })
    .from(crmLeads)
    .where(
      and(
        eq(crmLeads.organizationId, input.organizationId),
        eq(crmLeads.branchId, input.branchId)
      )
    )
    .groupBy(crmLeads.stage);
  return {
    scope: input,
    windowStart: start.toISOString(),
    sales: {
      count: Number(salesSummary[0]?.salesCount ?? 0),
      totalAmount: Number(salesSummary[0]?.totalAmount ?? 0),
    },
    procurement: procurementSummary.map(row => ({
      status: row.status,
      count: Number(row.count ?? 0),
    })),
    attendance: attendanceSummary.map(row => ({
      status: row.status,
      count: Number(row.count ?? 0),
    })),
    crm: crmSummary.map(row => ({
      stage: row.stage,
      count: Number(row.count ?? 0),
    })),
  };
}

async function persistInsight(
  db: Database,
  userId: number,
  input: z.infer<typeof scopeInput>,
  type: InsightType,
  result: GeneratedInsight & { requiresHumanReview: true }
) {
  const inserted = await db.insert(aiInsights).values({
    organizationId: input.organizationId,
    branchId: input.branchId,
    jurisdictionId: input.jurisdictionId ?? null,
    insightType: type,
    status: "generated",
    title: result.title.slice(0, 240),
    summary: result.summary,
    evidenceJson: JSON.stringify({
      evidence: result.evidence,
      limitations: result.limitations,
    }),
    recommendationJson: JSON.stringify(result.recommendations),
    confidence: result.confidence.toFixed(4),
    requiresHumanReview: 1,
    createdByUserId: userId,
  });
  const insightId = Number(inserted[0].insertId);
  await writeInsightAudit(db, {
    userId,
    organizationId: input.organizationId,
    branchId: input.branchId,
    insightType: type,
    insightId,
    action: `ai_${type}_generated`,
  });
  return { insightId, ...result, generatedAt: new Date().toISOString() };
}

export const aiInsightsRouter = router({
  list: protectedProcedure
    .input(
      scopeInput.extend({
        insightType: z.enum(insightTypes).optional(),
        status: z
          .enum([
            "generated",
            "under_review",
            "accepted",
            "rejected",
            "dismissed",
          ])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      await assertManagementScope(
        db,
        ctx.user.id,
        ctx.user.role,
        input.organizationId,
        input.branchId,
        input.jurisdictionId
      );
      return db
        .select()
        .from(aiInsights)
        .where(
          and(
            eq(aiInsights.organizationId, input.organizationId),
            eq(aiInsights.branchId, input.branchId),
            input.jurisdictionId
              ? eq(aiInsights.jurisdictionId, input.jurisdictionId)
              : undefined,
            input.insightType
              ? eq(aiInsights.insightType, input.insightType)
              : undefined,
            input.status ? eq(aiInsights.status, input.status) : undefined
          )
        )
        .orderBy(desc(aiInsights.createdAt))
        .limit(100);
    }),
  generatePurchasingAnalysis: protectedProcedure
    .input(generationInput)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      await assertManagementScope(
        db,
        ctx.user.id,
        ctx.user.role,
        input.organizationId,
        input.branchId,
        input.jurisdictionId
      );
      const facts = await getPurchasingFacts(db, input);
      const result = await callGovernedInsight("purchasing_analysis", facts);
      return persistInsight(
        db,
        ctx.user.id,
        input,
        "purchasing_analysis",
        result
      );
    }),
  generateDecisionSupport: protectedProcedure
    .input(scopeInput)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      await assertManagementScope(
        db,
        ctx.user.id,
        ctx.user.role,
        input.organizationId,
        input.branchId,
        input.jurisdictionId
      );
      const facts = await getDecisionFacts(db, input);
      const result = await callGovernedInsight("decision_support", facts);
      return persistInsight(db, ctx.user.id, input, "decision_support", result);
    }),
  generateImprovementProposal: protectedProcedure
    .input(scopeInput)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      await assertManagementScope(
        db,
        ctx.user.id,
        ctx.user.role,
        input.organizationId,
        input.branchId,
        input.jurisdictionId
      );
      const facts = await getDecisionFacts(db, input);
      const result = await callGovernedInsight("improvement_proposal", facts);
      return persistInsight(
        db,
        ctx.user.id,
        input,
        "improvement_proposal",
        result
      );
    }),
  review: protectedProcedure
    .input(
      z.object({
        insightId: z.number().int().positive(),
        nextStatus: z.enum([
          "under_review",
          "accepted",
          "rejected",
          "dismissed",
        ]),
        reviewNote: z.string().trim().max(1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      const insight = (
        await db
          .select()
          .from(aiInsights)
          .where(eq(aiInsights.id, input.insightId))
          .limit(1)
      )[0];
      if (!insight)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "AI insight not found",
        });
      await assertManagementScope(
        db,
        ctx.user.id,
        ctx.user.role,
        insight.organizationId,
        insight.branchId ?? 0,
        insight.jurisdictionId ?? undefined
      );
      await db
        .update(aiInsights)
        .set({
          status: input.nextStatus,
          reviewedByUserId: ctx.user.id,
          reviewedAt: new Date(),
          reviewNote: input.reviewNote ?? null,
        })
        .where(eq(aiInsights.id, insight.id));
      await writeInsightAudit(db, {
        userId: ctx.user.id,
        organizationId: insight.organizationId,
        branchId: insight.branchId ?? 0,
        insightType: insight.insightType,
        insightId: insight.id,
        action: `ai_${insight.insightType}_${input.nextStatus}`,
      });
      return {
        insightId: insight.id,
        status: input.nextStatus,
        humanReviewed: true as const,
      };
    }),
});

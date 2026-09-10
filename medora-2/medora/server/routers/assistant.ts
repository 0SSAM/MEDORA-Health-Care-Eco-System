import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import { z } from "zod";
import { assessSmartTypingSafety, sanitizeSmartTypingSuggestions, SMART_TYPING_FIELDS } from "../domain/smart-typing-policy";
import { invokeLLM } from "../_core/llm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { assistantFailureEvents, branches, branchUsers, callTickets, notifications, organizationMemberships, policyKnowledgeArticles } from "../../drizzle/schema";
import { assistantFailureAlertCopy, nextAssistantFailureState, shouldNotifyAssistantFailure } from "../domain/assistant-failure-monitor";

const scopeInput = z.object({
  organizationId: z.number().int().positive(),
  branchId: z.number().int().positive().nullable().optional(),
});

async function assertScope(userId: number, systemRole: string, organizationId: number, branchId?: number | null) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "قاعدة البيانات غير متاحة حالياً" });
  if (systemRole !== "admin") {
    const membership = await db.select({ id: organizationMemberships.id }).from(organizationMemberships).where(and(
      eq(organizationMemberships.organizationId, organizationId),
      eq(organizationMemberships.userId, userId),
      eq(organizationMemberships.active, 1),
    )).limit(1);
    if (!membership.length) throw new TRPCError({ code: "FORBIDDEN", message: "الحساب خارج نطاق المؤسسة" });
  }
  if (branchId) {
    const branch = await db.select({ id: branches.id }).from(branches).where(and(eq(branches.id, branchId), eq(branches.organizationId, organizationId), eq(branches.active, 1))).limit(1);
    if (!branch.length) throw new TRPCError({ code: "FORBIDDEN", message: "الفرع خارج نطاق المؤسسة" });
    if (systemRole !== "admin") {
      const assignment = await db.select({ id: branchUsers.id }).from(branchUsers).where(and(
        eq(branchUsers.branchId, branchId),
        eq(branchUsers.userId, userId),
        eq(branchUsers.active, 1),
      )).limit(1);
      if (!assignment.length) throw new TRPCError({ code: "FORBIDDEN", message: "لا يوجد تعيين نشط لهذا الحساب في الفرع" });
    }
  }
  return db;
}

const safeSystemPrompt = `أنت مساعد MEDORA الصحي التشغيلي. أجب بالعربية أو الإنجليزية حسب لغة المستخدم. استخدم فقط الحقائق التي يرسلها المستخدم في السياق. لا تشخّص المرضى، ولا تقترح جرعات، ولا تكشف بيانات شخصية، ولا تنفذ قيوداً أو مشتريات أو تغييرات صلاحيات. عند طلب عملية حساسة اشرح الخطوات واطلب تأكيداً بشرياً من شاشة MEDORA. إذا لم تتوفر بيانات كافية فقل ذلك بوضوح. اجعل الإجابات عملية ومختصرة ومناسبة لدور المستخدم، ولا تدّعي أنك اتصلت بجهة حكومية أو جهاز أو نظام خارجي.`;

const smartTypingInput = scopeInput.extend({
  language: z.enum(["ar", "en"]).default("ar"),
  screen: z.string().trim().min(1).max(80),
  fieldName: z.enum(SMART_TYPING_FIELDS),
  partialText: z.string().trim().min(6).max(650),
});

export const assistantRouter = router({
  recordWorkspaceLoadFailure: protectedProcedure.input(scopeInput.extend({
    failureKey: z.enum(["assistant_workspace_lazy_load", "assistant_workspace_runtime"]),
  })).mutation(async ({ ctx, input }) => {
    const db = await assertScope(ctx.user.id, ctx.user.role, input.organizationId, input.branchId);
    const now = new Date();
    const existing = await db.select({
      id: assistantFailureEvents.id,
      failureCount: assistantFailureEvents.failureCount,
      windowStartedAt: assistantFailureEvents.windowStartedAt,
      lastAlertedAt: assistantFailureEvents.lastAlertedAt,
    }).from(assistantFailureEvents).where(and(
      eq(assistantFailureEvents.organizationId, input.organizationId),
      input.branchId ? eq(assistantFailureEvents.branchId, input.branchId) : isNull(assistantFailureEvents.branchId),
      eq(assistantFailureEvents.failureKey, input.failureKey),
    )).limit(1);
    const current = existing[0] ?? null;
    const next = nextAssistantFailureState(current ? {
      failureCount: current.failureCount,
      windowStartedAt: current.windowStartedAt,
      lastAlertedAt: current.lastAlertedAt,
    } : null, now);
    const shouldAlert = shouldNotifyAssistantFailure(next, now);
    if (current) {
      await db.update(assistantFailureEvents).set({
        failureCount: next.failureCount,
        windowStartedAt: next.windowStartedAt,
        lastFailedAt: now,
        lastAlertedAt: shouldAlert ? now : current.lastAlertedAt,
      }).where(eq(assistantFailureEvents.id, current.id));
    } else {
      await db.insert(assistantFailureEvents).values({
        organizationId: input.organizationId,
        branchId: input.branchId ?? null,
        failureKey: input.failureKey,
        failureCount: next.failureCount,
        windowStartedAt: next.windowStartedAt,
        lastFailedAt: now,
        lastAlertedAt: shouldAlert ? now : null,
      });
    }
    if (shouldAlert) {
      const copy = assistantFailureAlertCopy("ar");
      await db.insert(notifications).values({
        organizationId: input.organizationId,
        branchId: input.branchId ?? null,
        audienceRole: "manager",
        severity: "warning",
        title: copy.title,
        body: copy.body,
        expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
        createdByUserId: ctx.user.id,
        active: 1,
      });
    }
    return { recorded: true as const, failureCount: next.failureCount, managerAlerted: shouldAlert };
  }),
  chat: protectedProcedure.input(z.object({
    organizationId: z.number().int().positive(),
    branchId: z.number().int().positive().nullable().optional(),
    language: z.enum(["ar", "en"]).default("ar"),
    screen: z.string().trim().max(80).optional(),
    messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(4000) })).min(1).max(20),
  })).mutation(async ({ ctx, input }) => {
    const db = await assertScope(ctx.user.id, ctx.user.role, input.organizationId, input.branchId);
    const latestQuestion = input.messages[input.messages.length - 1]?.content ?? "";
    const terms = latestQuestion.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 20);
    const policyRows = await db.select({ title: policyKnowledgeArticles.title, category: policyKnowledgeArticles.category, content: policyKnowledgeArticles.content, version: policyKnowledgeArticles.version, sourceReference: policyKnowledgeArticles.sourceReference }).from(policyKnowledgeArticles).where(and(
      eq(policyKnowledgeArticles.organizationId, input.organizationId),
      eq(policyKnowledgeArticles.status, "approved"),
      input.branchId ? or(eq(policyKnowledgeArticles.branchId, input.branchId), isNull(policyKnowledgeArticles.branchId)) : isNull(policyKnowledgeArticles.branchId),
    )).orderBy(desc(policyKnowledgeArticles.updatedAt)).limit(40);
    const approvedContext = policyRows.filter(row => terms.some(term => `${row.title} ${row.category} ${row.content}`.toLowerCase().includes(term))).slice(0, 8);
    const policyBlock = approvedContext.length
      ? `\\nسياسات MEDORA المعتمدة ذات الصلة (مرجع إرشادي لا يتجاوز صلاحيات النظام):\\n${approvedContext.map((row, index) => `[${index + 1}] ${row.title} | ${row.category} | الإصدار ${row.version}${row.sourceReference ? ` | المرجع: ${row.sourceReference}` : ""}\\n${row.content}`).join("\\n\\n")}`
      : "\\nلم تُعثر على سياسة معتمدة مطابقة للسؤال. لا تخترع سياسة واطلب من المستخدم فتح تذكرة عند الحاجة.";
    const response = await invokeLLM({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: `${safeSystemPrompt}\nلغة الرد المطلوبة: ${input.language === "ar" ? "العربية" : "English"}. الشاشة الحالية: ${input.screen ?? "غير محددة"}. النطاق: مؤسسة ${input.organizationId}${input.branchId ? `، فرع ${input.branchId}` : "، عرض مركزي"}.${policyBlock}\nاذكر مرجع السياسة ورقمها عند الاعتماد على سياقها، وصرّح بعدم وجود سياسة مطابقة إذا لم يوجد سياق.` },
        ...input.messages,
      ],
    });
    const content = response.choices?.[0]?.message?.content;
    const text = typeof content === "string" ? content : "لم أتمكن من إنتاج إجابة آمنة الآن. افتح تذكرة دعم ليقوم الفريق بمراجعتها.";
    return { text, advisoryOnly: true as const, generatedAt: new Date().toISOString() };
  }),
  smartSuggest: protectedProcedure.input(smartTypingInput).mutation(async ({ ctx, input }) => {
    // Authorization is checked even though this request intentionally makes no
    // database write. The fragment is transient and is never logged or audited.
    await assertScope(ctx.user.id, ctx.user.role, input.organizationId, input.branchId);
    const safety = assessSmartTypingSafety(input.partialText);
    const generatedAt = new Date().toISOString();
    if (!safety.allowed) {
      return { suggestions: [] as string[], advisoryOnly: true as const, unavailable: true, generatedAt };
    }

    try {
      const response = await invokeLLM({
        model: "gpt-5-mini",
        maxTokens: 180,
        outputSchema: {
          name: "smart_typing_suggestions",
          strict: true,
          schema: {
            type: "object",
            properties: { suggestions: { type: "array", items: { type: "string" }, maxItems: 3 } },
            required: ["suggestions"],
            additionalProperties: false,
          },
        },
        messages: [
          {
            role: "system",
            content: `You generate optional MEDORA drafting suggestions for a non-clinical internal field. Return 0-3 concise, plain-text replacement drafts in ${input.language === "ar" ? "Arabic" : "English"}. Do not include names, identifiers, contact details, patient data, diagnoses, doses, prescriptions, secrets, URLs, markup, operational decisions, or instructions to bypass policy. Never claim an action happened. The user must review and explicitly select any draft; this is advisory only.`,
          },
          {
            role: "user",
            content: `Screen: ${input.screen}\nField: ${input.fieldName}\nPartial draft (transient; do not repeat sensitive data): ${input.partialText}`,
          },
        ],
      });
      const content = response.choices?.[0]?.message?.content;
      const parsed = typeof content === "string" ? JSON.parse(content) as { suggestions?: unknown } : null;
      return {
        suggestions: sanitizeSmartTypingSuggestions(parsed?.suggestions),
        advisoryOnly: true as const,
        unavailable: false,
        generatedAt,
      };
    } catch {
      // Degrade to a normal field if the model or structured output is unavailable.
      return { suggestions: [] as string[], advisoryOnly: true as const, unavailable: true, generatedAt };
    }
  }),
  listTickets: protectedProcedure.input(scopeInput).query(async ({ ctx, input }) => {
    const db = await assertScope(ctx.user.id, ctx.user.role, input.organizationId, input.branchId);
    return db.select().from(callTickets).where(and(
      eq(callTickets.organizationId, input.organizationId),
      input.branchId ? eq(callTickets.branchId, input.branchId) : undefined,
    )).orderBy(desc(callTickets.createdAt)).limit(100);
  }),
  createTicket: protectedProcedure.input(z.object({
    organizationId: z.number().int().positive(),
    branchId: z.number().int().positive().nullable().optional(),
    subject: z.string().trim().min(4).max(220),
    description: z.string().trim().min(10).max(4000),
    priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
    channel: z.enum(["web", "phone", "whatsapp", "in_person"]).default("web"),
  })).mutation(async ({ ctx, input }) => {
    const db = await assertScope(ctx.user.id, ctx.user.role, input.organizationId, input.branchId);
    const result = await db.insert(callTickets).values({
      organizationId: input.organizationId,
      branchId: input.branchId ?? null,
      channel: input.channel,
      direction: "inbound",
      subject: input.subject,
      disposition: input.description,
      priority: input.priority,
      status: "open",
      createdByUserId: ctx.user.id,
    });
    return { id: Number(result[0].insertId), status: "open" as const };
  }),
});

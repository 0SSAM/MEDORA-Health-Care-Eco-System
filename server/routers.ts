import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions, isSecureRequest } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { allowNlmManualRefresh, clearNlmIcd10Cache, getNlmIcd10CacheStats, searchNlmIcd10Cm } from "./domain/nlm-icd10";
import { erpRouter } from "./routers/erp";
import { inventoryTransferRouter } from "./routers/inventory-transfer";
import { inventoryAdjustmentRouter } from "./routers/inventory-adjustment";
import { miscellaneousExpenseRouter } from "./routers/miscellaneous-expense";
import { timeGuardRouter } from "./routers/time-guard";
import { attendanceRouter } from "./routers/attendance";
import { payrollRouter } from "./routers/payroll";
import { leavePermissionRouter } from "./routers/leave-permission";
import { regionalRouter } from "./routers/regional";
import { organizationsRouter } from "./routers/organizations";
import { notificationsRouter } from "./routers/notifications";
import { reportsRouter } from "./routers/reports";
import { insuranceRouter } from "./routers/insurance";
import { promotionsRouter } from "./routers/promotions";
import { egyptHealthcareRouter } from "./routers/egypt-healthcare";
import { operationsRouter } from "./routers/operations";
import { aiGovernanceRouter } from "./routers/ai-governance";
import { aiInsightsRouter } from "./routers/ai-insights";
import { antiFraudRouter } from "./routers/anti-fraud";
import { createPasswordResetToken, getInternalCredentialByUsername, getInternalScopeForUser, createInternalSession, recordAuthenticationEvent, resetInternalPasswordWithToken, revokeInternalSession } from "./db";
import { assertPasswordPolicy, createInternalSessionToken, INTERNAL_LOCKOUT_MS, INTERNAL_MAX_FAILED_ATTEMPTS, INTERNAL_SESSION_COOKIE, INTERNAL_SESSION_TTL_MS, isLocked, normalizeInternalUsername, verifyInternalPassword } from "./domain/internal-auth";
import { hashInternalPassword, hashAuditRecord } from "./domain/internal-auth";
import { safeErrorLabel } from "./domain/safe-error";
import { buildGovernmentIntegrationReadinessPacket } from "./domain/government-integration-readiness";

const connectorReadinessRegistry = [
  {
    id: "egypt-government",
    category: "government" as const,
    connectorType: "government-regulatory" as const,
    countryCode: "EG" as const,
    name: "الجهات الحكومية المصرية",
    providers: ["UPA", "EDA", "ETA", "UHIA"],
    jurisdiction: "EG",
    state: "blocked" as const,
    readinessPercent: 0,
    prerequisites: ["مواصفة endpoint رسمية", "اعتماد وبيانات تسجيل المؤسسة", "اعتمادات سرية عبر مدير الأسرار", "بيئة sandbox واختبار قبول موثق"],
    lastReviewedAt: "2026-08-15T00:00:00.000Z",
    accreditationExpiresAt: "2026-09-13T00:00:00.000Z",
    lastStatusChangedAt: "2026-08-10T00:00:00.000Z",
    previousState: "deferred" as const,
    statusChangeReason: "تثبيت الإغلاق الآمن بعد مراجعة حدود الاعتماد الخارجي",
    note: "لا توجد أي مكالمات خارجية أو إرسال بيانات قبل استيفاء بوابة الجاهزية والقبول البشري.",
  },
  {
    id: "insurance-payers",
    category: "insurance" as const,
    connectorType: "insurance-payer" as const,
    countryCode: "EG" as const,
    name: "شركات التأمين والجهات الدافعة",
    providers: ["TPA / Payer APIs"],
    jurisdiction: "EG",
    state: "blocked" as const,
    readinessPercent: 0,
    prerequisites: ["عقد API وخرائط الأهلية والمطالبات", "اعتمادات الجهة الدافعة", "بيئة اختبار sandbox", "اختبارات قبول ومطابقة التسويات"],
    lastReviewedAt: "2026-08-15T00:00:00.000Z",
    accreditationExpiresAt: "2026-08-20T00:00:00.000Z",
    lastStatusChangedAt: "2026-08-13T00:00:00.000Z",
    previousState: "deferred" as const,
    statusChangeReason: "تحديث سياسة الجاهزية مع إبقاء النقل الخارجي مغلقًا",
    note: "تظل الأهلية والموافقات والمطالبات في نطاق داخلي غير مرسل حتى الاعتماد الرسمي.",
  },
] as const;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    sessionInfo: publicProcedure.query(({ ctx }) => ctx.user ? {
      authenticated: true as const,
      accountType: "employee" as const,
      sessionMode: ctx.internalSession?.session.sessionMode ?? "production" as const,
      role: ctx.user.role,
      expiresAt: ctx.internalSession?.session.expiresAt ?? null,
    } : { authenticated: false as const }),
    connectorReadiness: adminProcedure.input(z.object({
      countryCode: z.enum(["ALL", "EG"]).default("ALL"),
      provider: z.string().trim().min(1).max(80).default("ALL"),
      connectorType: z.enum(["ALL", "government-regulatory", "insurance-payer"]).default("ALL"),
      readinessState: z.enum(["ALL", "blocked", "deferred", "ready"]).default("ALL"),
    }).optional()).query(({ input, ctx }) => {
      const filters = input ?? { countryCode: "ALL" as const, provider: "ALL", connectorType: "ALL" as const, readinessState: "ALL" as const };
      const connectors = connectorReadinessRegistry.filter(connector =>
        (filters.countryCode === "ALL" || connector.countryCode === filters.countryCode)
        && (filters.connectorType === "ALL" || connector.connectorType === filters.connectorType)
        && (filters.readinessState === "ALL" || connector.state === filters.readinessState)
        && (filters.provider === "ALL" || (connector.providers as readonly string[]).includes(filters.provider)),
      );
      const reviewedAt = new Date().toISOString();
      const now = Date.now();
      const alerts = connectors.flatMap(connector => {
        const daysUntilExpiry = Math.ceil((Date.parse(connector.accreditationExpiresAt) - now) / 86_400_000);
        const expiryAlert = daysUntilExpiry <= 30 ? [{
          id: `${connector.id}:expiry`,
          connectorId: connector.id,
          kind: daysUntilExpiry < 0 ? "expired" as const : "expiry" as const,
          severity: daysUntilExpiry <= 7 ? "critical" as const : "warning" as const,
          daysUntilExpiry,
          occurredAt: connector.accreditationExpiresAt,
          title: daysUntilExpiry < 0 ? "انتهت صلاحية الاعتماد" : "اقتربت صلاحية الاعتماد",
          detail: daysUntilExpiry < 0 ? "يجب تجديد الاعتماد قبل أي طلب تفعيل خارجي." : `متبقٍ ${daysUntilExpiry} يومًا على تاريخ الانتهاء.`,
          acknowledged: false,
        }] : [];
        const statusAlert = [{
          id: `${connector.id}:status`,
          connectorId: connector.id,
          kind: "status-change" as const,
          severity: "info" as const,
          daysUntilExpiry: null,
          occurredAt: connector.lastStatusChangedAt,
          title: "تغيرت حالة الموصل",
          detail: `${connector.previousState} ← ${connector.state}. ${connector.statusChangeReason}`,
          acknowledged: false,
        }];
        return [...expiryAlert, ...statusAlert];
      });
      const auditLog = connectors.map(connector => {
        const safeEvent = {
          eventType: "connector_readiness_reviewed",
          connectorId: connector.id,
          connectorType: connector.connectorType,
          countryCode: connector.countryCode,
          previousState: null,
          newState: connector.state,
          reason: "Initial readiness registry review; no external activation",
          actorUserId: ctx.user.id,
          organizationId: null,
          branchId: null,
          jurisdictionId: null,
          requestId: null,
          createdAt: reviewedAt,
        };
        return { ...safeEvent, recordHash: hashAuditRecord(safeEvent), integrity: "tamper-evident" as const };
      });
      return {
        reviewedAt,
        activationPolicy: "fail-closed" as const,
        filters,
        connectors,
        alerts,
        auditLog,
        filterOptions: {
          total: connectorReadinessRegistry.length,
          countries: Array.from(new Set(connectorReadinessRegistry.map(connector => connector.countryCode))),
          providers: Array.from(new Set(connectorReadinessRegistry.flatMap(connector => connector.providers))),
          connectorTypes: Array.from(new Set(connectorReadinessRegistry.map(connector => connector.connectorType))),
          readinessStates: Array.from(new Set(connectorReadinessRegistry.map(connector => connector.state))),
        },
      };
    }),
    governmentIntegrationPacket: adminProcedure.query(({ ctx }) => {
      const packet = buildGovernmentIntegrationReadinessPacket();
      const reviewedAt = new Date().toISOString();
      const safeEvent = {
        eventType: "government_integration_packet_reviewed",
        connectorId: packet.connectorId,
        packetVersion: packet.packetVersion,
        activationState: packet.activationState,
        externalSubmissionAllowed: packet.externalSubmissionAllowed,
        actorUserId: ctx.user.id,
        createdAt: reviewedAt,
      };
      return {
        ...packet,
        reviewedAt,
        audit: { ...safeEvent, recordHash: hashAuditRecord(safeEvent), integrity: "tamper-evident" as const },
      };
    }),
    securityReadiness: protectedProcedure.query(() => ({
      twoFactorState: "deferred" as const,
      recoveryChannelState: "deferred" as const,
      emailProviderConfigured: false as const,
      externalActivation: "blocked" as const,
      reason: "لا توجد قناة بريد أو OTP مؤسسية موثقة حالياً؛ تبقى الأسرار والرموز والتسليم الخارجي مغلقة بأمان.",
    })),
    internalLogin: publicProcedure.input(z.object({ username: z.string().min(3).max(80), password: z.string().min(1).max(200) })).mutation(async ({ ctx, input }) => {
      const recordLoginFailure = async (event: Parameters<typeof recordAuthenticationEvent>[0]) => {
        try {
          await recordAuthenticationEvent(event);
        } catch (error) {
          console.error("[Auth] login failure audit unavailable:", safeErrorLabel(error));
        }
      };
      try {
      const username = normalizeInternalUsername(input.username);
      const credential = await getInternalCredentialByUsername(username);
      const now = new Date();
      const invalid = () => ({ success: false as const, message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      if (!credential || !credential.active || isLocked(credential.lockedUntil, now) || !verifyInternalPassword(input.password, credential.passwordHash)) {
        if (credential) {
          const nextAttempts = credential.failedAttempts + 1;
          const shouldLock = nextAttempts >= INTERNAL_MAX_FAILED_ATTEMPTS;
          const db = await (await import("./db")).getDb();
          if (db) {
            const { internalCredentials } = await import("../drizzle/schema");
            const { eq } = await import("drizzle-orm");
            await db.update(internalCredentials).set({ failedAttempts: shouldLock ? 0 : nextAttempts, lockedUntil: shouldLock ? new Date(now.getTime() + INTERNAL_LOCKOUT_MS) : null }).where(eq(internalCredentials.id, credential.id));
          }
          await recordLoginFailure({ username, userId: credential.userId, eventType: shouldLock ? "lockout" : "login_failure", source: "internal" });
        } else {
          await recordLoginFailure({ username, eventType: "login_failure", source: "internal" });
        }
        return invalid();
      }
      const scope = await getInternalScopeForUser(credential.userId);
      if (!scope) {
        await recordLoginFailure({ username, userId: credential.userId, eventType: "login_failure", source: "internal" });
        return invalid();
      }
      const token = createInternalSessionToken();
      await createInternalSession({ token, userId: credential.userId, ...scope, expiresAt: new Date(now.getTime() + INTERNAL_SESSION_TTL_MS) });
      await recordAuthenticationEvent({ username, userId: credential.userId, ...scope, eventType: "login_success", source: "internal" });
      ctx.res.cookie(INTERNAL_SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: isSecureRequest(ctx.req), path: "/" });
      return { success: true as const, mode: "internal" as const, scope, accountType: "employee" as const, sessionMode: "production" as const };
      } catch (error) {
        console.error("[Auth] internal login unavailable:", error);
        return { success: false as const, message: "تعذر التحقق من البيانات حالياً. تأكد من الاتصال وحاول مرة أخرى." };
      }
    }),
    requestPasswordReset: publicProcedure.input(z.object({ username: z.string().min(3).max(80) })).mutation(async ({ input }) => {
      const generic = { success: true as const, message: "إذا كانت بيانات الحساب صحيحة، فسيتم إرسال تعليمات الاستعادة عبر قناة المؤسسة المعتمدة." };
      let username: string;
      try { username = normalizeInternalUsername(input.username); } catch { return generic; }
      const credential = await getInternalCredentialByUsername(username);
      if (!credential || !credential.active) {
        await recordAuthenticationEvent({ username, eventType: "password_reset_requested", source: "internal" });
        return generic;
      }
      const token = createInternalSessionToken();
      await createPasswordResetToken({ userId: credential.userId, credentialId: credential.id, token, expiresAt: new Date(Date.now() + 30 * 60 * 1000) });
      await recordAuthenticationEvent({ username, userId: credential.userId, eventType: "password_reset_requested", source: "internal" });
      // Token delivery is intentionally not returned to the browser. A verified email/OTP adapter must be configured before production delivery.
      return generic;
    }),
    resetPassword: publicProcedure.input(z.object({ token: z.string().min(32).max(200), password: z.string().min(12).max(200), confirmPassword: z.string().min(12).max(200) })).mutation(async ({ input }) => {
      if (input.password !== input.confirmPassword) return { success: false as const, message: "كلمتا المرور غير متطابقتين" };
      try { assertPasswordPolicy(input.password); } catch { return { success: false as const, message: "يجب أن تتضمن كلمة المرور 12 حرفاً على الأقل، وحرفاً كبيراً وصغيراً ورقماً" }; }
      const passwordHash = hashInternalPassword(input.password);
      const reset = await resetInternalPasswordWithToken({ token: input.token, passwordHash });
      if (!reset) return { success: false as const, message: "رابط الاستعادة غير صالح أو منتهي أو مستخدم مسبقاً" };
      await recordAuthenticationEvent({ userId: reset.userId, eventType: "password_reset_completed", source: "internal" });
      return { success: true as const, message: "تم تحديث كلمة المرور. يمكنك تسجيل الدخول الآن." };
    }),
    internalLogout: publicProcedure.mutation(async ({ ctx }) => {
      const token = ctx.req.cookies?.[INTERNAL_SESSION_COOKIE];
      if (token) await revokeInternalSession(token);
      ctx.res.clearCookie(INTERNAL_SESSION_COOKIE, { httpOnly: true, sameSite: "lax", secure: isSecureRequest(ctx.req), maxAge: 0, path: "/" });
      return { success: true as const };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  attendance: attendanceRouter,
  payroll: payrollRouter,
  hr: leavePermissionRouter,
  erp: erpRouter,
  inventoryTransfer: inventoryTransferRouter,
  inventoryAdjustment: inventoryAdjustmentRouter,
  miscellaneousExpense: miscellaneousExpenseRouter,
  timeGuard: timeGuardRouter,
  regional: regionalRouter,
  organizations: organizationsRouter,
  notifications: notificationsRouter,
  reports: reportsRouter,
  insurance: insuranceRouter,
  promotions: promotionsRouter,
  egyptHealthcare: egyptHealthcareRouter,
  operations: operationsRouter,
  aiGovernance: aiGovernanceRouter,
  aiInsights: aiInsightsRouter,
  antiFraud: antiFraudRouter,
  communication: router({
    sendWhatsApp: protectedProcedure
      .input(z.object({
        to: z.string(),
        text: z.string().optional(),
        templateName: z.string().optional()
      }))
      .mutation(async ({ input, ctx }) => {
        // Enforce role-based access control based on valid application roles.
        // The 'operations_manager' is a placeholder for future granular roles.
        if (!["admin", "manager"].includes(ctx.user.role)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية إرسال رسائل التواصل. تتطلب هذه العملية صلاحيات إدارية." });
        }
        const { sendWhatsAppMessage } = await import("./connectors/whatsapp");
        const result = await sendWhatsAppMessage(input);
        
        if (!result.success && result.state === "blocked") {
          throw new TRPCError({ 
            code: "PRECONDITION_FAILED", 
            message: "خدمة WhatsApp غير مفعلة حالياً. يرجى إعداد مفاتيح API في لوحة التحكم." 
          });
        }
        
        return result;
      }),
  }),
  reference: router({
    nlmIcd10CmSearch: protectedProcedure.input(z.object({ terms: z.string().min(2).max(120), count: z.number().int().min(1).max(50).optional() })).query(async ({ ctx, input }) => {
      if (!["admin", "manager", "pharmacist"].includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية البحث السريري المرجعي." });
      return {
        authority: "reference-only" as const,
        warning: "NLM ICD-10-CM is a US reference source and does not finalize diagnoses, claims, or billing.",
        results: await searchNlmIcd10Cm(input.terms, { count: input.count }),
        cache: getNlmIcd10CacheStats(),
      };
    }),
    nlmIcd10CmRefresh: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "تحديث النتائج المخزنة متاح للمسؤولين فقط." });
      if (!allowNlmManualRefresh(`user:${ctx.user.id}`)) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "يمكن تحديث الذاكرة المرجعية مرة كل دقيقة فقط." });
      clearNlmIcd10Cache();
      await recordAuthenticationEvent({ userId: ctx.user.id, eventType: "cache_refreshed", source: "oauth" });
      return { success: true as const, message: "تم تحديث نتائج NLM المرجعية. سيُعاد جلبها عند البحث التالي.", stats: getNlmIcd10CacheStats() };
    }),
  }),
});

export type AppRouter = typeof appRouter;

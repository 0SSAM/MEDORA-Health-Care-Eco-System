import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getKpiRoleTemplate, listKpiRoleTemplates } from "../domain/kpi-role-templates";
import { getRawPool } from "../channels/db";

const scopeInput = z.object({
  organizationId: z.number().int().positive(),
  branchId: z.number().int().positive(),
  jurisdictionId: z.number().int().nonnegative(),
});

const templateRole = z.enum(["doctor", "customer_service", "warehouse_manager"]);

function assertSessionScope(ctx: { internalSession: { session: { organizationId: number; branchId: number; jurisdictionId: number } } | null }, input: z.infer<typeof scopeInput>) {
  const session = ctx.internalSession?.session;
  if (!session || session.organizationId !== input.organizationId || session.branchId !== input.branchId || session.jurisdictionId !== input.jurisdictionId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "نطاق جلسة KPI لا يطابق المؤسسة أو الفرع أو الاختصاص القانوني الحالي." });
  }
}

export const kpiRouter = router({
  listRoleTemplates: protectedProcedure.input(scopeInput).query(({ ctx, input }) => {
    assertSessionScope(ctx, input);
    return {
      scope: input,
      templateCount: listKpiRoleTemplates().length,
      templates: listKpiRoleTemplates(),
      applyMode: "preview-and-human-approval" as const,
    };
  }),
  previewRoleTemplate: protectedProcedure.input(scopeInput.extend({ role: templateRole })).query(({ ctx, input }) => {
    assertSessionScope(ctx, input);
    return {
      scope: { organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId },
      template: getKpiRoleTemplate(input.role),
      applyMode: "preview-and-human-approval" as const,
      note: "هذه المعاينة لا تنشئ تعييناً ولا تستبدل مؤشرات مخصصة؛ يلزم اعتماد بشري في مسار إدارة الأداء.",
    };
  }),
  dashboard: protectedProcedure.input(scopeInput).query(async ({ ctx, input }) => {
    assertSessionScope(ctx, input);
    const pool = getRawPool();
    const [att] = await pool.query("SELECT COUNT(*) total, SUM(status IN ('present','late')) presentLate, SUM(status='late') late, SUM(status='absent') absent FROM employee_attendance WHERE organizationId=? AND branchId=? AND DATE(workDate)=CURDATE()", [input.organizationId, input.branchId]);
    const a = (att as Array<Record<string, number | null>>)[0] ?? {};
    const total = Number(a.total ?? 0);
    const rate = total > 0 ? Math.round((Number(a.presentLate ?? 0) / total) * 1000) / 10 : 0;
    const [care] = await pool.query("SELECT COUNT(*) total, SUM(status='open') open FROM call_tickets WHERE organizationId=? AND branchId=?", [input.organizationId, input.branchId]);
    const c = (care as Array<Record<string, number | null>>)[0] ?? {};
    const [icd] = await pool.query("SELECT COUNT(*) n FROM icd11_codes");
    const [zones] = await pool.query("SELECT COUNT(*) n FROM delivery_zones WHERE active=1");
    const [gp] = await pool.query("SELECT COUNT(*) n FROM gp_max_checkpoints");
    const [msgs] = await pool.query("SELECT COUNT(*) n FROM channel_messages WHERE organizationId=?", [input.organizationId]);
    const kpis = [
      { code: "HR_ATTENDANCE_RATE", nameAr: "معدل الحضور اليومي", nameEn: "Daily attendance rate", value: rate, target: 90, unit: "%", higherBetter: true },
      { code: "HR_LATE_RATE", nameAr: "معدل التأخير", nameEn: "Late rate", value: total > 0 ? Math.round((Number(a.late ?? 0) / total) * 1000) / 10 : 0, target: 10, unit: "%", higherBetter: false },
      { code: "HR_ABSENCES", nameAr: "غيابات اليوم", nameEn: "Absences today", value: Number(a.absent ?? 0), target: 3, unit: "day", higherBetter: false },
      { code: "CARE_OPEN_TICKETS", nameAr: "تذاكر خدمة العملاء المفتوحة", nameEn: "Open care tickets", value: Number(c.open ?? 0), target: 50, unit: "ticket", higherBetter: false },
      { code: "CARE_TOTAL_TICKETS", nameAr: "إجمالي التذاكر", nameEn: "Total tickets", value: Number(c.total ?? 0), target: 1000, unit: "ticket", higherBetter: true },
      { code: "ICD11_COVERAGE", nameAr: "رموز ICD-11", nameEn: "ICD-11 codes", value: Number((icd as Array<{ n: number }>)[0]?.n ?? 0), target: 30000, unit: "code", higherBetter: true },
      { code: "DELIVERY_ZONES", nameAr: "مناطق التوصيل", nameEn: "Active zones", value: Number((zones as Array<{ n: number }>)[0]?.n ?? 0), target: 8, unit: "zone", higherBetter: true },
      { code: "GP_MAX_POINTS", nameAr: "نقاط GP MAX", nameEn: "GP MAX checkpoints", value: Number((gp as Array<{ n: number }>)[0]?.n ?? 0), target: 144, unit: "point", higherBetter: true },
      { code: "COMMS_MESSAGES", nameAr: "رسائل القنوات (واتساب/هاتف)", nameEn: "Channel messages", value: Number((msgs as Array<{ n: number }>)[0]?.n ?? 0), target: 500, unit: "msg", higherBetter: true },
    ];
    const withStatus = kpis.map((k) => {
      const achieved = k.higherBetter ? k.value >= k.target : k.value <= k.target;
      const pct = k.target !== 0 ? Math.round((k.value / k.target) * 1000) / 10 : 0;
      return { ...k, achieved, achievedPct: pct, status: achieved ? "achieved" : "below_target" };
    });
    try {
      await pool.query("INSERT INTO kpi_entries (kpiDefinitionId, periodFrom, periodTo, snapshotJson, createdByUserId) SELECT id, CURDATE(), CURDATE(), ?, ? FROM kpi_definitions WHERE organizationId=? AND branchId=? AND code='HR_ATTENDANCE_RATE' ON DUPLICATE KEY UPDATE snapshotJson=VALUES(snapshotJson)", [JSON.stringify(withStatus), ctx.user.id, input.organizationId, input.branchId]);
    } catch (e) { console.error("[kpi-snapshot]", e); }
    return { scope: input, generatedAt: new Date().toISOString(), kpis: withStatus };
  }),
  entries: protectedProcedure.input(scopeInput).query(async ({ ctx, input }) => {
    assertSessionScope(ctx, input);
    const pool = getRawPool();
    const [rows] = await pool.query("SELECT e.*, d.code, d.nameAr FROM kpi_entries e JOIN kpi_definitions d ON d.id=e.kpiDefinitionId WHERE d.organizationId=? AND d.branchId=? ORDER BY e.periodFrom DESC, e.id DESC LIMIT 50", [input.organizationId, input.branchId]);
    return { entries: rows };
  }),
  definitions: protectedProcedure.input(scopeInput).query(async ({ ctx, input }) => {
    assertSessionScope(ctx, input);
    const pool = getRawPool();
    const [rows] = await pool.query("SELECT id, code, nameAr, nameEn, unit, target, direction, active FROM kpi_definitions WHERE organizationId=? AND branchId=? ORDER BY id", [input.organizationId, input.branchId]);
    return { definitions: rows };
  }),
});

/**
 * ai-review.ts — المراجعة الآلية الشاملة (AI Auto Review: تقرير تلقائي + تقييم + توصيات)
 * حزمة ترقية MEDORA 2026-08-28.
 *
 * النمط: protectedProcedure من "../_core/trpc"، getDb من "../db"، ctx.user مثل organizations.ts.
 * كل جولة: تفحص جدولًا واحدًا من كل وحدة حقيقية (COUNT آمن بلا مدخلات مستخدم)،
 *   تنتج درجات 0-100، تقرير Markdown بالعربية، نتائج بخطورة، وتوصيات p0..p3 قابلة للإغلاق.
 *
 * الدمج:
 *  1) استيراد drizzle/medora-upgrade-schema.ts في drizzle/schema.ts ثم generate && migrate
 *  2) تسجيل aiReviewRouter في server/routers.ts:  aiReview: aiReviewRouter,
 *  3) جدولة يومية عبر scheduled_jobs: runAutoReview {trigger:"scheduled"}
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";

/** getDb مع ضمان عدم القيمة الفارغة (قاعدة MEDORA مطلوبة) */
async function getDbOrThrow(): Promise<any> {
  const db = await getDbOrThrow();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
  return db;
}


/** فحوصات الوحدات على جداول مؤكدة من كود المستودع. أضف أي جدول جديد هنا. */
const MODULE_CHECKS: { module: string; kpi: string; table: string }[] = [
  { module: "drug-catalog", kpi: "catalog_items", table: "catalog_items" },
  { module: "crm", kpi: "customer_profiles", table: "customer_profiles" },
  { module: "hr", kpi: "employee_profiles", table: "employee_profiles" },
  { module: "hr", kpi: "employee_attendance", table: "employee_attendance" },
  { module: "hr", kpi: "employee_leave_requests", table: "employee_leave_requests" },
  { module: "erp", kpi: "sales", table: "sales" },
  { module: "erp", kpi: "purchase_orders", table: "purchase_orders" },
  { module: "pos", kpi: "products", table: "products" },
  { module: "pos", kpi: "inventory", table: "inventory" },
  { module: "org", kpi: "organization_memberships", table: "organization_memberships" },
  { module: "users", kpi: "users", table: "users" },
];

async function dbWithOrgScope(ctx: { user: { id: number; role: string } }, organizationId: number) {
  const db = await getDbOrThrow();
  if (ctx.user.role === "admin") return db;
  const rows = (await db.execute(
    sql`SELECT id FROM organization_memberships WHERE organizationId=${organizationId} AND userId=${ctx.user.id} AND active=1 LIMIT 1`
  )) as any;
  if (!rows?.[0]?.[0]) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك عضوية فعّالة في هذه المنظمة." });
  return db;
}

async function countRows(db: any, table: string): Promise<number> {
  const safe = table.replace(/[^a-z_]/g, "");
  const rows = (await db.execute(sql`SELECT COUNT(*) AS n FROM ${sql.raw(safe)}`)) as any;
  return Number(rows?.[0]?.[0]?.n ?? 0);
}

export const aiReviewRouter = router({
  /** تشغيل جولة مراجعة آلية كاملة */
  runAutoReview: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), trigger: z.enum(["manual", "scheduled"]).default("manual") }))
    .mutation(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);

      const runRes = (await db.execute(
        sql`INSERT INTO ai_review_runs (organization_id, \`trigger\`, status) VALUES (${input.organizationId}, ${input.trigger}, 'running')`
      )) as any;
      const runId = Number(runRes?.[0]?.insertId ?? 0);

      const lines: string[] = [`# تقرير المراجعة الآلية — MEDORA (${new Date().toISOString().slice(0, 10)})`, "", "| الوحدة | المؤشر | الحالة | الدرجة |", "|---|---|---|---|"];
      let overall = 0;
      let anyFinding = false;

      for (const c of MODULE_CHECKS) {
        let n = 0, err = "";
        try { n = await countRows(db, c.table); } catch (e) { err = String((e as Error).message).slice(0, 140); }
        const score = err ? 0 : Math.min(100, Math.round((n / 10) * 100));
        const status = err ? "🔴 تعذر الفحص" : n === 0 ? "🔴 فارغ" : n < 10 ? "🟡 مبكر" : "🟢 يعمل";
        const severity = err ? "medium" : n === 0 ? "high" : n < 10 ? "medium" : "low";
        const message = err ? `تعذر فحص ${c.table}` : `${c.kpi}: ${n} سجلًا`;
        await db.execute(
          sql`INSERT INTO ai_review_findings (run_id, module, kpi, severity, score, message_ar, evidence)
              VALUES (${runId}, ${c.module}, ${c.kpi}, ${severity}, ${score}, ${message}, ${err || `${c.table} count=${n}`})`
        );
        lines.push(`| ${c.module} | ${c.kpi} | ${status} | ${score}/100 |`);
        overall += score;
        anyFinding = true;
        if (!err && n === 0) {
          await db.execute(
            sql`INSERT INTO ai_review_recommendations (run_id, priority, title_ar, detail_ar, module, status)
                VALUES (${runId}, 'p1', ${`تشغيل ${c.kpi}`}, ${`الجدول ${c.table} فارغ — ابدأ الإدخال أو الاستيراد.`}, ${c.module}, 'open')`
          );
        }
      }

      overall = anyFinding ? Math.round(overall / MODULE_CHECKS.length) : 0;
      lines.push("", `**الدرجة الكلية: ${overall}/100**`, "**التوصيات محفوظة في ai_review_recommendations وتنتظر القرار (done/dismissed).**");
      const report = lines.join("\n");
      await db.execute(
        sql`UPDATE ai_review_runs SET status='completed', score_overall=${overall}, report_markdown=${report}, finished_at=CURRENT_TIMESTAMP WHERE id=${runId}`
      );
      return { runId, overall, report };
    }),

  /** آخر جولة مراجعة */
  latestReview: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      const rows = (await db.execute(
        sql`SELECT id, \`trigger\`, status, score_overall, report_markdown, started_at, finished_at FROM ai_review_runs
            WHERE organization_id=${input.organizationId} ORDER BY id DESC LIMIT 1`
      )) as any;
      const r = rows?.[0]?.[0];
      if (!r) return null;
      return { id: r.id, trigger: r.trigger, status: r.status, scoreOverall: r.score_overall, reportMarkdown: r.report_markdown, startedAt: r.started_at, finishedAt: r.finished_at };
    }),

  /** سجل الجولات */
  listReviews: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), limit: z.number().int().max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      const rows = (await db.execute(
        sql`SELECT id, \`trigger\`, status, score_overall, started_at, finished_at FROM ai_review_runs
            WHERE organization_id=${input.organizationId} ORDER BY id DESC LIMIT ${input.limit}`
      )) as any;
      return (rows?.[0] ?? []).map((r: any) => ({
        id: r.id, trigger: r.trigger, status: r.status, scoreOverall: r.score_overall, startedAt: r.started_at, finishedAt: r.finished_at,
      }));
    }),

  /** إغلاق توصية: done (نُفذت) أو dismissed (مرفوضة) */
  resolveRecommendation: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), id: z.number().int().positive(), status: z.enum(["done", "dismissed"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      const rows = (await db.execute(sql`SELECT organization_id FROM ai_review_runs WHERE id=(SELECT run_id FROM ai_review_recommendations WHERE id=${input.id})`)) as any;
      const runOrg = rows?.[0]?.[0]?.organization_id;
      if (!runOrg || runOrg !== input.organizationId) throw new TRPCError({ code: "NOT_FOUND" });
      await db.execute(sql`UPDATE ai_review_recommendations SET status=${input.status}, resolved_at=CURRENT_TIMESTAMP WHERE id=${input.id}`);
      return { ok: true };
    }),
});

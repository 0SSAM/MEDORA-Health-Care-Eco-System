/**
 * gp-max.ts — وحدة تدقيق النمو GP MAX (L0–L7): تقييم 0–100 لكل طبقة، حاسبة KPI،
 * توصيات، وخطة 30 يومًا. النمط: protectedProcedure + db.execute (مثل ai-review.ts).
 *
 * الدمج: استيراد gpMaxRouter وتسجيله في server/routers.ts تحت مفتاح gpMax.
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { computeGpMaxScore } from "../../shared/gp-max-kpi";

async function dbOrThrow(): Promise<any> {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
  return db;
}

async function dbWithOrgScope(ctx: { user: { id: number; role: string } }, organizationId: number) {
  const db = await dbOrThrow();
  if (ctx.user.role === "admin") return db;
  const rows = (await db.execute(
    sql`SELECT id FROM organization_memberships WHERE organizationId=${organizationId} AND userId=${ctx.user.id} AND active=1 LIMIT 1`
  )) as any;
  if (!rows?.[0]?.[0]) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك عضوية فعّالة في هذه المنظمة." });
  return db;
}

export const gpMaxRouter = router({
  /** قائمة الطبقات L0–L7 */
  listLayers: protectedProcedure.query(async () => {
    const db = await dbOrThrow();
    const rows = (await db.execute(sql`SELECT id, layerCode, layerNameAr, layerNameEn, description, sortOrder FROM gp_max_layers ORDER BY sortOrder`)) as any;
    return rows?.[0] ?? [];
  }),

  /** قائمة نقاط الفحص (اختياري: طبقة واحدة) */
  listCheckpoints: protectedProcedure
    .input(z.object({ layerCode: z.string().max(8).optional() }))
    .query(async ({ input }) => {
      const db = await dbOrThrow();
      const rows = input.layerCode
        ? (await db.execute(
            sql`SELECT c.id, c.code, c.titleAr, c.titleEn, c.category, c.weight, c.passingCriteria, l.layerCode
                FROM gp_max_checkpoints c JOIN gp_max_layers l ON l.id = c.layerId
                WHERE c.active = 1 AND l.layerCode = ${input.layerCode}
                ORDER BY l.sortOrder, c.id`
          )) as any
        : (await db.execute(
            sql`SELECT c.id, c.code, c.titleAr, c.titleEn, c.category, c.weight, c.passingCriteria, l.layerCode
                FROM gp_max_checkpoints c JOIN gp_max_layers l ON l.id = c.layerId
                WHERE c.active = 1 ORDER BY l.sortOrder, c.id`
          )) as any;
      return rows?.[0] ?? [];
    }),

  /** تشغيل تدقيق كامل: إدخال إجابات بنعم/لا → درجة لكل طبقة + إجمالية + توصيات */
  runAssessment: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), answers: z.record(z.string(), z.boolean()) }))
    .mutation(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      const rows = (await db.execute(
        sql`SELECT c.id, c.code, c.titleAr, c.weight, l.layerCode
            FROM gp_max_checkpoints c JOIN gp_max_layers l ON l.id = c.layerId WHERE c.active = 1`
      )) as any;
      const checkpoints = (rows?.[0] ?? []) as { id: number; code: string; titleAr: string; weight: number; layerCode: string }[];
      const score = computeGpMaxScore(checkpoints, input.answers);

      const ins = (await db.execute(
        sql`INSERT INTO gp_max_assessments (organizationId, status, score, summary, createdAt, completedAt)
            VALUES (${input.organizationId}, 'completed', ${score.overall}, ${JSON.stringify(score.perLayer)}, NOW(), NOW())`
      )) as any;
      const assessmentId = Number(ins?.[0]?.insertId ?? 0);

      let recCount = 0;
      const lines: string[] = ["# تقرير تدقيق النمو GP MAX (L0–L7)", "", "| الطبقة | المحقق | الإجمالي | الدرجة |", "|---|---|---|---|"];
      for (const c of checkpoints) {
        const met = Boolean(input.answers[c.code]);
        if (!met) {
          const priority = c.weight >= 2 ? "P1" : "P2";
          await db.execute(
            sql`INSERT INTO gp_max_recommendations (assessmentId, checkpointId, priority, recommendationAr, recommendationEn, resolved)
                VALUES (${assessmentId}, ${c.id}, ${priority}, ${`تنفيذ: ${c.titleAr}`}, ${`Implement: ${c.code}`}, 0)`
          );
          recCount++;
        }
      }
      for (const [layer, v] of Object.entries(score.perLayer)) {
        lines.push(`| ${layer} | ${v.met} | ${v.total} | ${v.score}/100 |`);
      }
      lines.push("", `**الدرجة الكلية: ${score.overall}/100**`, `**${recCount} توصية مفتوحة.**`);
      return { assessmentId, overall: score.overall, perLayer: score.perLayer, recommendationsCount: recCount, reportMarkdown: lines.join("\n") };
    }),

  /** سجل التقييمات */
  listAssessments: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), limit: z.number().int().max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      const rows = (await db.execute(
        sql`SELECT id, status, score, summary, createdAt, completedAt FROM gp_max_assessments
            WHERE organizationId=${input.organizationId} ORDER BY id DESC LIMIT ${input.limit}`
      )) as any;
      return (rows?.[0] ?? []).map((r: any) => ({ id: r.id, status: r.status, score: r.score, summary: r.summary, createdAt: r.createdAt, completedAt: r.completedAt }));
    }),

  /** أحدث تقييم مع توصياته */
  latestAssessment: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      const rows = (await db.execute(
        sql`SELECT id, status, score, summary, createdAt, completedAt FROM gp_max_assessments
            WHERE organizationId=${input.organizationId} ORDER BY id DESC LIMIT 1`
      )) as any;
      const a = rows?.[0]?.[0];
      if (!a) return null;
      const recs = (await db.execute(
        sql`SELECT id, assessmentId, checkpointId, priority, recommendationAr, recommendationEn, resolved
            FROM gp_max_recommendations WHERE assessmentId=${a.id} ORDER BY priority ASC`
      )) as any;
      return { id: a.id, status: a.status, score: a.score, summary: a.summary, createdAt: a.createdAt, completedAt: a.completedAt, recommendations: recs?.[0] ?? [] };
    }),

  /** مولد خطة 30 يومًا من التوصيات المفتوحة (غير محفوظ — يُعاد للتقييم) */
  generate30DayPlan: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), weeks: z.number().int().min(2).max(6).default(4) }))
    .mutation(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      const rows = (await db.execute(
        sql`SELECT a.id FROM gp_max_assessments a WHERE a.organizationId=${input.organizationId} ORDER BY a.id DESC LIMIT 1`
      )) as any;
      const a = rows?.[0]?.[0];
      if (!a) return { plan: [], note: "لا يوجد تقييم سابق — شغّل تدقيقًا أولًا." };
      const recs = (await db.execute(
        sql`SELECT id, checkpointId, priority, recommendationAr FROM gp_max_recommendations
            WHERE assessmentId=${a.id} AND resolved=0 ORDER BY priority ASC`
      )) as any;
      const order: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
      const items = (recs?.[0] ?? []).sort((x: any, y: any) => (order[x.priority] ?? 9) - (order[y.priority] ?? 9));
      const buckets: Record<number, typeof items> = {};
      items.forEach((it: any, i: number) => {
        const w = Math.min(input.weeks - 1, Math.floor((i / Math.max(1, items.length)) * input.weeks));
        (buckets[w] ??= []).push(it);
      });
      const plan = Array.from({ length: input.weeks }, (_, i) => ({
        week: i + 1,
        title: `الأسبوع ${i + 1}: ${i === 0 ? "التوصيات الحرجة P0/P1" : i === input.weeks - 1 ? "التوصيات التحسينية" : "التوصيات المتوسطة"}`,
        items: (buckets[i] ?? []).map((r: any) => ({ id: r.id, priority: r.priority, recommendationAr: r.recommendationAr })),
      }));
      return { plan, note: "الخطة مولّدة من التوصيات المفتوحة — لم تُحفظ في قاعدة البيانات بعد." };
    }),

  /** إغلاق توصية */
  resolveRecommendation: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await dbOrThrow();
      await db.execute(sql`UPDATE gp_max_recommendations SET resolved=1 WHERE id=${input.id}`);
      return { success: true };
    }),
});

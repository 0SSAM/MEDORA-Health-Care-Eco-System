/**
 * icd11.ts — موجّه رموز ICD-11 (التصنيف الدولي للأمراض، الإصدار 11).
 * مرجعي فقط (مثل nlm-icd10): لا ينهي تشخيصًا ولا مطالبة ولا فواتير.
 * الجداول: icd11_codes (تُزرع عبر scripts/seed-icd11.mjs).
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";

async function dbOrThrow(): Promise<any> {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
  return db;
}

function assertClinicalRefRole(role: string) {
  if (!["admin", "owner", "manager", "pharmacist"].includes(role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك صلاحية البحث السريري المرجعي." });
  }
}

export const icd11Router = router({
  /** إحصاءات قاعدة ICD-11 (العدد، الإصدار، اكتمال الخطية) */
  stats: protectedProcedure.query(async ({ ctx }) => {
    assertClinicalRefRole(ctx.user.role);
    const db = await dbOrThrow();
    const rows = (await db.execute(
      sql`SELECT COUNT(*) AS total, MAX(version) AS version, MAX(release_date) AS releaseDate, MIN(is_starter) AS starterMin FROM icd11_codes`
    )) as any;
    const r = rows?.[0]?.[0];
    if (!r) return { total: 0, version: null, releaseDate: null, isStarter: true, available: false };
    return { total: Number(r.total), version: r.version, releaseDate: r.releaseDate, isStarter: Number(r.starterMin) === 1, available: Number(r.total) > 0 };
  }),

  /** بحث نصي/رقمي في رموز وعناوين ICD-11 */
  search: protectedProcedure
    .input(z.object({ q: z.string().min(1).max(80), limit: z.number().int().min(1).max(100).default(25) }))
    .query(async ({ ctx, input }) => {
      assertClinicalRefRole(ctx.user.role);
      const db = await dbOrThrow();
      const like = `%${input.q}%`;
      const rows = (await db.execute(
        sql`SELECT code, title_en, title_ar, chapter, version, is_starter FROM icd11_codes
            WHERE code LIKE ${like} OR title_en LIKE ${like} OR title_ar LIKE ${like}
            ORDER BY (code LIKE ${`${input.q}%`}) DESC, code ASC LIMIT ${input.limit}`
      )) as any;
      return (rows?.[0] ?? []).map((r: any) => ({
        code: r.code, titleEn: r.title_en, titleAr: r.title_ar, chapter: r.chapter, version: r.version, isStarter: r.is_starter,
      }));
    }),

  /** جلب رمز واحد */
  getByCode: protectedProcedure
    .input(z.object({ code: z.string().min(1).max(16).toUpperCase() }))
    .query(async ({ ctx, input }) => {
      assertClinicalRefRole(ctx.user.role);
      const db = await dbOrThrow();
      const rows = (await db.execute(
        sql`SELECT code, title_en, title_ar, chapter, parent_code, version, release_date, source, is_starter FROM icd11_codes WHERE code=${input.code} LIMIT 1`
      )) as any;
      const r = rows?.[0]?.[0];
      return r
        ? { code: r.code, titleEn: r.title_en, titleAr: r.title_ar, chapter: r.chapter, parentCode: r.parent_code, version: r.version, releaseDate: r.release_date, source: r.source, isStarter: r.is_starter }
        : null;
    }),

  /** أقسام (فصول) متاحة */
  listChapters: protectedProcedure.query(async ({ ctx }) => {
    assertClinicalRefRole(ctx.user.role);
    const db = await dbOrThrow();
    const rows = (await db.execute(
      sql`SELECT chapter, COUNT(*) AS cnt FROM icd11_codes GROUP BY chapter ORDER BY chapter`
    )) as any;
    return (rows?.[0] ?? []).map((r: any) => ({ chapter: r.chapter, count: Number(r.cnt) }));
  }),
});

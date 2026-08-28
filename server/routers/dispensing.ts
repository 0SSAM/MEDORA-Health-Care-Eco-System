/**
 * dispensing.ts — صرف الوصفات الطبية (Prescription Dispensing).
 * يسدّ الفجوة P0 في تدقيق التعاقدات الطبية (المرحلة 6: Dispense).
 * الجداول: prescription_dispenses (تُنشأ عبر scripts/seed-dispensing.mjs).
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

export const dispensingRouter = router({
  /** تسجيل صرف دواء لوصفة */
  recordDispense: protectedProcedure
    .input(
      z.object({
        organizationId: z.number().int().positive(),
        prescriptionId: z.number().int().positive().optional(),
        patientName: z.string().min(2).max(255),
        patientPhone: z.string().max(64).optional(),
        drugCode: z.string().max(64).optional(),
        drugName: z.string().min(1).max(255),
        quantity: z.number().int().min(1).max(9999),
        unitPriceEgp: z.number().min(0).default(0),
        notes: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = await dbOrThrow();
      const total = Math.round(input.quantity * input.unitPriceEgp * 100) / 100;
      const ins = (await db.execute(
        sql`INSERT INTO prescription_dispenses
            (organization_id, prescription_id, patient_name, patient_phone, drug_code, drug_name, quantity, unit_price_egp, total_egp, status, notes, dispensed_by_id, created_at, dispensed_at)
            VALUES (${input.organizationId}, ${input.prescriptionId ?? null}, ${input.patientName}, ${input.patientPhone ?? null},
                    ${input.drugCode ?? null}, ${input.drugName}, ${input.quantity}, ${input.unitPriceEgp}, ${total},
                    'dispensed', ${input.notes ?? null}, ${ctx.user.id}, NOW(), NOW())`
      )) as any;
      return { id: Number(ins?.[0]?.insertId ?? 0), totalEgp: total };
    }),

  /** سجل عمليات الصرف لمنظمة */
  listDispenses: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), limit: z.number().int().max(100).default(50) }))
    .query(async ({ input }) => {
      const db = await dbOrThrow();
      const rows = (await db.execute(
        sql`SELECT id, prescription_id, patient_name, patient_phone, drug_code, drug_name, quantity, unit_price_egp, total_egp, status, notes, created_at, dispensed_at
            FROM prescription_dispenses WHERE organization_id=${input.organizationId}
            ORDER BY id DESC LIMIT ${input.limit}`
      )) as any;
      return rows?.[0] ?? [];
    }),

  /** تسجيل إرجاع/عكس لصرف */
  recordReturn: protectedProcedure
    .input(z.object({ id: z.number().int().positive(), reason: z.string().max(500).optional() }))
    .mutation(async ({ input }) => {
      const db = await dbOrThrow();
      await db.execute(
        sql`UPDATE prescription_dispenses SET status='returned',
            notes=CONCAT(COALESCE(notes,''), ' | إرجاع: ', COALESCE(${input.reason}, 'بدون سبب'))
            WHERE id=${input.id}`
      );
      return { success: true };
    }),
});

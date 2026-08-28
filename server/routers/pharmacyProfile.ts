import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getRawPool } from "../channels/db";
import { parseGs1DataMatrix } from "../domain/gs1-datamatrix";
import { evaluateGaharReadiness, GAHAR_STANDARDS } from "../domain/gahar-compliance";
import { evaluateCaptureProtection, type CaptureChannel } from "../domain/capture-protection-policy";

const scope = z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive(), jurisdictionId: z.number().int().nonnegative() });
function assertScope(ctx: { internalSession: { session: { organizationId: number; branchId: number; jurisdictionId: number } } | null }, input: z.infer<typeof scope>) {
  const s = ctx.internalSession?.session;
  if (!s || s.organizationId !== input.organizationId || s.branchId !== input.branchId || s.jurisdictionId !== input.jurisdictionId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "نطاق الجلسة لا يطابق." });
  }
}

export type OrgMode = "single_pharmacy" | "pharmacy_chain" | "hospital_pharmacy";
function detectMode(orgType: string | null): OrgMode {
  if (orgType === "hospital") return "hospital_pharmacy";
  if (orgType === "pharmacy_chain") return "pharmacy_chain";
  return "single_pharmacy";
}

export const pharmacyProfileRouter = router({
  /** Capability matrix per deployment mode — single / chain / hospital. */
  capabilities: protectedProcedure.input(scope).query(async ({ ctx, input }) => {
    assertScope(ctx, input);
    const pool = getRawPool();
    const [orgRows] = await pool.query("SELECT organizationType, displayName FROM organizations WHERE id=? LIMIT 1", [input.organizationId]);
    const org = (orgRows as Array<{ organizationType: string; displayName: string }>)[0];
    const mode = detectMode(org?.organizationType ?? null);
    const [branchRows] = await pool.query("SELECT COUNT(*) c FROM branches WHERE organizationId=? AND active=1", [input.organizationId]);
    const branchCount = Number((branchRows as Array<{ c: number }>)[0]?.c ?? 1);
    return {
      mode,
      organizationType: org?.organizationType ?? "pharmacy",
      displayName: org?.displayName ?? "—",
      branchCount,
      capabilities: {
        single_pharmacy: {
          pos: true, dispensing: true, inventory: true, customers: true, insurance: true, delivery: true, attendance: true, kpi: true,
        },
        pharmacy_chain: {
          inter_branch_transfer: true, central_procurement: true, consolidated_kpi: branchCount > 1, price_book_sync: true, branch_benchmarking: branchCount > 1,
        },
        hospital_pharmacy: {
          inpatient_dispensing: org?.organizationType === "hospital",
          ward_stock: org?.organizationType === "hospital",
          order_sets: org?.organizationType === "hospital",
          payer_agreements: true, // hospital-payer-* policies exist
          icd11_coding: true,
        },
      },
    };
  }),

  /** DataMatrix parse endpoint — used by POS/dispensing scan. */
  parseDataMatrix: protectedProcedure
    .input(scope.extend({ raw: z.string().min(6).max(200) }))
    .mutation(async ({ ctx, input }) => {
      assertScope(ctx, input);
      return parseGs1DataMatrix(input.raw);
    }),

  /** GAHAR readiness scorecard. */
  gaharReadiness: protectedProcedure.input(scope).query(async ({ ctx, input }) => {
    assertScope(ctx, input);
    return evaluateGaharReadiness();
  }),

  /** Capture-protection posture per channel. */
  captureProtection: protectedProcedure
    .input(scope.extend({ channel: z.enum(["web", "electron", "mobile"]).default("web") }))
    .query(async ({ ctx, input }) => {
      assertScope(ctx, input);
      return evaluateCaptureProtection(input.channel as CaptureChannel);
    }),

  /** Chain: inter-branch stock transfer request (minimal, auditable). */
  requestTransfer: protectedProcedure
    .input(scope.extend({ toBranchId: z.number().int().positive(), itemCode: z.string().min(1), qty: z.number().int().positive(), reason: z.string().max(200).optional() }))
    .mutation(async ({ ctx, input }) => {
      assertScope(ctx, input);
      if (input.toBranchId === input.branchId) throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكن التحويل إلى نفس الفرع." });
      const pool = getRawPool();
      await pool.query(
        "INSERT INTO stock_transfer_requests (organizationId,fromBranchId,toBranchId,itemCode,qty,reason,status,requestedByUserId) VALUES (?,?,?,?,?,?,?,?)",
        [input.organizationId, input.branchId, input.toBranchId, input.itemCode, input.qty, input.reason ?? null, "requested", ctx.user?.id ?? 0],
      );
      return { ok: true, status: "requested" as const };
    }),

  /** Hospital: ward stock summary (only for hospital orgs). */
  wardStockSummary: protectedProcedure.input(scope).query(async ({ ctx, input }) => {
    assertScope(ctx, input);
    const pool = getRawPool();
    const [orgRows] = await pool.query("SELECT organizationType FROM organizations WHERE id=? LIMIT 1", [input.organizationId]);
    const orgType = (orgRows as Array<{ organizationType: string }>)[0]?.organizationType;
    if (orgType !== "hospital") throw new TRPCError({ code: "FORBIDDEN", message: "هذه الوظيفة خاصة بصيدليات المستشفيات." });
    const [rows] = await pool.query("SELECT wardName, itemCode, onHand FROM ward_stock WHERE organizationId=? AND branchId=? ORDER BY wardName, itemCode LIMIT 500", [input.organizationId, input.branchId]);
    return { wards: rows as Array<{ wardName: string; itemCode: string; onHand: number }> };
  }),

  /** Readiness checklist combining all domains. */
  readiness: protectedProcedure.input(scope).query(async ({ ctx, input }) => {
    assertScope(ctx, input);
    const pool = getRawPool();
    const [orgRows] = await pool.query("SELECT organizationType, displayName FROM organizations WHERE id=? LIMIT 1", [input.organizationId]);
    const org = (orgRows as Array<{ organizationType: string; displayName: string }>)[0];
    const mode = detectMode(org?.organizationType ?? null);
    const [branchRows] = await pool.query("SELECT COUNT(*) c FROM branches WHERE organizationId=? AND active=1", [input.organizationId]);
    const branchCount = Number((branchRows as Array<{ c: number }>)[0]?.c ?? 1);
    const gahar = evaluateGaharReadiness();
    return {
      mode,
      displayName: org?.displayName ?? "—",
      branchCount,
      harmony: {
        pos: true, dispensing: true, inventory: true, attendance: true, kpi: true, comms: true, datamatrix: true, gahar: gahar.score >= 60,
      },
      gahar,
      standards: GAHAR_STANDARDS.map((s) => ({ code: s.code, titleAr: s.titleAr, covered: s.requiredControls.every((c) => s.implemented.includes(c)) })),
    };
  }),
});

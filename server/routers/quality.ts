import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getRawPool } from "../channels/db";
import { decideQualityDisposition, releaseQualityHold, startQualityReview } from "../domain/quality-policy";

type QualityContext = {
  user: { id: number; role: "user" | "admin" | "manager" | "pharmacist" | "cashier" };
  internalSession: { session: { organizationId: number; branchId: number; jurisdictionId: number } } | null;
};

type QualityInspectionRow = {
  id: number;
  warehouseId: number;
  itemCode: string;
  batchNo: string | null;
  sampleSize: number;
  acceptedUnits: number;
  rejectedUnits: number;
  status: "draft" | "in_review" | "accepted" | "held" | "rejected" | "rework" | "released";
  disposition: "release" | "hold" | "reject" | "rework" | null;
  inspectorUserId: number;
  approvedByUserId: number | null;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
};

const scope = z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive(), jurisdictionId: z.number().int().nonnegative() });
function assertScope(ctx: QualityContext, input: z.infer<typeof scope>) {
  const s = ctx.internalSession?.session;
  if (!s || s.organizationId !== input.organizationId || s.branchId !== input.branchId || s.jurisdictionId !== input.jurisdictionId) throw new TRPCError({ code: "FORBIDDEN", message: "نطاق الجلسة لا يطابق." });
}
function assertQualityRole(role: QualityContext["user"]["role"]): asserts role is "admin" | "manager" | "pharmacist" {
  if (role !== "admin" && role !== "manager" && role !== "pharmacist") throw new TRPCError({ code: "FORBIDDEN", message: "صلاحية الجودة غير متاحة لهذا الدور." });
}
function policyError(error: unknown): never {
  const code = error instanceof Error ? error.message : "QUALITY_POLICY_REJECTED";
  const map: Record<string, "BAD_REQUEST" | "FORBIDDEN" | "PRECONDITION_FAILED"> = {
    QUALITY_ACTOR_SCOPE_REJECTED: "FORBIDDEN",
    QUALITY_DECISION_PERMISSION_REQUIRED: "FORBIDDEN",
    QUALITY_MAKER_CHECKER_REQUIRED: "FORBIDDEN",
    QUALITY_SCOPE_REJECTED: "FORBIDDEN",
    QUALITY_RELEASE_BLOCKED_BY_REJECTS: "PRECONDITION_FAILED",
    QUALITY_HOLD_NOT_RELEASABLE: "PRECONDITION_FAILED",
    QUALITY_REVIEW_NOT_DECIDABLE: "PRECONDITION_FAILED",
    QUALITY_SAMPLE_INCOMPLETE: "PRECONDITION_FAILED",
  };
  throw new TRPCError({ code: map[code] ?? "BAD_REQUEST", message: code });
}

export const qualityRouter = router({
  list: protectedProcedure.input(scope).query(async ({ ctx, input }) => {
    assertScope(ctx as QualityContext, input);
    const pool = getRawPool();
    const [rows] = await pool.query(`SELECT id, warehouseId, itemCode, batchNo, sampleSize, acceptedUnits, rejectedUnits, status, disposition, inspectorUserId, approvedByUserId, reason, createdAt, updatedAt FROM quality_inspections WHERE organizationId=? AND branchId=? AND jurisdictionId=? ORDER BY id DESC LIMIT 200`, [input.organizationId, input.branchId, input.jurisdictionId]);
    return { inspections: Array.isArray(rows) ? rows as QualityInspectionRow[] : [] };
  }),
  createInspection: protectedProcedure.input(scope.extend({ warehouseId: z.number().int().positive(), itemCode: z.string().trim().min(1).max(64), batchNo: z.string().trim().max(40).nullable().optional(), sampleSize: z.number().int().positive(), reason: z.string().trim().max(500).optional() })).mutation(async ({ ctx, input }) => {
    assertScope(ctx as QualityContext, input);
    const pool = getRawPool();
    const [warehouseRows] = await pool.query("SELECT id FROM warehouses WHERE id=? AND organizationId=? AND branchId=? AND active=1 LIMIT 1", [input.warehouseId, input.organizationId, input.branchId]);
    if (!Array.isArray(warehouseRows) || !warehouseRows.length) throw new TRPCError({ code: "FORBIDDEN", message: "المخزن خارج نطاق الفرع أو غير نشط." });
    const [result] = await pool.query(`INSERT INTO quality_inspections (organizationId,branchId,jurisdictionId,warehouseId,itemCode,batchNo,sampleSize,inspectorUserId,reason) VALUES (?,?,?,?,?,?,?,?,?)`, [input.organizationId, input.branchId, input.jurisdictionId, input.warehouseId, input.itemCode, input.batchNo ?? null, input.sampleSize, ctx.user.id, input.reason ?? null]);
    return { inspectionId: Number((result as { insertId: number }).insertId), status: "draft" as const };
  }),
  startReview: protectedProcedure.input(scope.extend({ inspectionId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    assertScope(ctx as QualityContext, input);
    const pool = getRawPool();
    const [rows] = await pool.query("SELECT * FROM quality_inspections WHERE id=? AND organizationId=? AND branchId=? AND jurisdictionId=? LIMIT 1", [input.inspectionId, input.organizationId, input.branchId, input.jurisdictionId]);
    const inspection = Array.isArray(rows) ? (rows as any[])[0] : undefined;
    if (!inspection) throw new TRPCError({ code: "NOT_FOUND", message: "فحص الجودة غير موجود." });
    try {
      const next = startQualityReview({ ...inspection, scope: input }, ctx.user.id);
      await pool.query("UPDATE quality_inspections SET status='in_review' WHERE id=? AND organizationId=? AND branchId=? AND jurisdictionId=?", [input.inspectionId, input.organizationId, input.branchId, input.jurisdictionId]);
      await pool.query("INSERT INTO quality_events (inspectionId,organizationId,branchId,jurisdictionId,eventType,actorUserId,payloadJson) VALUES (?,?,?,?,?,?,?)", [input.inspectionId, input.organizationId, input.branchId, input.jurisdictionId, "review_started", ctx.user.id, JSON.stringify({ status: next.status })]);
      return { status: next.status };
    } catch (error) { return policyError(error); }
  }),
  recordResult: protectedProcedure.input(scope.extend({ inspectionId: z.number().int().positive(), acceptedUnits: z.number().int().min(0), rejectedUnits: z.number().int().min(0) })).mutation(async ({ ctx, input }) => {
    assertScope(ctx as QualityContext, input);
    const pool = getRawPool();
    const [rows] = await pool.query("SELECT * FROM quality_inspections WHERE id=? AND organizationId=? AND branchId=? AND jurisdictionId=? LIMIT 1", [input.inspectionId, input.organizationId, input.branchId, input.jurisdictionId]);
    const inspection = Array.isArray(rows) ? (rows as any[])[0] : undefined;
    if (!inspection) throw new TRPCError({ code: "NOT_FOUND", message: "فحص الجودة غير موجود." });
    if (inspection.inspectorUserId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "المفتش الأصلي فقط يمكنه تسجيل النتيجة." });
    if (inspection.status !== "in_review") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "الفحص ليس في حالة المراجعة." });
    if (input.acceptedUnits + input.rejectedUnits > inspection.sampleSize) throw new TRPCError({ code: "BAD_REQUEST", message: "مجموع الوحدات يتجاوز حجم العينة." });
    await pool.query("UPDATE quality_inspections SET acceptedUnits=?, rejectedUnits=? WHERE id=? AND organizationId=? AND branchId=? AND jurisdictionId=? AND status='in_review'", [input.acceptedUnits, input.rejectedUnits, input.inspectionId, input.organizationId, input.branchId, input.jurisdictionId]);
    await pool.query("INSERT INTO quality_events (inspectionId,organizationId,branchId,jurisdictionId,eventType,actorUserId,payloadJson) VALUES (?,?,?,?,?,?,?)", [input.inspectionId, input.organizationId, input.branchId, input.jurisdictionId, "result_recorded", ctx.user.id, JSON.stringify({ acceptedUnits: input.acceptedUnits, rejectedUnits: input.rejectedUnits })]);
    return { recorded: true };
  }),
  decide: protectedProcedure.input(scope.extend({ inspectionId: z.number().int().positive(), disposition: z.enum(["release", "hold", "reject", "rework"]) })).mutation(async ({ ctx, input }) => {
    assertScope(ctx as QualityContext, input);
    assertQualityRole(ctx.user.role);
    const pool = getRawPool(); const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.query("SELECT * FROM quality_inspections WHERE id=? AND organizationId=? AND branchId=? AND jurisdictionId=? FOR UPDATE", [input.inspectionId, input.organizationId, input.branchId, input.jurisdictionId]);
      const inspection = Array.isArray(rows) ? (rows as any[])[0] : undefined;
      if (!inspection) throw new TRPCError({ code: "NOT_FOUND", message: "فحص الجودة غير موجود." });
      const next = decideQualityDisposition({ ...inspection, scope: input }, ctx.user.id, input.disposition, ctx.user.role);
      await connection.query("UPDATE quality_inspections SET status=?, disposition=?, approvedByUserId=? WHERE id=?", [next.status, next.disposition, ctx.user.id, input.inspectionId]);
      if (input.disposition === "hold") {
        const quantity = Number(inspection.acceptedUnits) + Number(inspection.rejectedUnits);
        if (quantity <= 0) throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكن إنشاء حجز جودة بكمية صفر." });
        await connection.query("INSERT INTO quality_holds (inspectionId,organizationId,branchId,jurisdictionId,warehouseId,itemCode,batchNo,quantity,createdByUserId) VALUES (?,?,?,?,?,?,?,?,?)", [input.inspectionId, input.organizationId, input.branchId, input.jurisdictionId, inspection.warehouseId, inspection.itemCode, inspection.batchNo, quantity, ctx.user.id]);
      }
      await connection.query("INSERT INTO quality_events (inspectionId,organizationId,branchId,jurisdictionId,eventType,actorUserId,payloadJson) VALUES (?,?,?,?,?,?,?)", [input.inspectionId, input.organizationId, input.branchId, input.jurisdictionId, `disposition_${input.disposition}`, ctx.user.id, JSON.stringify({ status: next.status })]);
      await connection.commit();
      return { status: next.status, disposition: next.disposition };
    } catch (error) { await connection.rollback(); if (error instanceof TRPCError) throw error; return policyError(error); } finally { connection.release(); }
  }),
  releaseHold: protectedProcedure.input(scope.extend({ inspectionId: z.number().int().positive(), reason: z.string().trim().min(1).max(500) })).mutation(async ({ ctx, input }) => {
    assertScope(ctx as QualityContext, input);
    assertQualityRole(ctx.user.role);
    const pool = getRawPool(); const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.query("SELECT * FROM quality_inspections WHERE id=? AND organizationId=? AND branchId=? AND jurisdictionId=? FOR UPDATE", [input.inspectionId, input.organizationId, input.branchId, input.jurisdictionId]);
      const inspection = Array.isArray(rows) ? (rows as any[])[0] : undefined;
      if (!inspection) throw new TRPCError({ code: "NOT_FOUND", message: "فحص الجودة غير موجود." });
      const next = releaseQualityHold({ ...inspection, scope: input }, ctx.user.id, input);
      const [holds] = await connection.query("SELECT id FROM quality_holds WHERE inspectionId=? AND status='active' FOR UPDATE", [input.inspectionId]);
      const hold = Array.isArray(holds) ? (holds as any[])[0] : undefined;
      if (!hold) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "لا يوجد حجز جودة نشط." });
      await connection.query("UPDATE quality_inspections SET status='released', disposition='release', approvedByUserId=? WHERE id=?", [ctx.user.id, input.inspectionId]);
      await connection.query("UPDATE quality_holds SET status='released', releasedByUserId=?, releaseReason=?, releasedAt=CURRENT_TIMESTAMP WHERE id=?", [ctx.user.id, input.reason, hold.id]);
      await connection.query("INSERT INTO quality_events (inspectionId,holdId,organizationId,branchId,jurisdictionId,eventType,actorUserId,payloadJson) VALUES (?,?,?,?,?,?,?,?)", [input.inspectionId, hold.id, input.organizationId, input.branchId, input.jurisdictionId, "hold_released", ctx.user.id, JSON.stringify({ reason: input.reason, status: next.status })]);
      await connection.commit();
      return { released: true };
    } catch (error) { await connection.rollback(); if (error instanceof TRPCError) throw error; return policyError(error); } finally { connection.release(); }
  }),
});

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getRawPool } from "../channels/db";

const scope = z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive(), jurisdictionId: z.number().int().nonnegative() });
function assertScope(ctx: { internalSession: { session: { organizationId: number; branchId: number; jurisdictionId: number } } | null }, input: z.infer<typeof scope>) {
  const s = ctx.internalSession?.session;
  if (!s || s.organizationId !== input.organizationId || s.branchId !== input.branchId || s.jurisdictionId !== input.jurisdictionId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "نطاق الجلسة لا يطابق." });
  }
}

export const supplyChainRouter = router({
  warehouses: protectedProcedure.input(scope).query(async ({ ctx, input }) => {
    assertScope(ctx, input);
    const pool = getRawPool();
    const [rows] = await pool.query("SELECT id, name, type, active FROM warehouses WHERE organizationId=? AND active=1 ORDER BY id", [input.organizationId]);
    return { warehouses: rows as Array<{ id: number; name: string; type: string }> };
  }),

  stockLevels: protectedProcedure.input(scope).query(async ({ ctx, input }) => {
    assertScope(ctx, input);
    const pool = getRawPool();
    const [rows] = await pool.query(
      `SELECT w.name warehouse, m.itemCode,
        SUM(CASE WHEN m.direction IN ('in','transfer_in') THEN m.qty ELSE 0 END)
        - SUM(CASE WHEN m.direction IN ('out','transfer_out') THEN m.qty ELSE 0 END) onHand
       FROM stock_movements m JOIN warehouses w ON w.id=m.warehouseId
       WHERE m.organizationId=? GROUP BY w.name, m.itemCode ORDER BY w.name, m.itemCode LIMIT 500`, [input.organizationId]);
    return { levels: rows as Array<{ warehouse: string; itemCode: string; onHand: string | number }> };
  }),

  moveStock: protectedProcedure.input(scope.extend({
    warehouseId: z.number().int().positive(),
    itemCode: z.string().min(1).max(64),
    qty: z.number().int().positive(),
    direction: z.enum(["in", "out", "transfer_in", "transfer_out", "adjust"]),
    batchNo: z.string().max(40).optional(),
    expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    reason: z.string().max(120).optional(),
  })).mutation(async ({ ctx, input }) => {
    assertScope(ctx, input);
    const pool = getRawPool();
    const [ins] = await pool.query(
      "INSERT INTO stock_movements (organizationId,branchId,warehouseId,itemCode,batchNo,expiryDate,qty,direction,reason,movedByUserId) VALUES (?,?,?,?,?,?,?,?,?,?)",
      [input.organizationId, input.branchId, input.warehouseId, input.itemCode, input.batchNo ?? null, input.expiryDate ?? null, input.qty, input.direction, input.reason ?? null, ctx.user?.id ?? 0]);
    return { movementId: Number((ins as { insertId: number }).insertId), recorded: true };
  }),

  /** FEFO: soonest-expiry batches first — the pharmacy-correct pick order. */
  expiringSoon: protectedProcedure.input(scope.extend({ days: z.number().int().min(1).max(365).default(90) })).query(async ({ ctx, input }) => {
    assertScope(ctx, input);
    const pool = getRawPool();
    const [rows] = await pool.query(
      `SELECT itemCode, batchNo, expiryDate, SUM(CASE WHEN direction IN ('in','transfer_in') THEN qty ELSE -qty END) remaining
       FROM stock_movements WHERE organizationId=? AND expiryDate IS NOT NULL AND expiryDate <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
       GROUP BY itemCode, batchNo, expiryDate HAVING remaining > 0 ORDER BY expiryDate ASC LIMIT 200`, [input.organizationId, input.days]);
    return { batches: rows as Array<{ itemCode: string; batchNo: string; expiryDate: string; remaining: number }> };
  }),
});

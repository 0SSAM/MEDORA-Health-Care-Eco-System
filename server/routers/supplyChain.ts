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
    const [rows] = await pool.query("SELECT id, name, type, active FROM warehouses WHERE organizationId=? AND branchId=? AND active=1 ORDER BY id", [input.organizationId, input.branchId]);
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
       WHERE m.organizationId=? AND m.branchId=? AND w.organizationId=? AND w.branchId=?
       GROUP BY w.name, m.itemCode ORDER BY w.name, m.itemCode LIMIT 500`, [input.organizationId, input.branchId, input.organizationId, input.branchId]);
    return { levels: rows as Array<{ warehouse: string; itemCode: string; onHand: string | number }> };
  }),

  moveStock: protectedProcedure.input(scope.extend({
    warehouseId: z.number().int().positive(),
    itemCode: z.string().trim().min(1).max(64),
    qty: z.number().int().positive(),
    direction: z.enum(["in", "out", "transfer_in", "transfer_out", "adjust"]),
    batchNo: z.string().trim().max(40).optional(),
    expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    reason: z.string().trim().max(120).optional(),
  })).mutation(async ({ ctx, input }) => {
    assertScope(ctx, input);
    const pool = getRawPool();
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [warehouseRows] = await connection.query(
        "SELECT id FROM warehouses WHERE id=? AND organizationId=? AND branchId=? AND active=1 LIMIT 1",
        [input.warehouseId, input.organizationId, input.branchId],
      );
      if (!(warehouseRows as Array<{ id: number }>).length) {
        throw new TRPCError({ code: "FORBIDDEN", message: "المخزن خارج نطاق الفرع أو غير نشط." });
      }

      if (input.direction === "adjust" && !input.reason) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "سبب التسوية مطلوب." });
      }

      const requiresAvailableStock = input.direction === "out" || input.direction === "transfer_out" || input.direction === "adjust";
      if (requiresAvailableStock) {
        const batchClause = input.batchNo ? " AND batchNo=?" : "";
        const params = input.batchNo
          ? [input.organizationId, input.branchId, input.warehouseId, input.itemCode, input.batchNo]
          : [input.organizationId, input.branchId, input.warehouseId, input.itemCode];
        const [balanceRows] = await connection.query(
          `SELECT COALESCE(SUM(CASE WHEN direction IN ('in','transfer_in') THEN qty ELSE -qty END),0) AS onHand
             FROM stock_movements
            WHERE organizationId=? AND branchId=? AND warehouseId=? AND itemCode=?${batchClause}
            FOR UPDATE`,
          params,
        );
        const onHand = Number((balanceRows as Array<{ onHand: string | number }>)[0]?.onHand ?? 0);

        // Quality holds are inventory reservations, not informational flags.
        // Lock the matching hold rows in the same transaction so a concurrent
        // outbound movement cannot consume quarantined/rejected stock.
        const holdParams = input.batchNo
          ? [input.organizationId, input.branchId, input.warehouseId, input.itemCode, input.batchNo]
          : [input.organizationId, input.branchId, input.warehouseId, input.itemCode];
        const [holdRows] = await connection.query(
          `SELECT COALESCE(SUM(quantity),0) AS heldQty
             FROM quality_holds
            WHERE organizationId=? AND branchId=? AND warehouseId=? AND itemCode=?
              AND status='active'${input.batchNo ? " AND batchNo=?" : ""}
            FOR UPDATE`,
          holdParams,
        );
        const heldQty = Number((holdRows as Array<{ heldQty: string | number }>)[0]?.heldQty ?? 0);
        const available = Math.max(0, onHand - heldQty);
        if (input.qty > available) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: `الرصيد المتاح غير كافٍ أو محجوز للجودة. المتاح ${available}، المطلوب ${input.qty}.` });
        }
      }

      if ((input.direction === "out" || input.direction === "transfer_out") && input.batchNo) {
        const [expiryRows] = await connection.query(
          `SELECT MIN(expiryDate) AS expiryDate FROM stock_movements
             WHERE organizationId=? AND branchId=? AND warehouseId=? AND itemCode=? AND batchNo=?
               AND expiryDate IS NOT NULL`,
          [input.organizationId, input.branchId, input.warehouseId, input.itemCode, input.batchNo],
        );
        const expiryDate = (expiryRows as Array<{ expiryDate: string | null }>)[0]?.expiryDate;
        if (expiryDate && new Date(expiryDate).getTime() < Date.now()) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "لا يمكن صرف دفعة منتهية الصلاحية." });
        }
      }

      const [ins] = await connection.query(
        "INSERT INTO stock_movements (organizationId,branchId,warehouseId,itemCode,batchNo,expiryDate,qty,direction,reason,movedByUserId) VALUES (?,?,?,?,?,?,?,?,?,?)",
        [input.organizationId, input.branchId, input.warehouseId, input.itemCode, input.batchNo ?? null, input.expiryDate ?? null, input.qty, input.direction, input.reason ?? null, ctx.user?.id ?? 0],
      );
      await connection.commit();
      return { movementId: Number((ins as { insertId: number }).insertId), recorded: true };
    } catch (error) {
      await connection.rollback();
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "تعذر تسجيل حركة المخزون." });
    } finally {
      connection.release();
    }
  }),

  /** FEFO: soonest-expiry batches first — the pharmacy-correct pick order. */
  expiringSoon: protectedProcedure.input(scope.extend({ days: z.number().int().min(1).max(365).default(90) })).query(async ({ ctx, input }) => {
    assertScope(ctx, input);
    const pool = getRawPool();
    const [rows] = await pool.query(
      `SELECT itemCode, batchNo, expiryDate, SUM(CASE WHEN direction IN ('in','transfer_in') THEN qty ELSE -qty END) remaining
       FROM stock_movements WHERE organizationId=? AND branchId=? AND expiryDate IS NOT NULL AND expiryDate <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
       GROUP BY itemCode, batchNo, expiryDate HAVING remaining > 0 ORDER BY expiryDate ASC LIMIT 200`, [input.organizationId, input.branchId, input.days]);
    return { batches: rows as Array<{ itemCode: string; batchNo: string; expiryDate: string; remaining: number }> };
  }),
});

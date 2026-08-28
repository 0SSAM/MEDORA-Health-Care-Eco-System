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

export const purchasingRouter = router({
  suppliers: protectedProcedure.input(scope).query(async ({ ctx, input }) => {
    assertScope(ctx, input);
    const pool = getRawPool();
    const [rows] = await pool.query("SELECT id, name, supplierCode, phone, paymentTermsDays, creditLimit, active FROM suppliers WHERE organizationId=? AND active=1 ORDER BY name LIMIT 200", [input.organizationId]);
    return { suppliers: rows as Array<{ id: number; name: string; supplierCode: string; phone: string | null; paymentTermsDays: number | null; creditLimit: string | null }> };
  }),

  createSupplier: protectedProcedure.input(scope.extend({ name: z.string().min(2).max(160), phone: z.string().max(30).optional(), paymentTermsDays: z.number().int().min(0).max(365).default(30) })).mutation(async ({ ctx, input }) => {
    assertScope(ctx, input);
    const pool = getRawPool();
    const code = "SUP-" + String(Math.floor(1000 + Math.random() * 9000));
    const [ins] = await pool.query("INSERT INTO suppliers (organizationId,branchId,jurisdictionId,name,supplierCode,phone,paymentTermsDays,active,createdByUserId) VALUES (?,?,?,?,?,?,?,1,?)", [input.organizationId, input.branchId, input.jurisdictionId, input.name, code, input.phone ?? null, input.paymentTermsDays, ctx.user?.id ?? 0]);
    return { supplierId: Number((ins as { insertId: number }).insertId), supplierCode: code };
  }),

  createPurchaseOrder: protectedProcedure.input(scope.extend({
    supplierId: z.number().int().positive(),
    currencyCode: z.string().length(3).default("EGP"),
    lines: z.array(z.object({ productId: z.number().int().positive(), orderedQuantity: z.number().int().positive(), unitCost: z.number().min(0) })).min(1),
  })).mutation(async ({ ctx, input }) => {
    assertScope(ctx, input);
    const total = input.lines.reduce((a, l) => a + l.orderedQuantity * l.unitCost, 0);
    const pool = getRawPool();
    const orderNumber = "PO-" + Date.now().toString(36).toUpperCase();
    const [ins] = await pool.query("INSERT INTO purchase_orders (organizationId,branchId,jurisdictionId,supplierId,orderNumber,status,currencyCode,totalAmount,createdByUserId) VALUES (?,?,?,?,?,'draft',?,?,?)", [input.organizationId, input.branchId, input.jurisdictionId, input.supplierId, orderNumber, input.currencyCode, total, ctx.user?.id ?? 0]);
    const poId = Number((ins as { insertId: number }).insertId);
    for (const l of input.lines) await pool.query("INSERT INTO purchase_order_lines (purchaseOrderId,productId,orderedQuantity,receivedQuantity,unitCost) VALUES (?,?,?,0,?)", [poId, l.productId, l.orderedQuantity, l.unitCost]);
    return { purchaseOrderId: poId, orderNumber, totalAmount: total, status: "draft" as const };
  }),

  approvePurchaseOrder: protectedProcedure.input(scope.extend({ purchaseOrderId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    assertScope(ctx, input);
    const pool = getRawPool();
    const [r] = await pool.query("UPDATE purchase_orders SET status='approved', approvedByUserId=?, approvedAt=NOW() WHERE id=? AND organizationId=? AND status='draft'", [ctx.user?.id ?? 0, input.purchaseOrderId, input.organizationId]);
    const changed = (r as { affectedRows: number }).affectedRows;
    if (!changed) throw new TRPCError({ code: "CONFLICT", message: "أمر الشراء غير موجود أو ليس مسودة." });
    return { approved: true };
  }),

  receivePurchaseOrder: protectedProcedure.input(scope.extend({
    purchaseOrderId: z.number().int().positive(),
    warehouseId: z.number().int().positive(),
    receipts: z.array(z.object({ productId: z.number().int().positive(), itemCode: z.string().min(1).max(64), qty: z.number().int().positive(), batchNo: z.string().max(40).optional(), expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() })).min(1),
  })).mutation(async ({ ctx, input }) => {
    assertScope(ctx, input);
    const pool = getRawPool();
    const [poRows] = await pool.query("SELECT status FROM purchase_orders WHERE id=? AND organizationId=? LIMIT 1", [input.purchaseOrderId, input.organizationId]);
    const po = (poRows as Array<{ status: string }>)[0];
    if (!po) throw new TRPCError({ code: "NOT_FOUND", message: "أمر الشراء غير موجود." });
    if (!["approved", "partially_received"].includes(po.status)) throw new TRPCError({ code: "CONFLICT", message: "أمر الشراء يجب أن يكون معتمدًا قبل الاستلام." });
    const grNum = "GR-" + Date.now().toString(36).toUpperCase();
    const idem = "PO" + input.purchaseOrderId + "-" + Date.now().toString(36);
    const [grIns] = await pool.query("INSERT INTO goods_receipts (organizationId,branchId,purchaseOrderId,receiptNumber,idempotencyKey,status,receivedByUserId,postedAt) VALUES (?,?,?,?,?,?,?,NOW())", [input.organizationId, input.branchId, input.purchaseOrderId, grNum, idem, "posted", ctx.user?.id ?? 0]);
    const grId = Number((grIns as { insertId: number }).insertId);
    for (const r of input.receipts) {
      await pool.query("UPDATE purchase_order_lines SET receivedQuantity=receivedQuantity+? WHERE purchaseOrderId=? AND productId=?", [r.qty, input.purchaseOrderId, r.productId]);
      await pool.query("INSERT INTO stock_movements (organizationId,branchId,warehouseId,itemCode,batchNo,expiryDate,qty,direction,reason,refType,refId,movedByUserId) VALUES (?,?,?,?,?,?,?,'in','استلام مشتريات','purchase_order',?,?)", [input.organizationId, input.branchId, input.warehouseId, r.itemCode, r.batchNo ?? null, r.expiryDate ?? null, r.qty, input.purchaseOrderId, ctx.user?.id ?? 0]);
    }
    const [chk] = await pool.query("SELECT SUM(orderedQuantity) o, SUM(receivedQuantity) r FROM purchase_order_lines WHERE purchaseOrderId=?", [input.purchaseOrderId]);
    const t = (chk as Array<{ o: number; r: number }>)[0];
    const done = Number(t.r) >= Number(t.o);
    await pool.query("UPDATE purchase_orders SET status=? WHERE id=?", [done ? "received" : "partially_received", input.purchaseOrderId]);
    return { goodsReceiptId: grId, status: done ? "received" as const : "partially_received" as const };
  }),

  listPurchaseOrders: protectedProcedure.input(scope).query(async ({ ctx, input }) => {
    assertScope(ctx, input);
    const pool = getRawPool();
    const [rows] = await pool.query(
      `SELECT p.id, p.orderNumber, p.status, p.totalAmount, p.currencyCode, p.createdAt, s.name supplier
       FROM purchase_orders p JOIN suppliers s ON s.id=p.supplierId
       WHERE p.organizationId=? ORDER BY p.id DESC LIMIT 100`, [input.organizationId]);
    return { orders: rows as Array<{ id: number; orderNumber: string; status: string; totalAmount: string; currencyCode: string; supplier: string }> };
  }),
});

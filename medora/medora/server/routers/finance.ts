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
const line = z.object({ accountCode: z.string().min(1), debit: z.number().min(0).default(0), credit: z.number().min(0).default(0) });

export const financeRouter = router({
  chartOfAccounts: protectedProcedure.input(scope).query(async ({ ctx, input }) => {
    assertScope(ctx, input);
    const pool = getRawPool();
    const [rows] = await pool.query("SELECT id, code, nameAr, type, active FROM chart_of_accounts WHERE organizationId=? AND active=1 ORDER BY code", [input.organizationId]);
    return { accounts: rows as Array<{ id: number; code: string; nameAr: string; type: string }> };
  }),

  postJournal: protectedProcedure.input(scope.extend({
    memo: z.string().max(255).optional(),
    lines: z.array(line).min(2),
  })).mutation(async ({ ctx, input }) => {
    assertScope(ctx, input);
    const sumD = input.lines.reduce((a, l) => a + l.debit, 0);
    const sumC = input.lines.reduce((a, l) => a + l.credit, 0);
    if (Math.abs(sumD - sumC) > 0.005) throw new TRPCError({ code: "BAD_REQUEST", message: `القيد غير متوازن: مدين ${sumD} ≠ دائن ${sumC}` });
    if (sumD <= 0) throw new TRPCError({ code: "BAD_REQUEST", message: "قيد فارغ." });
    const pool = getRawPool();
    const [accRows] = await pool.query("SELECT id, code FROM chart_of_accounts WHERE organizationId=? AND code IN (?)", [input.organizationId, input.lines.map((l) => l.accountCode)]);
    const map = new Map((accRows as Array<{ id: number; code: string }>).map((r) => [r.code, r.id]));
    for (const l of input.lines) if (!map.has(l.accountCode)) throw new TRPCError({ code: "BAD_REQUEST", message: `حساب غير موجود: ${l.accountCode}` });
    const [ins] = await pool.query("INSERT INTO journal_entries (organizationId,branchId,entryDate,memo,status,createdByUserId) VALUES (?,?,CURDATE(),?,'posted',?)", [input.organizationId, input.branchId, input.memo ?? null, ctx.user?.id ?? 0]);
    const jeId = Number((ins as { insertId: number }).insertId);
    for (const l of input.lines) await pool.query("INSERT INTO journal_lines (journalEntryId,accountId,debit,credit) VALUES (?,?,?,?)", [jeId, map.get(l.accountCode), l.debit, l.credit]);
    return { journalEntryId: jeId, posted: true, total: sumD };
  }),

  trialBalance: protectedProcedure.input(scope).query(async ({ ctx, input }) => {
    assertScope(ctx, input);
    const pool = getRawPool();
    const [rows] = await pool.query(
      `SELECT a.code, a.nameAr, a.type, COALESCE(SUM(l.debit),0) debit, COALESCE(SUM(l.credit),0) credit
       FROM chart_of_accounts a
       LEFT JOIN journal_lines l ON l.accountId=a.id
       LEFT JOIN journal_entries e ON e.id=l.journalEntryId AND e.status='posted'
       WHERE a.organizationId=? GROUP BY a.id ORDER BY a.code`, [input.organizationId]);
    const list = rows as Array<{ code: string; nameAr: string; type: string; debit: string; credit: string }>;
    return { rows: list.map((r) => ({ ...r, debit: Number(r.debit), credit: Number(r.credit), balance: Number(r.debit) - Number(r.credit) })) };
  }),

  recordPayment: protectedProcedure.input(scope.extend({
    direction: z.enum(["in", "out"]),
    method: z.enum(["cash", "card", "transfer", "wallet"]).default("cash"),
    amount: z.number().positive(),
    refType: z.string().max(40).optional(),
  })).mutation(async ({ ctx, input }) => {
    assertScope(ctx, input);
    const pool = getRawPool();
    const [ins] = await pool.query("INSERT INTO payments (organizationId,branchId,direction,method,amount,refType,createdByUserId) VALUES (?,?,?,?,?,?,?)", [input.organizationId, input.branchId, input.direction, input.method, input.amount, input.refType ?? null, ctx.user?.id ?? 0]);
    return { paymentId: Number((ins as { insertId: number }).insertId), recorded: true };
  }),

  cashPosition: protectedProcedure.input(scope).query(async ({ ctx, input }) => {
    assertScope(ctx, input);
    const pool = getRawPool();
    const [rows] = await pool.query("SELECT direction, COALESCE(SUM(amount),0) total FROM payments WHERE organizationId=? GROUP BY direction", [input.organizationId]);
    const m = new Map((rows as Array<{ direction: string; total: string }>).map((r) => [r.direction, Number(r.total)]));
    const inflow = m.get("in") ?? 0, outflow = m.get("out") ?? 0;
    return { inflow, outflow, net: inflow - outflow };
  }),
});

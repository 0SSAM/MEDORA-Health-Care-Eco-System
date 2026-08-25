// MEDORA | ميدورا — Integrated Health Care System
// Miscellaneous Expense tRPC Router

import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { miscellaneousExpenses, branchUsers, branches, organizationMemberships, inventoryBatches, auditLogs } from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { canAccessBranch } from "../domain/branch-access";
import { hasOrganizationCapability } from "../domain/organization-access";
import { writeDetailedAudit } from "../domain/audit-policy";
import { emitUnauthorizedAttemptAlert, emitManagerNotification } from "../domain/notification-emitter";

type Database = NonNullable<Awaited<ReturnType<typeof getDb>>>;

async function getUserBranchIds(db: Database, userId: number, role: string) {
  if (role === "admin") return null;
  const memberships = await db.select({ branchId: branchUsers.branchId }).from(branchUsers).where(and(eq(branchUsers.userId, userId), eq(branchUsers.active, 1)));
  return memberships.map(({ branchId }) => branchId);
}

async function assertUserBranchAccess(db: Database, userId: number, role: string, branchId: number) {
  const branchIds = await getUserBranchIds(db, userId, role);
  if (branchIds !== null && canAccessBranch(role, branchIds, branchId) || branchIds === null) return;
  throw new TRPCError({ code: "FORBIDDEN", message: "User is not assigned to this branch" });
}

export const miscellaneousExpenseRouter = router({
  list: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      if (ctx.user.role !== "admin") {
        const membership = await db.select().from(organizationMemberships).where(and(eq(organizationMemberships.organizationId, input.organizationId), eq(organizationMemberships.userId, ctx.user.id))).limit(1);
        if (!membership.length) throw new TRPCError({ code: "FORBIDDEN", message: "User does not belong to this organization" });
      }

      const filters = [eq(miscellaneousExpenses.organizationId, input.organizationId)];
      if (input.branchId) {
        filters.push(eq(miscellaneousExpenses.branchId, input.branchId));
      }

      return db.select().from(miscellaneousExpenses).where(and(...filters)).orderBy(sql`${miscellaneousExpenses.expenseDate} DESC`);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number().int().positive(),
      branchId: z.number().int().positive(),
      category: z.enum(["utilities", "rent", "supplies", "maintenance", "marketing", "other"]),
      amount: z.number().positive(),
      currency: z.string().length(3).default("EGP"),
      description: z.string().max(2000).optional(),
      expenseDate: z.coerce.date().default(() => new Date()),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId);

      const inserted = await db.insert(miscellaneousExpenses).values({
        ...input,
        amount: input.amount.toFixed(2),
        createdByUserId: ctx.user.id,
        status: "pending",
      });

      return { expenseId: Number(inserted[0].insertId) };
    }),

  updateStatus: protectedProcedure
    .input(z.object({ expenseId: z.number().int().positive(), status: z.enum(["pending", "paid", "cancelled"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const expense = (await db.select().from(miscellaneousExpenses).where(eq(miscellaneousExpenses.id, input.expenseId)).limit(1))[0];
      if (!expense) throw new TRPCError({ code: "NOT_FOUND", message: "Expense not found" });

      // Check organization role permission
      const memberships = await db.select().from(organizationMemberships).where(and(eq(organizationMemberships.userId, ctx.user.id), eq(organizationMemberships.active, 1)));
      
      const capability = input.status === "cancelled" ? "finance_expense_cancel" : "finance_expense_approve";
      if (!hasOrganizationCapability(ctx.user.role, memberships, expense.organizationId, capability)) {
        await emitUnauthorizedAttemptAlert(db, { organizationId: expense.organizationId, branchId: expense.branchId, userId: ctx.user.id, action: input.status === "cancelled" ? "إلغاء مصروف" : "دفع مصروف", resource: `Expense:${expense.id}` });
        throw new TRPCError({ code: "FORBIDDEN", message: `Insufficient permissions to ${input.status === "cancelled" ? "cancel" : "pay"} expenses` });
      }
      if (!expense) throw new TRPCError({ code: "NOT_FOUND", message: "Expense not found" });

      await db.transaction(async (tx) => {
        await tx.update(miscellaneousExpenses)
          .set({ status: input.status })
          .where(eq(miscellaneousExpenses.id, input.expenseId));

        await writeDetailedAudit(tx, {
          userId: ctx.user.id,
          organizationId: expense.organizationId,
          branchId: expense.branchId,
          action: `miscellaneous_expense_${input.status}`,
          entityType: "miscellaneous_expense",
          entityId: expense.id
        });

        await emitManagerNotification(tx, {
          organizationId: expense.organizationId,
          branchId: expense.branchId,
          severity: input.status === "paid" ? "success" : "warning",
          title: input.status === "paid" ? "تم دفع مصروف" : "تم إلغاء مصروف",
          body: `قام المستخدم ${ctx.user.id} بـ ${input.status === "paid" ? "دفع" : "إلغاء"} المصروف رقم ${expense.id}.`,
          createdByUserId: ctx.user.id
        });
      });

      return { success: true };
    }),
});

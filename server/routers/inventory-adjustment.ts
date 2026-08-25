// MEDORA | ميدورا — Integrated Health Care System
// Inventory Adjustment tRPC Router

import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { inventoryAdjustments, inventoryBatches, products, branchUsers, branches, organizationMemberships, auditLogs } from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { canAccessBranch } from "../domain/branch-access";
import { calculateNewStock, validateAdjustmentReason } from "../domain/inventory-adjustment-policy";
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

export const inventoryAdjustmentRouter = router({
  list: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      // Verify user belongs to organization
      if (ctx.user.role !== "admin") {
        const membership = await db.select().from(organizationMemberships).where(and(eq(organizationMemberships.organizationId, input.organizationId), eq(organizationMemberships.userId, ctx.user.id))).limit(1);
        if (!membership.length) throw new TRPCError({ code: "FORBIDDEN", message: "User does not belong to this organization" });
      }

      const filters = [eq(inventoryAdjustments.organizationId, input.organizationId)];
      if (input.branchId) {
        filters.push(eq(inventoryAdjustments.branchId, input.branchId));
      }

      return db.select({
        adjustment: inventoryAdjustments,
        productName: products.nameAr,
        batchNumber: inventoryBatches.batchNumber,
      })
      .from(inventoryAdjustments)
      .innerJoin(products, eq(inventoryAdjustments.productId, products.id))
      .innerJoin(inventoryBatches, eq(inventoryAdjustments.batchId, inventoryBatches.id))
      .where(and(...filters))
      .orderBy(sql`${inventoryAdjustments.createdAt} DESC`);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number().int().positive(),
      branchId: z.number().int().positive(),
      productId: z.number().int().positive(),
      batchId: z.number().int().positive(),
      adjustmentType: z.enum(["expired", "damaged", "lost", "found", "correction"]),
      quantity: z.number().positive(),
      reason: z.string().max(1000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId);

      if (!validateAdjustmentReason(input.adjustmentType, input.reason)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "A valid reason (min 5 chars) is required for this adjustment type" });
      }

      // Verify batch belongs to branch/product
      const batch = await db.select().from(inventoryBatches).where(and(eq(inventoryBatches.id, input.batchId), eq(inventoryBatches.branchId, input.branchId), eq(inventoryBatches.productId, input.productId))).limit(1);
      if (!batch.length) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid batch for this branch and product" });

      const inserted = await db.insert(inventoryAdjustments).values({
        ...input,
        quantity: input.quantity.toFixed(3),
        createdByUserId: ctx.user.id,
        status: "pending",
      });

      return { adjustmentId: Number(inserted[0].insertId) };
    }),

  approve: protectedProcedure
    .input(z.object({ adjustmentId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const adjustment = (await db.select().from(inventoryAdjustments).where(eq(inventoryAdjustments.id, input.adjustmentId)).limit(1))[0];
      if (!adjustment) throw new TRPCError({ code: "NOT_FOUND", message: "Adjustment not found" });

      // Check organization role permission
      const memberships = await db.select().from(organizationMemberships).where(and(eq(organizationMemberships.userId, ctx.user.id), eq(organizationMemberships.active, 1)));
      if (!hasOrganizationCapability(ctx.user.role, memberships, adjustment.organizationId, "inventory_adjustment_approve")) {
        await emitUnauthorizedAttemptAlert(db, { organizationId: adjustment.organizationId, branchId: adjustment.branchId, userId: ctx.user.id, action: "اعتماد تسوية", resource: `Adjustment:${adjustment.id}` });
        throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions to approve adjustments" });
      }
      if (!adjustment) throw new TRPCError({ code: "NOT_FOUND", message: "Adjustment not found" });

      if (adjustment.status !== "pending") {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Adjustment is already processed" });
      }

      await db.transaction(async (tx) => {
        const batch = (await tx.select().from(inventoryBatches).where(eq(inventoryBatches.id, adjustment.batchId)).limit(1))[0];
        if (!batch) throw new Error("Inventory batch not found");

        const newQty = calculateNewStock(Number(batch.quantityOnHand), Number(adjustment.quantity), adjustment.adjustmentType);
        if (newQty < 0 && adjustment.adjustmentType !== "found") throw new Error("Insufficient stock for adjustment");

        await tx.update(inventoryBatches)
          .set({ quantityOnHand: newQty.toFixed(3) })
          .where(eq(inventoryBatches.id, adjustment.batchId));

        await tx.update(inventoryAdjustments)
          .set({ status: "approved", approvedByUserId: ctx.user.id })
          .where(eq(inventoryAdjustments.id, input.adjustmentId));

        await writeDetailedAudit(tx, {
          userId: ctx.user.id,
          organizationId: adjustment.organizationId,
          branchId: adjustment.branchId,
          action: "inventory_adjustment_approved",
          entityType: "inventory_adjustment",
          entityId: adjustment.id
        });

        await emitManagerNotification(tx, {
          organizationId: adjustment.organizationId,
          branchId: adjustment.branchId,
          severity: "success",
          title: "تم اعتماد تسوية مخزنية",
          body: `قام المستخدم ${ctx.user.id} باعتماد التسوية رقم ${adjustment.id} بنجاح.`,
          createdByUserId: ctx.user.id
        });
      });

      return { status: "approved" };
    }),

  reject: protectedProcedure
    .input(z.object({ adjustmentId: z.number().int().positive(), reason: z.string().min(3).max(500) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const adjustment = (await db.select().from(inventoryAdjustments).where(eq(inventoryAdjustments.id, input.adjustmentId)).limit(1))[0];
      if (!adjustment) throw new TRPCError({ code: "NOT_FOUND", message: "Adjustment not found" });

      // Check organization role permission
      const memberships = await db.select().from(organizationMemberships).where(and(eq(organizationMemberships.userId, ctx.user.id), eq(organizationMemberships.active, 1)));
      if (!hasOrganizationCapability(ctx.user.role, memberships, adjustment.organizationId, "inventory_adjustment_approve")) {
        await emitUnauthorizedAttemptAlert(db, { organizationId: adjustment.organizationId, branchId: adjustment.branchId, userId: ctx.user.id, action: "رفض تسوية", resource: `Adjustment:${adjustment.id}` });
        throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions to reject adjustments" });
      }
      if (!adjustment) throw new TRPCError({ code: "NOT_FOUND", message: "Adjustment not found" });

      if (adjustment.status !== "pending") {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Adjustment is already processed" });
      }

      await db.update(inventoryAdjustments)
        .set({ status: "rejected", approvedByUserId: ctx.user.id, reason: sql`CONCAT(${inventoryAdjustments.reason}, '\nRejection Reason: ', ${input.reason})` })
        .where(eq(inventoryAdjustments.id, input.adjustmentId));

      await writeDetailedAudit(db, {
        userId: ctx.user.id,
        organizationId: adjustment.organizationId,
        branchId: adjustment.branchId,
        action: "inventory_adjustment_rejected",
        entityType: "inventory_adjustment",
        entityId: adjustment.id
      });

      await emitManagerNotification(db, {
        organizationId: adjustment.organizationId,
        branchId: adjustment.branchId,
        severity: "warning",
        title: "تم رفض تسوية مخزنية",
        body: `قام المستخدم ${ctx.user.id} برفض التسوية رقم ${adjustment.id}.`,
        createdByUserId: ctx.user.id
      });

      return { status: "rejected" };
    }),
});

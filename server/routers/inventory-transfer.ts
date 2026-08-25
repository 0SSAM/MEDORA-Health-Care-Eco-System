// MEDORA | ميدورا — Integrated Health Care System
// Inventory Transfer tRPC Router
// Handles inter-branch stock movements with full audit trail and policy enforcement.

import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { inventoryTransferLines, inventoryTransfers, inventoryBatches, products, branchJurisdictions, branches, branchUsers, organizationMemberships, organizations, auditLogs } from "../../drizzle/schema";
import { canAccessBranch } from "../domain/branch-access";
import { getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { canTransitionTransfer, getNextTransferStatus, normalizeTransferNumber, validateTransferQuantity } from "../domain/inventory-transfer-policy";
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

async function getBranchOrganizationId(db: Database, branchId: number) {
  const branch = (await db.select({ organizationId: branches.organizationId }).from(branches).where(eq(branches.id, branchId)).limit(1))[0];
  if (!branch?.organizationId) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Branch has no organization scope" });
  return branch.organizationId;
}

export const inventoryTransferRouter = router({
  list: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      const filters = [eq(inventoryTransfers.organizationId, input.organizationId)];
      if (input.branchId) {
        filters.push(sql`(${inventoryTransfers.sourceBranchId} = ${input.branchId} OR ${inventoryTransfers.destinationBranchId} = ${input.branchId})`);
      }

      return db.select().from(inventoryTransfers).where(and(...filters)).orderBy(sql`${inventoryTransfers.createdAt} DESC`);
    }),

  create: protectedProcedure
    .input(z.object({
      organizationId: z.number().int().positive(),
      sourceBranchId: z.number().int().positive(),
      destinationBranchId: z.number().int().positive(),
      transferNumber: z.string().min(3).max(80),
      notes: z.string().max(1000).optional(),
      items: z.array(z.object({
        productId: z.number().int().positive(),
        batchId: z.number().int().positive(),
        quantity: z.number().positive(),
      })).min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      if (input.sourceBranchId === input.destinationBranchId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Source and destination branches must be different" });
      }

      await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.sourceBranchId);

      const transferNumber = normalizeTransferNumber(input.transferNumber);

      const result = await db.transaction(async (tx) => {
        const inserted = await tx.insert(inventoryTransfers).values({
          organizationId: input.organizationId,
          sourceBranchId: input.sourceBranchId,
          destinationBranchId: input.destinationBranchId,
          transferNumber,
          notes: input.notes,
          status: "draft",
          createdByUserId: ctx.user.id,
        });

        const transferId = Number(inserted[0].insertId);

        await tx.insert(inventoryTransferLines).values(
          input.items.map(item => ({
            transferId,
            productId: item.productId,
            batchId: item.batchId,
            requestedQuantity: item.quantity.toFixed(3),
            status: "pending" as const,
          }))
        );

        return transferId;
      });

      return { transferId: result, transferNumber };
    }),

  submit: protectedProcedure
    .input(z.object({ transferId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const transfer = (await db.select().from(inventoryTransfers).where(eq(inventoryTransfers.id, input.transferId)).limit(1))[0];
      if (!transfer) throw new TRPCError({ code: "NOT_FOUND", message: "Transfer not found" });

      if (!canTransitionTransfer(transfer.status, "submit")) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Invalid transfer status for submission" });
      }

      await db.update(inventoryTransfers)
        .set({ status: "requested" })
        .where(eq(inventoryTransfers.id, input.transferId));

      return { status: "requested" };
    }),

  approve: protectedProcedure
    .input(z.object({ transferId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const transfer = (await db.select().from(inventoryTransfers).where(eq(inventoryTransfers.id, input.transferId)).limit(1))[0];
      if (!transfer) throw new TRPCError({ code: "NOT_FOUND", message: "Transfer not found" });

      // Check organization role permission
      const memberships = await db.select().from(organizationMemberships).where(and(eq(organizationMemberships.userId, ctx.user.id), eq(organizationMemberships.active, 1)));
      if (!hasOrganizationCapability(ctx.user.role, memberships, transfer.organizationId, "inventory_transfer_approve")) {
        await emitUnauthorizedAttemptAlert(db, { organizationId: transfer.organizationId, branchId: transfer.sourceBranchId, userId: ctx.user.id, action: "اعتماد تحويل", resource: `Transfer:${transfer.id}` });
        throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions to approve transfers" });
      }
      if (!transfer) throw new TRPCError({ code: "NOT_FOUND", message: "Transfer not found" });

      if (!canTransitionTransfer(transfer.status, "approve")) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Invalid transfer status for approval" });
      }

      await db.update(inventoryTransfers)
        .set({ status: "approved", approvedByUserId: ctx.user.id, approvedAt: new Date() })
        .where(eq(inventoryTransfers.id, input.transferId));

      await writeDetailedAudit(db, {
        userId: ctx.user.id,
        organizationId: transfer.organizationId,
        branchId: transfer.sourceBranchId,
        action: "inventory_transfer_approved",
        entityType: "inventory_transfer",
        entityId: transfer.id
      });

      await emitManagerNotification(db, {
        organizationId: transfer.organizationId,
        branchId: transfer.sourceBranchId,
        severity: "success",
        title: "تم اعتماد طلب تحويل",
        body: `قام المستخدم ${ctx.user.id} باعتماد طلب التحويل رقم ${transfer.transferNumber}.`,
        createdByUserId: ctx.user.id
      });

      return { status: "approved" };
    }),

  dispatch: protectedProcedure
    .input(z.object({ 
      transferId: z.number().int().positive(),
      shippedItems: z.array(z.object({
        lineId: z.number().int().positive(),
        quantity: z.number().positive(),
      })).min(1)
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const transfer = (await db.select().from(inventoryTransfers).where(eq(inventoryTransfers.id, input.transferId)).limit(1))[0];
      if (!transfer) throw new TRPCError({ code: "NOT_FOUND", message: "Transfer not found" });

      // Check organization role permission
      const memberships = await db.select().from(organizationMemberships).where(and(eq(organizationMemberships.userId, ctx.user.id), eq(organizationMemberships.active, 1)));
      if (!hasOrganizationCapability(ctx.user.role, memberships, transfer.organizationId, "inventory_transfer_dispatch")) {
        await emitUnauthorizedAttemptAlert(db, { organizationId: transfer.organizationId, branchId: transfer.sourceBranchId, userId: ctx.user.id, action: "شحن تحويل", resource: `Transfer:${transfer.id}` });
        throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions to dispatch transfers" });
      }

      if (!canTransitionTransfer(transfer.status, "dispatch")) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Invalid transfer status for dispatch" });
      }

      await db.transaction(async (tx) => {
        for (const item of input.shippedItems) {
          const line = (await tx.select().from(inventoryTransferLines).where(eq(inventoryTransferLines.id, item.lineId)).limit(1))[0];
          if (!line) throw new TRPCError({ code: "NOT_FOUND", message: `Line item ${item.lineId} not found` });
          
          if (item.quantity > Number(line.requestedQuantity)) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Shipped quantity for product ${line.productId} exceeds requested` });
          }

          // Decrement stock from source branch batch
          const batch = (await tx.select().from(inventoryBatches).where(eq(inventoryBatches.id, line.batchId)).limit(1))[0];
          if (!batch) throw new TRPCError({ code: "NOT_FOUND", message: `Batch ${line.batchId} not found` });
          
          const currentQty = Number(batch.quantityOnHand);
          if (currentQty < item.quantity) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Insufficient stock in batch ${batch.batchNumber} at source branch` });
          }

          await tx.update(inventoryBatches)
            .set({ quantityOnHand: (currentQty - item.quantity).toFixed(3) })
            .where(eq(inventoryBatches.id, line.batchId));

          await tx.update(inventoryTransferLines)
            .set({ shippedQuantity: item.quantity.toFixed(3), status: "shipped" })
            .where(eq(inventoryTransferLines.id, item.lineId));
        }

        await tx.update(inventoryTransfers)
          .set({ status: "in_transit", dispatchedByUserId: ctx.user.id, dispatchedAt: new Date() })
          .where(eq(inventoryTransfers.id, transfer.id));

        await writeDetailedAudit(tx, {
          userId: ctx.user.id,
          organizationId: transfer.organizationId,
          branchId: transfer.sourceBranchId,
          action: "inventory_transfer_dispatched",
          entityType: "inventory_transfer",
          entityId: transfer.id
        });

        await emitManagerNotification(tx, {
          organizationId: transfer.organizationId,
          branchId: transfer.sourceBranchId,
          severity: "info",
          title: "تم شحن تحويل مخزني",
          body: `تم شحن طلب التحويل رقم ${transfer.transferNumber} بواسطة المستخدم ${ctx.user.id}.`,
          createdByUserId: ctx.user.id
        });
      });

      return { status: "in_transit" };
    }),

  receive: protectedProcedure
    .input(z.object({ 
      transferId: z.number().int().positive(),
      receivedItems: z.array(z.object({
        lineId: z.number().int().positive(),
        quantity: z.number().nonnegative(),
      })).min(1)
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const transfer = (await db.select().from(inventoryTransfers).where(eq(inventoryTransfers.id, input.transferId)).limit(1))[0];
      if (!transfer) throw new TRPCError({ code: "NOT_FOUND", message: "Transfer not found" });

      // Check organization role permission
      const memberships = await db.select().from(organizationMemberships).where(and(eq(organizationMemberships.userId, ctx.user.id), eq(organizationMemberships.active, 1)));
      if (!hasOrganizationCapability(ctx.user.role, memberships, transfer.organizationId, "inventory_transfer_receive")) {
        await emitUnauthorizedAttemptAlert(db, { organizationId: transfer.organizationId, branchId: transfer.destinationBranchId, userId: ctx.user.id, action: "استلام تحويل", resource: `Transfer:${transfer.id}` });
        throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient permissions to receive transfers" });
      }

      if (!canTransitionTransfer(transfer.status, "receive")) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Invalid transfer status for receipt" });
      }

      await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, transfer.destinationBranchId);

      await db.transaction(async (tx) => {
        let allReceived = true;
        for (const item of input.receivedItems) {
          const line = (await tx.select().from(inventoryTransferLines).where(eq(inventoryTransferLines.id, item.lineId)).limit(1))[0];
          if (!line) throw new TRPCError({ code: "NOT_FOUND", message: `Line item ${item.lineId} not found` });
          
          if (item.quantity > Number(line.shippedQuantity)) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Received quantity for product ${line.productId} exceeds shipped` });
          }

          if (item.quantity < Number(line.shippedQuantity)) allReceived = false;

          // Increment stock in destination branch
          // Note: In a production multi-branch system, we would either find an existing batch with same expiry 
          // or create a new batch entry for the destination branch.
          const sourceBatch = (await tx.select().from(inventoryBatches).where(eq(inventoryBatches.id, line.batchId)).limit(1))[0];
          
          const destBatch = (await tx.select().from(inventoryBatches).where(and(
            eq(inventoryBatches.branchId, transfer.destinationBranchId),
            eq(inventoryBatches.productId, line.productId),
            eq(inventoryBatches.batchNumber, sourceBatch?.batchNumber || "TRANSFERRED")
          )).limit(1))[0];

          if (destBatch) {
            await tx.update(inventoryBatches)
              .set({ quantityOnHand: (Number(destBatch.quantityOnHand) + item.quantity).toFixed(3) })
              .where(eq(inventoryBatches.id, destBatch.id));
          } else if (sourceBatch) {
            await tx.insert(inventoryBatches).values({
              organizationId: transfer.organizationId,
              branchId: transfer.destinationBranchId,
              productId: line.productId,
              batchNumber: sourceBatch.batchNumber,
              expiryDate: sourceBatch.expiryDate,
              quantityOnHand: item.quantity.toFixed(3),
              jurisdictionId: sourceBatch.jurisdictionId
            });
          }

          await tx.update(inventoryTransferLines)
            .set({ receivedQuantity: item.quantity.toFixed(3), status: "received" })
            .where(eq(inventoryTransferLines.id, item.lineId));
        }

        await tx.update(inventoryTransfers)
          .set({ 
            status: allReceived ? "received" : "partially_received", 
            receivedByUserId: ctx.user.id, 
            receivedAt: new Date() 
          })
          .where(eq(inventoryTransfers.id, input.transferId));

        await writeDetailedAudit(tx, {
          userId: ctx.user.id,
          organizationId: transfer.organizationId,
          branchId: transfer.destinationBranchId,
          action: "inventory_transfer_received",
          entityType: "inventory_transfer",
          entityId: transfer.id
        });

        await emitManagerNotification(tx, {
          organizationId: transfer.organizationId,
          branchId: transfer.destinationBranchId,
          severity: "success",
          title: "تم استلام تحويل مخزني",
          body: `تم استلام طلب التحويل رقم ${transfer.transferNumber} بنجاح بواسطة المستخدم ${ctx.user.id}.`,
          createdByUserId: ctx.user.id
        });
      });

      return { status: "received" };
    }),

  getById: protectedProcedure
    .input(z.object({ transferId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const transfer = (await db.select().from(inventoryTransfers).where(eq(inventoryTransfers.id, input.transferId)).limit(1))[0];
      if (!transfer) throw new TRPCError({ code: "NOT_FOUND", message: "Transfer not found" });

      return transfer;
    }),

  listLines: protectedProcedure
    .input(z.object({ transferId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      return db.select().from(inventoryTransferLines).where(eq(inventoryTransferLines.transferId, input.transferId));
    }),

  searchInventory: protectedProcedure
    .input(z.object({ 
      branchId: z.number().int().positive(), 
      query: z.string().min(1).max(100) 
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await assertUserBranchAccess(db, ctx.user.id, ctx.user.role, input.branchId);

      return db.select({
        productId: products.id,
        batchId: inventoryBatches.id,
        nameAr: products.nameAr,
        batchNumber: inventoryBatches.batchNumber,
        expiryDate: inventoryBatches.expiryDate,
        quantity: inventoryBatches.quantityOnHand,
      })
      .from(inventoryBatches)
      .innerJoin(products, eq(inventoryBatches.productId, products.id))
      .where(and(
        eq(inventoryBatches.branchId, input.branchId),
        sql`(${products.nameAr} LIKE ${`%${input.query}%`} OR ${inventoryBatches.batchNumber} LIKE ${`%${input.query}%`})`,
        sql`${inventoryBatches.quantityOnHand} > 0`
      ))
      .limit(20);
    }),
});

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import * as schema from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { checkCapability } from "../domain/organization-access";
import { emitManagerNotification } from "../domain/notification-emitter";
import { writeDetailedAudit } from "../domain/audit-policy";

export const leavePermissionRouter = router({
  // Leave Requests
  listLeaves: protectedProcedure
    .input(z.object({ organizationId: z.number(), branchId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      const filters = [eq(schema.employeeLeaveRequests.organizationId, input.organizationId)];
      if (input.branchId) filters.push(eq(schema.employeeLeaveRequests.branchId, input.branchId));
      
      // Employees can only see their own, managers see all
      const canManage = await checkCapability(db, ctx.user.id, input.organizationId, "manage_payroll");
      if (!canManage) {
        const profile = (await db.select().from(schema.employeeProfiles).where(and(eq(schema.employeeProfiles.userId, ctx.user.id), eq(schema.employeeProfiles.organizationId, input.organizationId))).limit(1))[0];
        if (!profile) throw new TRPCError({ code: "FORBIDDEN", message: "Employee profile not found" });
        filters.push(eq(schema.employeeLeaveRequests.employeeProfileId, profile.id));
      }

      return await db.select().from(schema.employeeLeaveRequests).where(and(...filters)).orderBy(desc(schema.employeeLeaveRequests.createdAt));
    }),

  submitLeave: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      branchId: z.number(),
      leaveType: z.enum(["annual", "sick", "emergency", "unpaid", "other"]),
      startsAt: z.date(),
      endsAt: z.date(),
      reason: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const profile = (await db.select().from(schema.employeeProfiles).where(and(eq(schema.employeeProfiles.userId, ctx.user.id), eq(schema.employeeProfiles.organizationId, input.organizationId))).limit(1))[0];
      if (!profile) throw new TRPCError({ code: "FORBIDDEN", message: "Employee profile not found" });

      // Check for overlapping leave requests
      const overlap = await db.select().from(schema.employeeLeaveRequests).where(and(
        eq(schema.employeeLeaveRequests.employeeProfileId, profile.id),
        eq(schema.employeeLeaveRequests.status, "approved"),
        sql`${schema.employeeLeaveRequests.startsAt} <= ${input.endsAt}`,
        sql`${schema.employeeLeaveRequests.endsAt} >= ${input.startsAt}`
      )).limit(1);

      if (overlap.length) {
        throw new TRPCError({ code: "CONFLICT", message: "يوجد طلب إجازة معتمد يتداخل مع هذه التواريخ." });
      }

      const inserted = await db.insert(schema.employeeLeaveRequests).values({
        organizationId: input.organizationId,
        branchId: input.branchId,
        employeeProfileId: profile.id,
        leaveType: input.leaveType,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        status: "submitted",
        reasonEncrypted: input.reason,
        createdByUserId: ctx.user.id
      });

      const requestId = Number(inserted[0].insertId);

      await writeDetailedAudit(db, {
        userId: ctx.user.id,
        organizationId: input.organizationId,
        branchId: input.branchId,
        action: "employee_leave_submitted",
        entityType: "employee_leave_request",
        entityId: requestId
      });

      await emitManagerNotification(db, {
        organizationId: input.organizationId,
        branchId: input.branchId,
        severity: "info",
        title: "طلب إجازة جديد",
        body: `قام الموظف ${profile.employeeNumber} بتقديم طلب إجازة ${input.leaveType}.`,
        createdByUserId: ctx.user.id
      });

      return { success: true };
    }),

  // Permission Requests
  submitPermission: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      branchId: z.number(),
      requestType: z.enum(["late_arrival", "early_departure", "mid_shift_break"]),
      requestDate: z.date(),
      startTime: z.date(),
      endTime: z.date(),
      reason: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const profile = (await db.select().from(schema.employeeProfiles).where(and(eq(schema.employeeProfiles.userId, ctx.user.id), eq(schema.employeeProfiles.organizationId, input.organizationId))).limit(1))[0];
      if (!profile) throw new TRPCError({ code: "FORBIDDEN", message: "Employee profile not found" });

      await db.insert(schema.employeePermissionRequests).values({
        organizationId: input.organizationId,
        branchId: input.branchId,
        employeeProfileId: profile.id,
        requestType: input.requestType,
        requestDate: input.requestDate,
        startTime: input.startTime,
        endTime: input.endTime,
        status: "submitted",
        reasonEncrypted: input.reason
      });

      await emitManagerNotification(db, {
        organizationId: input.organizationId,
        branchId: input.branchId,
        severity: "info",
        title: "طلب استئذان جديد",
        body: `قام الموظف ${profile.employeeNumber} بتقديم طلب استئذان ${input.requestType}.`,
        createdByUserId: ctx.user.id
      });

      return { success: true };
    }),

  approveRequest: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      requestId: z.number(),
      type: z.enum(["leave", "permission"]),
      approve: z.boolean()
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const canManage = await checkCapability(db, ctx.user.id, input.organizationId, "manage_payroll");
      if (!canManage) throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });

      const status = input.approve ? "approved" : "rejected";
      
      await db.transaction(async (tx) => {
        if (input.type === "leave") {
          const request = (await tx.select().from(schema.employeeLeaveRequests)
            .where(and(eq(schema.employeeLeaveRequests.id, input.requestId), eq(schema.employeeLeaveRequests.organizationId, input.organizationId)))
            .limit(1))[0];
          
          if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "طلب الإجازة غير موجود." });
          if (request.status !== "submitted") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "لا يمكن تعديل طلب تمت معالجته بالفعل." });

          await tx.update(schema.employeeLeaveRequests)
            .set({ status, decidedByUserId: ctx.user.id, decidedAt: new Date() })
            .where(eq(schema.employeeLeaveRequests.id, input.requestId));
        } else {
          const request = (await tx.select().from(schema.employeePermissionRequests)
            .where(and(eq(schema.employeePermissionRequests.id, input.requestId), eq(schema.employeePermissionRequests.organizationId, input.organizationId)))
            .limit(1))[0];
          
          if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "طلب الاستئذان غير موجود." });
          if (request.status !== "submitted") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "لا يمكن تعديل طلب تمت معالجته بالفعل." });

          await tx.update(schema.employeePermissionRequests)
            .set({ status, decidedByUserId: ctx.user.id, decidedAt: new Date() })
            .where(eq(schema.employeePermissionRequests.id, input.requestId));
        }

        await writeDetailedAudit(tx, {
          userId: ctx.user.id,
          organizationId: input.organizationId,
          action: `employee_${input.type}_${status}`,
          entityType: `employee_${input.type}_request`,
          entityId: input.requestId
        });
      });

      return { success: true };
    })
});


import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, between, sql } from "drizzle-orm";
import * as schema from "../../drizzle/schema";
import { getDb } from "../db";
import { checkCapability } from "../domain/organization-access";
import { calculateAttendanceMetrics, calculateDeductions } from "../domain/payroll-policy";

export const payrollRouter = router({
  getShift: protectedProcedure
    .input(z.object({ organizationId: z.number(), employeeProfileId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const shifts = await db.select().from(schema.employeeShifts).where(
        and(
          eq(schema.employeeShifts.organizationId, input.organizationId),
          eq(schema.employeeShifts.employeeProfileId, input.employeeProfileId)
        )
      );
      return shifts;
    }),

  saveShift: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      employeeProfileId: z.number(),
      branchId: z.number(),
      dayOfWeek: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
      startTime: z.string(),
      endTime: z.string(),
      gracePeriodMinutes: z.number().default(15)
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const canManage = await checkCapability(db, ctx.user.id, input.organizationId, "manage_payroll");
      if (!canManage) throw new TRPCError({ code: "FORBIDDEN", message: "غير مصرح لك بإدارة نوبات العمل." });

      await db.insert(schema.employeeShifts).values({
        organizationId: input.organizationId,
        branchId: input.branchId,
        employeeProfileId: input.employeeProfileId,
        dayOfWeek: input.dayOfWeek,
        startTime: input.startTime,
        endTime: input.endTime,
        gracePeriodMinutes: input.gracePeriodMinutes
      }).onDuplicateKeyUpdate({
        set: {
          startTime: sql`VALUES(startTime)`,
          endTime: sql`VALUES(endTime)`,
          gracePeriodMinutes: sql`VALUES(gracePeriodMinutes)`
        }
      });

      return { success: true };
    }),

  generatePayrollReport: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      branchId: z.number().optional(),
      startDate: z.date(),
      endDate: z.date()
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const canView = await checkCapability(db, ctx.user.id, input.organizationId, "view_reports");
      if (!canView) throw new TRPCError({ code: "FORBIDDEN", message: "غير مصرح لك بعرض تقارير الرواتب." });

      // Fetch all attendance for the period
      const attendance = await db.select().from(schema.employeeAttendance).where(
        and(
          eq(schema.employeeAttendance.organizationId, input.organizationId),
          input.branchId ? eq(schema.employeeAttendance.branchId, input.branchId) : undefined,
          between(schema.employeeAttendance.workDate, input.startDate, input.endDate)
        )
      );

      // Group by employee and calculate metrics
      const results = await Promise.all(attendance.map(async a => {
        // Find shift for this employee
        const shift = (await db.select().from(schema.employeeShifts).where(
          and(
            eq(schema.employeeShifts.organizationId, input.organizationId),
            eq(schema.employeeShifts.employeeProfileId, a.employeeProfileId)
          )
        ).limit(1))[0];

        if (!shift || !a.checkInAt) return { ...a, metrics: null, deductions: 0 };

        const metrics = calculateAttendanceMetrics(
          a.checkInAt,
          a.checkOutAt,
          shift.startTime,
          shift.endTime,
          shift.gracePeriodMinutes
        );
        
        const deductions = await calculateDeductions(input.organizationId, metrics, a.status);

        return {
          ...a,
          metrics,
          deductions
        };
      }));

      return results;
    })
});

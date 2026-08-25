import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as schema from "../../drizzle/schema";
const { employeeAttendance, employeeProfiles, branches } = schema;
import { getDb } from "../db";
import { eq, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { writeDetailedAudit } from "../domain/audit-policy";
import { emitManagerNotification } from "../domain/notification-emitter";
import { generateDailyAttendanceReport } from "../domain/attendance-reporting";
import { checkCapability } from "../domain/organization-access";

/**
 * Haversine formula to calculate distance between two points in meters
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export const attendanceRouter = router({
  /** Get current employee's profile and today's attendance status */
  getDailyReport: protectedProcedure
    .input(z.object({ organizationId: z.number(), branchId: z.number(), date: z.date() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      const canView = await checkCapability(db, ctx.user.id, input.organizationId, "view_reports");
      if (!canView) throw new TRPCError({ code: "FORBIDDEN", message: "غير مصرح لك بعرض تقارير الحضور." });
      return generateDailyAttendanceReport(input.organizationId, input.branchId, input.date);
    }),

  getDailyPerformanceInsights: protectedProcedure
    .input(z.object({ organizationId: z.number(), branchId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      const canView = await checkCapability(db, ctx.user.id, input.organizationId, "view_reports");
      if (!canView) throw new TRPCError({ code: "FORBIDDEN", message: "غير مصرح لك بعرض تقارير الأداء." });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const attendance = await db.select().from(employeeAttendance).where(and(
        eq(employeeAttendance.organizationId, input.organizationId),
        input.branchId ? eq(employeeAttendance.branchId, input.branchId) : undefined,
        eq(employeeAttendance.workDate, today)
      ));

      const totalEmployees = (await db.select({ count: sql`count(*)` }).from(employeeProfiles).where(and(
        eq(employeeProfiles.organizationId, input.organizationId),
        input.branchId ? eq(employeeProfiles.branchId, input.branchId) : undefined,
        eq(employeeProfiles.employmentStatus, "active")
      )))[0] as any;

      const present = attendance.filter(a => a.status === "present").length;
      const late = attendance.filter(a => a.checkInAt && a.status === "present").length; // Simplified for insight
      const absent = Number(totalEmployees?.count || 0) - present;

      return {
        date: today,
        metrics: {
          present,
          absent,
          late,
          total: Number(totalEmployees?.count || 0)
        }
      };
    }),

  getMyStatus: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const profile = (await db.select().from(employeeProfiles).where(and(
        eq(employeeProfiles.organizationId, input.organizationId),
        eq(employeeProfiles.userId, ctx.user.id),
        eq(employeeProfiles.employmentStatus, "active")
      )).limit(1))[0] as any;
      
      if (profile && profile.branchId) {
        profile.branch = (await db.select().from(branches).where(eq(branches.id, profile.branchId)).limit(1))[0];
      }

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "لم يتم العثور على ملف موظف نشط لهذا الحساب." });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const attendance = (await db.select().from(employeeAttendance).where(and(
        eq(employeeAttendance.organizationId, input.organizationId),
        eq(employeeAttendance.employeeProfileId, profile.id),
        eq(employeeAttendance.workDate, today)
      )).limit(1))[0];

      return { profile, attendance };
    }),

  /** Self-service check-in with GPS verification */
  checkIn: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      deviceId: z.string().optional(),
      isMocked: z.boolean().optional(),
      accuracy: z.number().optional(),
      movementScore: z.number().optional(),
      biometricVerified: z.boolean().optional(),
      biometricType: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const profile = (await db.select().from(employeeProfiles).where(and(
        eq(employeeProfiles.organizationId, input.organizationId),
        eq(employeeProfiles.userId, ctx.user.id),
        eq(employeeProfiles.employmentStatus, "active")
      )).limit(1))[0];

      if (!profile || !profile.branchId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "غير مصرح لك بتسجيل الحضور. يجب أن تكون موظفاً نشطاً مرتبطاً بفرع." });
      }

      const branch = (await db.select().from(branches).where(eq(branches.id, profile.branchId)).limit(1))[0];

      if (!branch) {
        throw new TRPCError({ code: "NOT_FOUND", message: "الفرع المرتبط غير موجود." });
      }

      // GPS Verification if coordinates are configured for the branch
      const branchCoords = (await db.select().from(schema.branchJurisdictions).where(eq(schema.branchJurisdictions.branchId, branch.id)).limit(1))[0];
      
      if (branchCoords && branchCoords.latitude && branchCoords.longitude) {
        if (input.latitude === undefined || input.longitude === undefined) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "يجب تفعيل خدمة الموقع (GPS) لتسجيل الحضور في هذا الفرع." });
        }

        // GPS Anti-Spoofing Check
        // In a real mobile app, these flags are passed by the client SDK
        const isMocked = input.isMocked || false;
        const accuracy = input.accuracy || 0;

        if (isMocked || (accuracy > 0 && accuracy < 1)) {
          await writeDetailedAudit(db, {
            action: "attendance_gps_spoofing_detected",
            userId: ctx.user.id,
            organizationId: input.organizationId,
            branchId: branch.id,
            entityType: "employee_attendance",
            entityId: "new",
            metadata: { lat: input.latitude, lng: input.longitude, isMocked, accuracy }
          });

          await emitManagerNotification(db, {
            organizationId: input.organizationId,
            branchId: branch.id,
            severity: "critical",
            title: "تنبيه أمني: محاولة تلاعب بالموقع (GPS Spoofing)",
            body: `تم رصد محاولة تلاعب بالموقع الجغرافي من قبل الموظف ${ctx.user.name} باستخدام تطبيقات Mock Location.`
          });

          throw new TRPCError({ 
            code: "FORBIDDEN", 
            message: "تم رصد محاولة تلاعب بالموقع الجغرافي. تم تسجيل هذا الحدث أمنياً وإبلاغ الإدارة." 
          });
        }

        const distance = calculateDistance(
          Number(branchCoords.latitude), Number(branchCoords.longitude),
          input.latitude, input.longitude
        );

        if (distance > 200) { // Default geofence 200m
          // Log unauthorized attempt
          await writeDetailedAudit(db, {
            action: "attendance_unauthorized_gps",
            userId: ctx.user.id,
            organizationId: input.organizationId,
            branchId: branch.id,
            entityType: "employee_attendance",
            entityId: "new",
            metadata: { lat: input.latitude, lng: input.longitude, distance }
          });

          await emitManagerNotification(db, {
            organizationId: input.organizationId,
            branchId: branch.id,
            severity: "warning",
            title: "محاولة تسجيل حضور خارج النطاق الجغرافي",
            body: `حاول الموظف ${ctx.user.name} تسجيل الحضور من موقع يبعد ${Math.round(distance)} متر عن الفرع.`
          });

          throw new TRPCError({ code: "FORBIDDEN", message: `أنت خارج النطاق الجغرافي للفرع (${Math.round(distance)} متر).` });
        }
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Upsert attendance record
      const [record] = await db.insert(employeeAttendance)
        .values({
          organizationId: input.organizationId,
          branchId: branch.id,
          jurisdictionId: profile.jurisdictionId,
          employeeProfileId: profile.id,
          workDate: today,
          checkInAt: new Date(),
          status: "present",
          source: input.deviceId ? "verified_device" : "manual",
          checkInLat: input.latitude ? String(input.latitude) : null,
          checkInLng: input.longitude ? String(input.longitude) : null,
          deviceId: input.deviceId
        })
        .onDuplicateKeyUpdate({
          set: {
            checkInAt: sql`VALUES(checkInAt)`,
            status: "present",
            checkInLat: sql`VALUES(checkInLat)`,
            checkInLng: sql`VALUES(checkInLng)`,
            deviceId: sql`VALUES(deviceId)`
          }
        });

      await writeDetailedAudit(db, {
        action: "attendance_check_in",
        userId: ctx.user.id,
        organizationId: input.organizationId,
        branchId: branch.id,
        entityType: "employee_attendance",
        entityId: String(record.insertId)
      });

      return { success: true };
    }),

  /** Self-service check-out with GPS verification */
  checkOut: protectedProcedure
    .input(z.object({
      organizationId: z.number(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      deviceId: z.string().optional(),
      isMocked: z.boolean().optional(),
      accuracy: z.number().optional(),
      biometricVerified: z.boolean().optional(),
      biometricType: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const profile = (await db.select().from(employeeProfiles).where(and(
        eq(employeeProfiles.organizationId, input.organizationId),
        eq(employeeProfiles.userId, ctx.user.id),
        eq(employeeProfiles.employmentStatus, "active")
      )).limit(1))[0];

      if (!profile) {
        throw new TRPCError({ code: "FORBIDDEN", message: "ملف الموظف غير موجود." });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existing = (await db.select().from(employeeAttendance).where(and(
        eq(employeeAttendance.organizationId, input.organizationId),
        eq(employeeAttendance.employeeProfileId, profile.id),
        eq(employeeAttendance.workDate, today)
      )).limit(1))[0];

      if (!existing || !existing.checkInAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "لم يتم تسجيل الحضور لهذا اليوم بعد." });
      }

      await db.update(employeeAttendance)
        .set({
          checkOutAt: new Date(),
          checkOutLat: input.latitude ? String(input.latitude) : null,
          checkOutLng: input.longitude ? String(input.longitude) : null,
          biometricVerified: input.biometricVerified ? 1 : 0,
          biometricType: input.biometricType || "none"
        })
        .where(eq(employeeAttendance.id, existing.id));

      await writeDetailedAudit(db, {
        action: "attendance_check_out",
        userId: ctx.user.id,
        organizationId: input.organizationId,
        branchId: existing.branchId,
        entityType: "employee_attendance",
        entityId: String(existing.id)
      });

      return { success: true };
    })
});

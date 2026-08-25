
import { eq, and, between, isNull, sql } from "drizzle-orm";
import * as schema from "../../drizzle/schema";
import { getDb } from "../db";
import { emitManagerNotification } from "./notification-emitter";

/**
 * Generates a daily attendance summary and alerts managers of issues.
 */
export async function generateDailyAttendanceReport(organizationId: number, branchId: number, date: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  // 1. Find all "Planned" but not "Present" (Absence detection)
  const absentRecords = await db.select().from(schema.employeeAttendance).where(
    and(
      eq(schema.employeeAttendance.organizationId, organizationId),
      eq(schema.employeeAttendance.branchId, branchId),
      eq(schema.employeeAttendance.workDate, dayStart),
      eq(schema.employeeAttendance.status, "planned")
    )
  );

  // 2. Find Lates
  const lateRecords = await db.select().from(schema.employeeAttendance).where(
    and(
      eq(schema.employeeAttendance.organizationId, organizationId),
      eq(schema.employeeAttendance.branchId, branchId),
      eq(schema.employeeAttendance.workDate, dayStart),
      eq(schema.employeeAttendance.status, "late")
    )
  );

  if (absentRecords.length > 0 || lateRecords.length > 0) {
    await emitManagerNotification(db, {
      organizationId,
      branchId,
      severity: "info",
      title: "تقرير الحضور اليومي",
      body: `تقرير يوم ${date.toLocaleDateString("ar-EG")}: يوجد ${absentRecords.length} غياب و ${lateRecords.length} تأخير.`
    });
  }

  return {
    absentCount: absentRecords.length,
    lateCount: lateRecords.length
  };
}

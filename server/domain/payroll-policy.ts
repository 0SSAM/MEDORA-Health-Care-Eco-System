export type PayrollStatutoryProfile = {
  countryCode: string;
  effectiveFrom: string;
  currencyCode: string;
  taxRulesSourceUrl: string;
  socialInsuranceSourceUrl: string;
  employmentRulesSourceUrl: string;
  employerRegistrationVerified: boolean;
  acceptanceCriteriaVerified: boolean;
};

export function payrollReadiness(profile: PayrollStatutoryProfile | null) {
  if (!profile) return "BLOCKED" as const;
  const validCurrency = /^[A-Z]{3}$/.test(profile.currencyCode);
  const validDate = !Number.isNaN(Date.parse(profile.effectiveFrom));
  return profile.countryCode.length === 2 && validDate && validCurrency && Boolean(profile.taxRulesSourceUrl && profile.socialInsuranceSourceUrl && profile.employmentRulesSourceUrl && profile.employerRegistrationVerified && profile.acceptanceCriteriaVerified) ? "READY" as const : "BLOCKED" as const;
}

export function assertPayrollReady(profile: PayrollStatutoryProfile | null) {
  if (payrollReadiness(profile) !== "READY") throw new Error("Payroll statutory profile is not ready for activation");
  return true as const;
}

import { addMinutes, differenceInMinutes, format, parse } from "date-fns";

export interface AttendanceMetrics {
  workMinutes: number;
  lateMinutes: number;
  overtimeMinutes: number;
  isLate: boolean;
}

/**
 * Calculates work metrics for a single attendance record based on assigned shift.
 */
export function calculateAttendanceMetrics(
  checkIn: Date,
  checkOut: Date | null,
  shiftStart: string, // HH:mm
  shiftEnd: string,   // HH:mm
  gracePeriod: number
): AttendanceMetrics {
  const dateStr = format(checkIn, "yyyy-MM-dd");
  const plannedStart = parse(`${dateStr} ${shiftStart}`, "yyyy-MM-dd HH:mm", new Date());
  const plannedEnd = parse(`${dateStr} ${shiftEnd}`, "yyyy-MM-dd HH:mm", new Date());
  
  // Handle overnight shifts
  let actualPlannedEnd = plannedEnd;
  if (plannedEnd < plannedStart) {
    actualPlannedEnd = addMinutes(plannedEnd, 24 * 60);
  }

  const lateMinutes = Math.max(0, differenceInMinutes(checkIn, plannedStart));
  const isLate = lateMinutes > gracePeriod;

  let workMinutes = 0;
  let overtimeMinutes = 0;

  if (checkOut) {
    workMinutes = Math.max(0, differenceInMinutes(checkOut, checkIn));
    
    // Simple overtime calculation: anything beyond planned end
    if (checkOut > actualPlannedEnd) {
      overtimeMinutes = differenceInMinutes(checkOut, actualPlannedEnd);
    }
  }

  return {
    workMinutes,
    lateMinutes: isLate ? lateMinutes : 0,
    overtimeMinutes,
    isLate
  };
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

import { getDb } from "../db";
import * as schema from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Calculates financial deductions for an attendance record based on organization rules.
 */
export async function calculateDeductions(
  organizationId: number,
  metrics: AttendanceMetrics,
  status: string
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  let totalDeduction = 0;

  // 1. Lateness Deduction
  if (metrics.isLate && metrics.lateMinutes > 0) {
    const rule = (await db.select().from(schema.payrollDeductionRules).where(
      and(
        eq(schema.payrollDeductionRules.organizationId, organizationId),
        eq(schema.payrollDeductionRules.ruleType, "lateness"),
        eq(schema.payrollDeductionRules.active, 1)
      )
    ).limit(1))[0];
    
    if (rule) {
      const excessMinutes = Math.max(0, metrics.lateMinutes - (rule.thresholdMinutes || 0));
      if (excessMinutes > 0) {
        // Deduction = fixed amount per 30 min block of lateness as an example
        const blocks = Math.ceil(excessMinutes / 30);
        totalDeduction += Number(rule.fixedAmount || 0) * blocks;
      }
    }
  }

  // 2. Absence Deduction
  if (status === "absent") {
    const rule = (await db.select().from(schema.payrollDeductionRules).where(
      and(
        eq(schema.payrollDeductionRules.organizationId, organizationId),
        eq(schema.payrollDeductionRules.ruleType, "absence"),
        eq(schema.payrollDeductionRules.active, 1)
      )
    ).limit(1))[0];

    if (rule) {
      totalDeduction += Number(rule.fixedAmount || 0) * Number(rule.deductionMultiplier || 1);
    }
  }

  return totalDeduction;
}

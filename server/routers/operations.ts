// © 2024-2026 MEDORA Health Care Eco System. All rights reserved. Proprietary and confidential.
import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, inArray, lt, lte, notInArray, sql } from "drizzle-orm";
import { z } from "zod";
import { parse as parseCookie } from "cookie";
import { auditLogs, branches, branchAlerts, branchJurisdictions, branchUsers, cashClosures, crmLeads, customerCareCases, customerCareTasks, decisionLogs, employeeAttendance, employeeLeaveRequests, employeeProfiles, interBranchTransfers, inventoryBatches, organizationMemberships, organizationSlaPolicies, otherExpenses, procurementRequests, purchaseOrders, scheduledJobs } from "../../drizzle/schema";
import { getDb } from "../db";
import { hashAuditRecord } from "../domain/internal-auth";
import { canApproveWorkflow, canTransitionLead, canTransitionLeave, canTransitionProcurement, normalizedRequestNumber } from "../domain/operations-policy";
import { buildUnifiedReviewInbox, makeReviewInboxItem } from "../domain/unified-review-inbox";
import { protectedProcedure, router } from "../_core/trpc";
import { createHeartbeatJob, updateHeartbeatJob } from "../_core/heartbeat";
import { COOKIE_NAME } from "@shared/const";

type Database = NonNullable<Awaited<ReturnType<typeof getDb>>>;

const managementRoles = ["owner", "org_admin", "operations_manager"] as const;
const workflowRole = z.enum(["owner", "org_admin", "operations_manager", "staff", "auditor", "compliance_officer", "clinical_lead"]);

async function assertOrganizationAccess(db: Database, userId: number, systemRole: string, organizationId: number) {
  if (systemRole === "admin") return;
  const membership = await db.select({ id: organizationMemberships.id, organizationRole: organizationMemberships.organizationRole })
    .from(organizationMemberships)
    .where(and(eq(organizationMemberships.organizationId, organizationId), eq(organizationMemberships.userId, userId), eq(organizationMemberships.active, 1)))
    .limit(1);
  if (!membership.length) throw new TRPCError({ code: "FORBIDDEN", message: "Organization is outside the active scope" });
}

async function assertBranchAccess(db: Database, userId: number, systemRole: string, organizationId: number, branchId: number, jurisdictionId?: number | null) {
  const branch = await db.select({ id: branches.id }).from(branches).where(and(eq(branches.id, branchId), eq(branches.organizationId, organizationId), eq(branches.active, 1))).limit(1);
  if (!branch.length) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Branch is not active for the selected organization" });
  if (systemRole !== "admin") {
    const membership = await db.select({ id: branchUsers.id }).from(branchUsers).where(and(eq(branchUsers.branchId, branchId), eq(branchUsers.userId, userId), eq(branchUsers.active, 1))).limit(1);
    if (!membership.length) throw new TRPCError({ code: "FORBIDDEN", message: "Branch is outside the active scope" });
  }
  if (jurisdictionId !== undefined && jurisdictionId !== null) {
    const assignment = await db.select({ id: branchJurisdictions.id }).from(branchJurisdictions).where(and(eq(branchJurisdictions.branchId, branchId), eq(branchJurisdictions.jurisdictionId, jurisdictionId))).limit(1);
    if (!assignment.length) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Jurisdiction is not assigned to the active branch" });
  }
}

async function assertManagementAccess(db: Database, userId: number, systemRole: string, organizationId: number) {
  await assertOrganizationAccess(db, userId, systemRole, organizationId);
  if (systemRole === "admin") return;
  const membership = await db.select({ id: organizationMemberships.id }).from(organizationMemberships)
    .where(and(eq(organizationMemberships.organizationId, organizationId), eq(organizationMemberships.userId, userId), eq(organizationMemberships.active, 1), inArray(organizationMemberships.organizationRole, [...managementRoles])))
    .limit(1);
  if (!membership.length) throw new TRPCError({ code: "FORBIDDEN", message: "Organization management access is required" });
}

async function writeAudit(db: Database, input: { userId: number; organizationId: number; branchId?: number | null; jurisdictionId?: number | null; action: string; entityType: string; entityId: string | number }) {
  const previous = await db.select({ recordHash: auditLogs.recordHash }).from(auditLogs)
    .where(and(
      eq(auditLogs.organizationId, input.organizationId),
      input.branchId !== undefined && input.branchId !== null ? eq(auditLogs.branchId, input.branchId) : undefined,
      input.jurisdictionId !== undefined && input.jurisdictionId !== null ? eq(auditLogs.jurisdictionId, input.jurisdictionId) : undefined,
    ))
    .orderBy(desc(auditLogs.id)).limit(1);
  const createdAt = new Date().toISOString();
  const recordHash = hashAuditRecord({ eventType: input.action, userId: input.userId, organizationId: input.organizationId, branchId: input.branchId ?? null, jurisdictionId: input.jurisdictionId ?? null, requestId: `${input.entityType}:${input.entityId}`, createdAt });
  await db.insert(auditLogs).values({ userId: input.userId, organizationId: input.organizationId, branchId: input.branchId ?? null, jurisdictionId: input.jurisdictionId ?? null, action: input.action, entityType: input.entityType, entityId: String(input.entityId), previousHash: previous[0]?.recordHash ?? null, recordHash });
}

const organizationScope = z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive().optional(), jurisdictionId: z.number().int().nonnegative().optional() });
const selfServiceScope = z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive(), jurisdictionId: z.number().int().nonnegative() });
const managementScope = z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive(), jurisdictionId: z.number().int().nonnegative() });
const contentProtectionRiskType = z.enum(["visibility-change", "window-blur", "page-lifecycle", "print", "print-shortcut", "capture-shortcut", "copy", "context-menu"]);
const contentProtectionAuditScope = selfServiceScope.extend({
  riskType: contentProtectionRiskType,
  occurredAt: z.coerce.date(),
});
const decisionEntityType = z.enum(["inventory_batch", "branch_alert", "purchase_order", "customer_care_case", "customer_care_task", "procurement_request", "inter_branch_transfer"]);
const inventoryAutomationCron = z.enum(["0 0 */6 * * *", "0 0 6 * * *", "0 0 0 * * *"]);
const inventoryWorkflowKey = "inventory_alert_scan";
const slaPolicyValues = z.object({
  procurementTargetHours: z.number().int().min(1).max(720),
  customerCareTargetHours: z.number().int().min(1).max(720),
  escalationGraceHours: z.number().int().min(1).max(720),
  escalationEnabled: z.boolean(),
});

async function assertOptionalBranchScope(db: Database, userId: number, systemRole: string, input: { organizationId: number; branchId?: number; jurisdictionId?: number }) {
  if (input.jurisdictionId !== undefined && input.branchId === undefined) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Branch scope is required when jurisdiction scope is selected" });
  }
  if (input.branchId !== undefined) await assertBranchAccess(db, userId, systemRole, input.organizationId, input.branchId, input.jurisdictionId);
}

function optionalJurisdictionFilter<T>(column: T, jurisdictionId?: number) {
  return jurisdictionId !== undefined ? eq(column as any, jurisdictionId) : undefined;
}

async function assertScopedManagementAccess(db: Database, userId: number, systemRole: string, input: z.infer<typeof managementScope>) {
  await assertManagementAccess(db, userId, systemRole, input.organizationId);
  await assertBranchAccess(db, userId, systemRole, input.organizationId, input.branchId, input.jurisdictionId);
}

async function assertDecisionEntityInScope(db: Database, input: z.infer<typeof managementScope> & { entityType: z.infer<typeof decisionEntityType>; entityId: number }) {
  const inventoryScope = and(eq(inventoryBatches.organizationId, input.organizationId), eq(inventoryBatches.branchId, input.branchId), eq(inventoryBatches.jurisdictionId, input.jurisdictionId));
  let exists = false;

  switch (input.entityType) {
    case "inventory_batch":
      exists = Boolean((await db.select({ id: inventoryBatches.id }).from(inventoryBatches).where(and(eq(inventoryBatches.id, input.entityId), inventoryScope)).limit(1))[0]);
      break;
    case "branch_alert":
      exists = Boolean((await db.select({ id: branchAlerts.id }).from(branchAlerts).innerJoin(inventoryBatches, eq(branchAlerts.inventoryBatchId, inventoryBatches.id)).where(and(eq(branchAlerts.id, input.entityId), eq(branchAlerts.organizationId, input.organizationId), eq(branchAlerts.branchId, input.branchId), inventoryScope)).limit(1))[0]);
      break;
    case "purchase_order":
      exists = Boolean((await db.select({ id: purchaseOrders.id }).from(purchaseOrders).where(and(eq(purchaseOrders.id, input.entityId), eq(purchaseOrders.organizationId, input.organizationId), eq(purchaseOrders.branchId, input.branchId), eq(purchaseOrders.jurisdictionId, input.jurisdictionId))).limit(1))[0]);
      break;
    case "customer_care_case":
      exists = Boolean((await db.select({ id: customerCareCases.id }).from(customerCareCases).where(and(eq(customerCareCases.id, input.entityId), eq(customerCareCases.organizationId, input.organizationId), eq(customerCareCases.branchId, input.branchId), eq(customerCareCases.jurisdictionId, input.jurisdictionId))).limit(1))[0]);
      break;
    case "customer_care_task":
      exists = Boolean((await db.select({ id: customerCareTasks.id }).from(customerCareTasks).innerJoin(customerCareCases, eq(customerCareTasks.caseId, customerCareCases.id)).where(and(eq(customerCareTasks.id, input.entityId), eq(customerCareTasks.organizationId, input.organizationId), eq(customerCareTasks.branchId, input.branchId), eq(customerCareCases.organizationId, input.organizationId), eq(customerCareCases.branchId, input.branchId), eq(customerCareCases.jurisdictionId, input.jurisdictionId))).limit(1))[0]);
      break;
    case "procurement_request":
      exists = Boolean((await db.select({ id: procurementRequests.id }).from(procurementRequests).where(and(eq(procurementRequests.id, input.entityId), eq(procurementRequests.organizationId, input.organizationId), eq(procurementRequests.branchId, input.branchId), eq(procurementRequests.jurisdictionId, input.jurisdictionId))).limit(1))[0]);
      break;
    case "inter_branch_transfer":
      exists = Boolean((await db.select({ id: interBranchTransfers.id }).from(interBranchTransfers).where(and(eq(interBranchTransfers.id, input.entityId), eq(interBranchTransfers.organizationId, input.organizationId), eq(interBranchTransfers.sourceBranchId, input.branchId), eq(interBranchTransfers.jurisdictionId, input.jurisdictionId))).limit(1))[0]);
      break;
  }

  if (!exists) throw new TRPCError({ code: "NOT_FOUND", message: "Decision target is not available in the active scope" });
}

async function resolveOwnedEmployeeProfile(db: Database, userId: number, input: z.infer<typeof selfServiceScope>) {
  // Self-service deliberately does not inherit the global-system-admin bypass.
  // The caller must hold active organization and branch membership for this exact scope.
  await assertOrganizationAccess(db, userId, "user", input.organizationId);
  await assertBranchAccess(db, userId, "user", input.organizationId, input.branchId, input.jurisdictionId);
  const employee = (await db.select().from(employeeProfiles).where(and(
    eq(employeeProfiles.organizationId, input.organizationId),
    eq(employeeProfiles.branchId, input.branchId),
    eq(employeeProfiles.jurisdictionId, input.jurisdictionId),
    eq(employeeProfiles.userId, userId),
  )).limit(1))[0];
  if (!employee) throw new TRPCError({ code: "NOT_FOUND", message: "Employee profile is not available in the active scope" });
  return employee;
}

export const operationsRouter = router({
  logCaptureRisk: protectedProcedure.input(contentProtectionAuditScope).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    // The client timestamp is checked only for event integrity. The durable event time is
    // the database receipt time; no clipboard content, screenshots, typed text, or device
    // fingerprint is accepted or persisted by this procedure.
    if (input.occurredAt.getTime() > Date.now() + 5 * 60_000) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Capture-risk event cannot be in the future" });
    }
    await assertOrganizationAccess(db, ctx.user.id, ctx.user.role, input.organizationId);
    await assertBranchAccess(db, ctx.user.id, ctx.user.role, input.organizationId, input.branchId, input.jurisdictionId);
    await writeAudit(db, {
      userId: ctx.user.id,
      organizationId: input.organizationId,
      branchId: input.branchId,
      jurisdictionId: input.jurisdictionId,
      action: `content_protection_${input.riskType.replaceAll("-", "_")}`,
      entityType: "content_protection",
      entityId: input.riskType,
    });
    return { ok: true as const };
  }),
  selfService: router({
    myProfile: protectedProcedure.input(selfServiceScope).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      return resolveOwnedEmployeeProfile(db, ctx.user.id, input);
    }),
    myAttendance: protectedProcedure.input(selfServiceScope.extend({ startsAt: z.coerce.date(), endsAt: z.coerce.date() })).query(async ({ ctx, input }) => {
      if (input.endsAt < input.startsAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Attendance end date must follow the start date" });
      if (input.endsAt.getTime() - input.startsAt.getTime() > 366 * 86_400_000) throw new TRPCError({ code: "BAD_REQUEST", message: "Attendance range must not exceed 366 days" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const employee = await resolveOwnedEmployeeProfile(db, ctx.user.id, input);
      return db.select().from(employeeAttendance).where(and(
        eq(employeeAttendance.organizationId, input.organizationId),
        eq(employeeAttendance.branchId, input.branchId),
        eq(employeeAttendance.jurisdictionId, input.jurisdictionId),
        eq(employeeAttendance.employeeProfileId, employee.id),
        gte(employeeAttendance.workDate, input.startsAt),
        lte(employeeAttendance.workDate, input.endsAt),
      )).orderBy(desc(employeeAttendance.workDate)).limit(366);
    }),
    myLeaveRequests: protectedProcedure.input(selfServiceScope).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const employee = await resolveOwnedEmployeeProfile(db, ctx.user.id, input);
      return db.select().from(employeeLeaveRequests).where(and(
        eq(employeeLeaveRequests.organizationId, input.organizationId),
        eq(employeeLeaveRequests.branchId, input.branchId),
        eq(employeeLeaveRequests.jurisdictionId, input.jurisdictionId),
        eq(employeeLeaveRequests.employeeProfileId, employee.id),
      )).orderBy(desc(employeeLeaveRequests.createdAt)).limit(100);
    }),
    submitLeaveRequest: protectedProcedure.input(selfServiceScope.extend({ leaveType: z.enum(["annual", "sick", "emergency", "unpaid", "other"]), startsAt: z.coerce.date(), endsAt: z.coerce.date() })).mutation(async ({ ctx, input }) => {
      if (input.endsAt < input.startsAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Leave end date must follow the start date" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const employee = await resolveOwnedEmployeeProfile(db, ctx.user.id, input);
      if (!["onboarding", "active", "on_leave"].includes(employee.employmentStatus)) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Employee status does not permit a self-service leave request" });
      const result = await db.insert(employeeLeaveRequests).values({
        organizationId: input.organizationId,
        branchId: input.branchId,
        jurisdictionId: input.jurisdictionId,
        employeeProfileId: employee.id,
        leaveType: input.leaveType,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        status: "submitted",
        createdByUserId: ctx.user.id,
      });
      const leaveRequestId = Number(result[0].insertId);
      await writeAudit(db, { userId: ctx.user.id, organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, action: "self_service_leave_request_submitted", entityType: "leave_request", entityId: leaveRequestId });
      return { leaveRequestId, status: "submitted" as const };
    }),
    cancelLeaveRequest: protectedProcedure.input(selfServiceScope.extend({ leaveRequestId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const employee = await resolveOwnedEmployeeProfile(db, ctx.user.id, input);
      const leave = (await db.select().from(employeeLeaveRequests).where(and(
        eq(employeeLeaveRequests.id, input.leaveRequestId),
        eq(employeeLeaveRequests.organizationId, input.organizationId),
        eq(employeeLeaveRequests.branchId, input.branchId),
        eq(employeeLeaveRequests.jurisdictionId, input.jurisdictionId),
        eq(employeeLeaveRequests.employeeProfileId, employee.id),
      )).limit(1))[0];
      if (!leave) throw new TRPCError({ code: "NOT_FOUND", message: "Leave request is not available in the active scope" });
      if (leave.status !== "submitted") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Only submitted leave requests can be cancelled by the employee" });
      await db.update(employeeLeaveRequests).set({ status: "cancelled" }).where(and(eq(employeeLeaveRequests.id, leave.id), eq(employeeLeaveRequests.status, "submitted")));
      await writeAudit(db, { userId: ctx.user.id, organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, action: "self_service_leave_request_cancelled", entityType: "leave_request", entityId: leave.id });
      return { leaveRequestId: leave.id, status: "cancelled" as const };
    }),
  }),
  manager: router({
    inventorySignals: protectedProcedure.input(managementScope).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await assertScopedManagementAccess(db, ctx.user.id, ctx.user.role, input);

      const batchScope = and(
        eq(inventoryBatches.organizationId, input.organizationId),
        eq(inventoryBatches.branchId, input.branchId),
        eq(inventoryBatches.jurisdictionId, input.jurisdictionId),
      );
      const [lowStock, queuedAlerts] = await Promise.all([
        db.select({
          batchId: inventoryBatches.id,
          productId: inventoryBatches.productId,
          quantityOnHand: inventoryBatches.quantityOnHand,
          reorderPoint: inventoryBatches.reorderPoint,
          expiryDate: inventoryBatches.expiryDate,
          updatedAt: inventoryBatches.updatedAt,
        }).from(inventoryBatches).where(and(batchScope, sql`${inventoryBatches.quantityOnHand} <= ${inventoryBatches.reorderPoint}`)).orderBy(desc(inventoryBatches.updatedAt)).limit(100),
        db.select({
          alertId: branchAlerts.id,
          alertType: branchAlerts.alertType,
          alertDate: branchAlerts.alertDate,
          batchId: inventoryBatches.id,
          productId: inventoryBatches.productId,
          quantityOnHand: inventoryBatches.quantityOnHand,
          reorderPoint: inventoryBatches.reorderPoint,
          expiryDate: inventoryBatches.expiryDate,
        }).from(branchAlerts).innerJoin(inventoryBatches, eq(branchAlerts.inventoryBatchId, inventoryBatches.id)).where(and(
          eq(branchAlerts.branchId, input.branchId),
          eq(branchAlerts.managerUserId, ctx.user.id),
          eq(branchAlerts.status, "queued"),
          inArray(branchAlerts.alertType, ["reorder", "expiry"]),
          batchScope,
        )).orderBy(desc(branchAlerts.alertDate)).limit(100),
      ]);

      const signals = [
        ...lowStock.map(item => ({ type: "low_stock" as const, alertId: null, alertType: null, observedAt: item.updatedAt, ...item })),
        ...queuedAlerts.map(item => ({ type: "queued_alert" as const, observedAt: item.alertDate, ...item })),
      ].sort((left, right) => right.observedAt.getTime() - left.observedAt.getTime());

      return { lowStockCount: lowStock.length, queuedAlertCount: queuedAlerts.length, signals };
    }),
    slaIndicators: protectedProcedure.input(managementScope).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await assertScopedManagementAccess(db, ctx.user.id, ctx.user.role, input);

      const now = new Date();
      const configuredPolicy = (await db.select().from(organizationSlaPolicies).where(eq(organizationSlaPolicies.organizationId, input.organizationId)).limit(1))[0];
      const procurementTargetHours = configuredPolicy?.procurementTargetHours ?? 48;
      const customerServiceTargetHours = configuredPolicy?.customerCareTargetHours ?? 24;
      const escalationGraceHours = configuredPolicy?.escalationGraceHours ?? 24;
      const escalationEnabled = configuredPolicy?.escalationEnabled !== 0;
      const procurementCutoff = new Date(now.getTime() - procurementTargetHours * 60 * 60 * 1000);
      const customerServiceCutoff = new Date(now.getTime() - customerServiceTargetHours * 60 * 60 * 1000);
      const [openOrders, openCases, openTasks] = await Promise.all([
        db.select({ id: purchaseOrders.id, createdAt: purchaseOrders.createdAt }).from(purchaseOrders).where(and(
          eq(purchaseOrders.organizationId, input.organizationId),
          eq(purchaseOrders.branchId, input.branchId),
          eq(purchaseOrders.jurisdictionId, input.jurisdictionId),
          notInArray(purchaseOrders.status, ["received", "cancelled"]),
        )).limit(500),
        db.select({ id: customerCareCases.id, createdAt: customerCareCases.createdAt }).from(customerCareCases).where(and(
          eq(customerCareCases.organizationId, input.organizationId),
          eq(customerCareCases.branchId, input.branchId),
          eq(customerCareCases.jurisdictionId, input.jurisdictionId),
          notInArray(customerCareCases.status, ["resolved", "closed"]),
        )).limit(500),
        db.select({ id: customerCareTasks.id, createdAt: customerCareTasks.createdAt, dueAt: customerCareTasks.dueAt }).from(customerCareTasks).innerJoin(customerCareCases, eq(customerCareTasks.caseId, customerCareCases.id)).where(and(
          eq(customerCareTasks.organizationId, input.organizationId),
          eq(customerCareTasks.branchId, input.branchId),
          eq(customerCareCases.organizationId, input.organizationId),
          eq(customerCareCases.branchId, input.branchId),
          eq(customerCareCases.jurisdictionId, input.jurisdictionId),
          notInArray(customerCareTasks.status, ["done", "cancelled"]),
        )).limit(500),
      ]);

      const procurementOverdue = openOrders.filter(order => order.createdAt < procurementCutoff).length;
      const caseBreaches = openCases.filter(item => item.createdAt < customerServiceCutoff).length;
      const taskBreaches = openTasks.filter(item => (item.dueAt ?? new Date(item.createdAt.getTime() + customerServiceTargetHours * 60 * 60 * 1000)) < now).length;
      const countEscalations = (items: Array<{ createdAt: Date }>, targetHours: number) => {
        if (!escalationEnabled) return { attention: 0, persistent: 0 };
        const attentionCutoff = new Date(now.getTime() - (targetHours + escalationGraceHours) * 60 * 60 * 1000);
        const persistentCutoff = new Date(now.getTime() - (targetHours + escalationGraceHours * 2) * 60 * 60 * 1000);
        return { attention: items.filter(item => item.createdAt < attentionCutoff && item.createdAt >= persistentCutoff).length, persistent: items.filter(item => item.createdAt < persistentCutoff).length };
      };
      const procurementEscalations = countEscalations(openOrders, procurementTargetHours);
      const caseEscalations = countEscalations(openCases, customerServiceTargetHours);
      const taskEscalations = escalationEnabled ? openTasks.reduce((counts, task) => {
        const taskDueAt = task.dueAt ?? new Date(task.createdAt.getTime() + customerServiceTargetHours * 60 * 60 * 1000);
        const attentionCutoff = new Date(now.getTime() - escalationGraceHours * 60 * 60 * 1000);
        const persistentCutoff = new Date(now.getTime() - escalationGraceHours * 2 * 60 * 60 * 1000);
        if (taskDueAt < persistentCutoff) counts.persistent += 1;
        else if (taskDueAt < attentionCutoff) counts.attention += 1;
        return counts;
      }, { attention: 0, persistent: 0 }) : { attention: 0, persistent: 0 };

      return {
        evaluatedAt: now,
        policy: { configured: Boolean(configuredPolicy), procurementTargetHours, customerCareTargetHours: customerServiceTargetHours, escalationGraceHours, escalationEnabled },
        procurement: { targetHours: procurementTargetHours, overdue: procurementOverdue, onTrack: openOrders.length - procurementOverdue, escalation: procurementEscalations },
        customerService: {
          targetHours: customerServiceTargetHours,
          breached: caseBreaches + taskBreaches,
          compliant: openCases.length + openTasks.length - caseBreaches - taskBreaches,
          cases: { breached: caseBreaches, compliant: openCases.length - caseBreaches },
          tasks: { breached: taskBreaches, compliant: openTasks.length - taskBreaches },
          escalation: { attention: caseEscalations.attention + taskEscalations.attention, persistent: caseEscalations.persistent + taskEscalations.persistent },
        },
      };
    }),
    slaPolicy: protectedProcedure.input(managementScope).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await assertScopedManagementAccess(db, ctx.user.id, ctx.user.role, input);
      const policy = (await db.select().from(organizationSlaPolicies).where(eq(organizationSlaPolicies.organizationId, input.organizationId)).limit(1))[0];
      return { configured: Boolean(policy), procurementTargetHours: policy?.procurementTargetHours ?? 48, customerCareTargetHours: policy?.customerCareTargetHours ?? 24, escalationGraceHours: policy?.escalationGraceHours ?? 24, escalationEnabled: policy?.escalationEnabled !== 0, updatedAt: policy?.updatedAt ?? null };
    }),
    updateSlaPolicy: protectedProcedure.input(managementScope.extend(slaPolicyValues.shape)).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await assertScopedManagementAccess(db, ctx.user.id, ctx.user.role, input);
      const existing = (await db.select({ id: organizationSlaPolicies.id }).from(organizationSlaPolicies).where(eq(organizationSlaPolicies.organizationId, input.organizationId)).limit(1))[0];
      const values = { procurementTargetHours: input.procurementTargetHours, customerCareTargetHours: input.customerCareTargetHours, escalationGraceHours: input.escalationGraceHours, escalationEnabled: input.escalationEnabled ? 1 : 0, updatedByUserId: ctx.user.id };
      if (existing) await db.update(organizationSlaPolicies).set(values).where(eq(organizationSlaPolicies.id, existing.id));
      else await db.insert(organizationSlaPolicies).values({ organizationId: input.organizationId, ...values });
      await writeAudit(db, { userId: ctx.user.id, organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, action: "organization_sla_policy_updated", entityType: "organization_sla_policy", entityId: existing?.id ?? input.organizationId });
      return { updated: true as const };
    }),
    recordDecision: protectedProcedure.input(managementScope.extend({
      entityType: decisionEntityType,
      entityId: z.number().int().positive(),
      decision: z.enum(["approved", "rejected", "deferred"]),
      reason: z.string().trim().min(3).max(1000),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await assertScopedManagementAccess(db, ctx.user.id, ctx.user.role, input);
      await assertDecisionEntityInScope(db, input);

      const decidedAt = new Date();
      const decisionLogId = await db.transaction(async tx => {
        const inserted = await tx.insert(decisionLogs).values({
          organizationId: input.organizationId,
          branchId: input.branchId,
          jurisdictionId: input.jurisdictionId,
          entityType: input.entityType,
          entityId: input.entityId,
          decision: input.decision,
          reason: input.reason,
          decidedByUserId: ctx.user.id,
          decidedAt,
        });
        const id = Number(inserted[0].insertId);
        const previous = await tx.select({ recordHash: auditLogs.recordHash }).from(auditLogs).where(and(
          eq(auditLogs.organizationId, input.organizationId),
          eq(auditLogs.branchId, input.branchId),
        )).orderBy(desc(auditLogs.id)).limit(1);
        const createdAt = decidedAt.toISOString();
        const recordHash = hashAuditRecord({
          eventType: "manager_decision_recorded",
          userId: ctx.user.id,
          organizationId: input.organizationId,
          branchId: input.branchId,
          jurisdictionId: input.jurisdictionId,
          requestId: `decision_log:${id}`,
          createdAt,
        });
        await tx.insert(auditLogs).values({
          userId: ctx.user.id,
          organizationId: input.organizationId,
          branchId: input.branchId,
          action: "manager_decision_recorded",
          entityType: "decision_log",
          entityId: String(id),
          previousHash: previous[0]?.recordHash ?? null,
          recordHash,
        });
        return id;
      });
      return { decisionLogId, decision: input.decision, executed: false as const };
    }),
    decisionHistory: protectedProcedure.input(managementScope.extend({
      cursor: z.number().int().positive().optional(),
      limit: z.number().int().min(1).max(100).default(25),
    })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await assertScopedManagementAccess(db, ctx.user.id, ctx.user.role, input);
      const rows = await db.select().from(decisionLogs).where(and(
        eq(decisionLogs.organizationId, input.organizationId),
        eq(decisionLogs.branchId, input.branchId),
        eq(decisionLogs.jurisdictionId, input.jurisdictionId),
        input.cursor ? lt(decisionLogs.id, input.cursor) : undefined,
      )).orderBy(desc(decisionLogs.id)).limit(input.limit + 1);
      const hasMore = rows.length > input.limit;
      const items = rows.slice(0, input.limit);
      return { items, nextCursor: hasMore ? items.at(-1)?.id ?? null : null };
    }),
    inventoryAutomation: protectedProcedure.input(managementScope).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await assertScopedManagementAccess(db, ctx.user.id, ctx.user.role, input);
      const job = (await db.select().from(scheduledJobs).where(and(
        eq(scheduledJobs.organizationId, input.organizationId),
        eq(scheduledJobs.branchId, input.branchId),
        eq(scheduledJobs.jurisdictionId, input.jurisdictionId),
        eq(scheduledJobs.workflowKey, inventoryWorkflowKey),
      )).limit(1))[0];
      return job
        ? { configured: true as const, ...job, internalEventLog: "active" as const }
        : { configured: false as const, active: 0, cronExpression: "0 0 6 * * *", lastRunStatus: "never" as const, lastRunAt: null, lastRunEvaluatedCount: 0, lastRunQueuedCount: 0, lastErrorCode: null, automationFailureNotificationThreshold: 3, consecutiveFailureCount: 0, lastFailureNotificationCount: 0, lastInternalEventAt: null, lastInternalEventStatus: "never" as const, internalEventLog: "active" as const };
    }),
    configureInventoryAutomation: protectedProcedure.input(managementScope.extend({ active: z.boolean(), cronExpression: inventoryAutomationCron.default("0 0 6 * * *"), automationFailureNotificationThreshold: z.number().int().min(2).max(10).default(3) })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await assertScopedManagementAccess(db, ctx.user.id, ctx.user.role, input);
      const existing = (await db.select().from(scheduledJobs).where(and(
        eq(scheduledJobs.organizationId, input.organizationId),
        eq(scheduledJobs.branchId, input.branchId),
        eq(scheduledJobs.jurisdictionId, input.jurisdictionId),
        eq(scheduledJobs.workflowKey, inventoryWorkflowKey),
      )).limit(1))[0];
      const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
      if (!sessionToken) throw new TRPCError({ code: "UNAUTHORIZED", message: "A signed-in session is required to configure automation" });
      const callback = { cron: input.cronExpression, path: "/api/scheduled/inventory-alerts", payload: {}, description: `Scoped MEDORA inventory scan for organization ${input.organizationId}, branch ${input.branchId}, jurisdiction ${input.jurisdictionId}` };
      let jobId: number;
      let taskUid: string | null = existing?.scheduleCronTaskUid ?? null;
      let nextExecutionAt: string | null = null;
      if (existing) {
        jobId = existing.id;
        if (taskUid) {
          const updated = await updateHeartbeatJob(taskUid, { ...callback, enable: input.active }, sessionToken);
          nextExecutionAt = updated.nextExecutionAt ?? null;
        } else if (input.active) {
          const created = await createHeartbeatJob({ name: `medora-inventory-${existing.id}`, ...callback }, sessionToken);
          taskUid = created.taskUid;
          nextExecutionAt = created.nextExecutionAt ?? null;
        }
        await db.update(scheduledJobs).set({ cronExpression: input.cronExpression, active: input.active ? 1 : 0, scheduleCronTaskUid: taskUid, automationFailureNotificationThreshold: input.automationFailureNotificationThreshold }).where(eq(scheduledJobs.id, existing.id));
      } else {
        const inserted = await db.insert(scheduledJobs).values({ name: `inventory-alerts-${input.organizationId}-${input.branchId}-${input.jurisdictionId}`, workflowKey: inventoryWorkflowKey, organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, cronExpression: input.cronExpression, active: input.active ? 1 : 0, automationFailureNotificationThreshold: input.automationFailureNotificationThreshold, createdByUserId: ctx.user.id });
        jobId = Number(inserted[0].insertId);
        if (input.active) {
          const created = await createHeartbeatJob({ name: `medora-inventory-${jobId}`, ...callback }, sessionToken);
          taskUid = created.taskUid;
          nextExecutionAt = created.nextExecutionAt ?? null;
          await db.update(scheduledJobs).set({ scheduleCronTaskUid: taskUid }).where(eq(scheduledJobs.id, jobId));
        }
      }
      await writeAudit(db, { userId: ctx.user.id, organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, action: input.active ? "inventory_automation_enabled" : "inventory_automation_paused", entityType: "scheduled_job", entityId: jobId });
      return { jobId, active: input.active, internalEventLog: "active" as const, automationFailureNotificationThreshold: input.automationFailureNotificationThreshold, taskUid, nextExecutionAt, executed: false as const };
    }),
  }),
  reviewInbox: router({
    list: protectedProcedure.input(organizationScope.extend({ branchId: z.number().int().positive(), limit: z.number().int().min(1).max(100).default(50) })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await assertManagementAccess(db, ctx.user.id, ctx.user.role, input.organizationId);
      await assertBranchAccess(db, ctx.user.id, ctx.user.role, input.organizationId, input.branchId, input.jurisdictionId);
      const jurisdictionFilters = <T>(column: T) => optionalJurisdictionFilter(column, input.jurisdictionId);
      const [procurements, leaveRequests, closures, expenses, transfers] = await Promise.all([
        db.select({ id: procurementRequests.id, createdAt: procurementRequests.createdAt }).from(procurementRequests).where(and(eq(procurementRequests.organizationId, input.organizationId), eq(procurementRequests.branchId, input.branchId), jurisdictionFilters(procurementRequests.jurisdictionId), eq(procurementRequests.status, "submitted"))).orderBy(desc(procurementRequests.createdAt)).limit(input.limit),
        db.select({ id: employeeLeaveRequests.id, createdAt: employeeLeaveRequests.createdAt }).from(employeeLeaveRequests).where(and(eq(employeeLeaveRequests.organizationId, input.organizationId), eq(employeeLeaveRequests.branchId, input.branchId), jurisdictionFilters(employeeLeaveRequests.jurisdictionId), eq(employeeLeaveRequests.status, "submitted"))).orderBy(desc(employeeLeaveRequests.createdAt)).limit(input.limit),
        db.select({ id: cashClosures.id, createdAt: cashClosures.createdAt }).from(cashClosures).where(and(eq(cashClosures.organizationId, input.organizationId), eq(cashClosures.branchId, input.branchId), jurisdictionFilters(cashClosures.jurisdictionId), eq(cashClosures.status, "submitted"))).orderBy(desc(cashClosures.createdAt)).limit(input.limit),
        db.select({ id: otherExpenses.id, createdAt: otherExpenses.createdAt }).from(otherExpenses).where(and(eq(otherExpenses.organizationId, input.organizationId), eq(otherExpenses.branchId, input.branchId), jurisdictionFilters(otherExpenses.jurisdictionId), eq(otherExpenses.status, "pending_review"))).orderBy(desc(otherExpenses.createdAt)).limit(input.limit),
        db.select({ id: interBranchTransfers.id, createdAt: interBranchTransfers.createdAt }).from(interBranchTransfers).where(and(eq(interBranchTransfers.organizationId, input.organizationId), eq(interBranchTransfers.sourceBranchId, input.branchId), jurisdictionFilters(interBranchTransfers.jurisdictionId), eq(interBranchTransfers.status, "pending_review"))).orderBy(desc(interBranchTransfers.createdAt)).limit(input.limit),
      ]);
      return buildUnifiedReviewInbox([
        ...procurements.map(item => makeReviewInboxItem({ source: "procurement_request", recordId: item.id, status: "submitted", createdAt: item.createdAt })),
        ...leaveRequests.map(item => makeReviewInboxItem({ source: "leave_request", recordId: item.id, status: "submitted", createdAt: item.createdAt })),
        ...closures.map(item => makeReviewInboxItem({ source: "cash_closure", recordId: item.id, status: "submitted", createdAt: item.createdAt })),
        ...expenses.map(item => makeReviewInboxItem({ source: "other_expense", recordId: item.id, status: "pending_review", createdAt: item.createdAt })),
        ...transfers.map(item => makeReviewInboxItem({ source: "inter_branch_transfer", recordId: item.id, status: "pending_review", createdAt: item.createdAt })),
      ], input.limit);
    }),
  }),
  people: router({
    list: protectedProcedure.input(organizationScope).query(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await assertManagementAccess(db, ctx.user.id, ctx.user.role, input.organizationId);
      await assertOptionalBranchScope(db, ctx.user.id, ctx.user.role, input);
      const filters = [eq(employeeProfiles.organizationId, input.organizationId), input.branchId !== undefined ? eq(employeeProfiles.branchId, input.branchId) : undefined, optionalJurisdictionFilter(employeeProfiles.jurisdictionId, input.jurisdictionId)].filter(Boolean) as any[];
      return db.select().from(employeeProfiles).where(and(...filters)).orderBy(desc(employeeProfiles.updatedAt)).limit(100);
    }),
    create: protectedProcedure.input(organizationScope.extend({ employeeNumber: z.string().trim().min(2).max(64), displayName: z.string().trim().min(2).max(180), department: z.string().trim().max(120).optional(), jobTitle: z.string().trim().max(160).optional(), employmentStatus: z.enum(["onboarding", "active", "on_leave", "suspended", "inactive"]).default("onboarding"), hireDate: z.coerce.date().optional(), userId: z.number().int().positive().optional() })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await assertManagementAccess(db, ctx.user.id, ctx.user.role, input.organizationId);
      await assertOptionalBranchScope(db, ctx.user.id, ctx.user.role, input);
      const result = await db.insert(employeeProfiles).values({ ...input, employeeNumber: input.employeeNumber.toUpperCase(), createdByUserId: ctx.user.id });
      const employeeProfileId = Number(result[0].insertId); await writeAudit(db, { userId: ctx.user.id, organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, action: "employee_profile_created", entityType: "employee_profile", entityId: employeeProfileId });
      return { employeeProfileId };
    }),
    attendance: protectedProcedure.input(organizationScope.extend({ employeeProfileId: z.number().int().positive(), workDate: z.coerce.date(), status: z.enum(["planned", "present", "late", "absent", "approved_leave", "manual_review"]), checkInAt: z.coerce.date().optional(), checkOutAt: z.coerce.date().optional(), source: z.enum(["manual", "verified_device", "imported"]).default("manual") })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      if (!input.branchId) throw new TRPCError({ code: "BAD_REQUEST", message: "Branch scope is required for attendance" });
      await assertManagementAccess(db, ctx.user.id, ctx.user.role, input.organizationId); await assertBranchAccess(db, ctx.user.id, ctx.user.role, input.organizationId, input.branchId, input.jurisdictionId);
      const employee = (await db.select().from(employeeProfiles).where(and(eq(employeeProfiles.id, input.employeeProfileId), eq(employeeProfiles.organizationId, input.organizationId))).limit(1))[0];
      if (!employee) throw new TRPCError({ code: "NOT_FOUND", message: "Employee profile is outside the selected organization" });
      const result = await db.insert(employeeAttendance).values({ organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, employeeProfileId: input.employeeProfileId, workDate: input.workDate, status: input.status, checkInAt: input.checkInAt, checkOutAt: input.checkOutAt, source: input.source, reviewedByUserId: ctx.user.id }).onDuplicateKeyUpdate({ set: { status: input.status, checkInAt: input.checkInAt ?? null, checkOutAt: input.checkOutAt ?? null, source: input.source, reviewedByUserId: ctx.user.id } });
      const attendanceId = Number(result[0].insertId || 0); await writeAudit(db, { userId: ctx.user.id, organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, action: "employee_attendance_recorded", entityType: "employee_attendance", entityId: attendanceId || input.employeeProfileId });
      return { attendanceId: attendanceId || null, status: input.status };
    }),
    leaveRequests: protectedProcedure.input(organizationScope.extend({ employeeProfileId: z.number().int().positive().optional() }).optional()).query(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      if (!input) throw new TRPCError({ code: "BAD_REQUEST", message: "Organization scope is required" }); await assertManagementAccess(db, ctx.user.id, ctx.user.role, input.organizationId);
      await assertOptionalBranchScope(db, ctx.user.id, ctx.user.role, input);
      const filters = [eq(employeeLeaveRequests.organizationId, input.organizationId), input.branchId !== undefined ? eq(employeeLeaveRequests.branchId, input.branchId) : undefined, optionalJurisdictionFilter(employeeLeaveRequests.jurisdictionId, input.jurisdictionId), input.employeeProfileId ? eq(employeeLeaveRequests.employeeProfileId, input.employeeProfileId) : undefined].filter(Boolean) as any[];
      return db.select().from(employeeLeaveRequests).where(and(...filters)).orderBy(desc(employeeLeaveRequests.createdAt)).limit(100);
    }),
    createLeave: protectedProcedure.input(organizationScope.extend({ employeeProfileId: z.number().int().positive(), leaveType: z.enum(["annual", "sick", "emergency", "unpaid", "other"]), startsAt: z.coerce.date(), endsAt: z.coerce.date() })).mutation(async ({ ctx, input }) => {
      if (input.endsAt < input.startsAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Leave end date must follow the start date" });
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); await assertManagementAccess(db, ctx.user.id, ctx.user.role, input.organizationId);
      await assertOptionalBranchScope(db, ctx.user.id, ctx.user.role, input);
      const employee = (await db.select({ id: employeeProfiles.id }).from(employeeProfiles).where(and(eq(employeeProfiles.id, input.employeeProfileId), eq(employeeProfiles.organizationId, input.organizationId))).limit(1))[0]; if (!employee) throw new TRPCError({ code: "NOT_FOUND", message: "Employee profile is outside the selected organization" });
      const result = await db.insert(employeeLeaveRequests).values({ ...input, status: "draft", createdByUserId: ctx.user.id }); const leaveRequestId = Number(result[0].insertId); await writeAudit(db, { userId: ctx.user.id, organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, action: "leave_request_created", entityType: "leave_request", entityId: leaveRequestId }); return { leaveRequestId, status: "draft" as const };
    }),
    transitionLeave: protectedProcedure.input(z.object({ leaveRequestId: z.number().int().positive(), nextStatus: z.enum(["submitted", "approved", "rejected", "cancelled"]) })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); const leave = (await db.select().from(employeeLeaveRequests).where(eq(employeeLeaveRequests.id, input.leaveRequestId)).limit(1))[0]; if (!leave) throw new TRPCError({ code: "NOT_FOUND", message: "Leave request not found" }); await assertManagementAccess(db, ctx.user.id, ctx.user.role, leave.organizationId);
      if (!canTransitionLeave(leave.status, input.nextStatus)) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Leave request transition is not allowed" });
      await db.update(employeeLeaveRequests).set({ status: input.nextStatus, decidedByUserId: ["approved", "rejected"].includes(input.nextStatus) ? ctx.user.id : leave.decidedByUserId, decidedAt: ["approved", "rejected"].includes(input.nextStatus) ? new Date() : leave.decidedAt }).where(eq(employeeLeaveRequests.id, leave.id)); await writeAudit(db, { userId: ctx.user.id, organizationId: leave.organizationId, branchId: leave.branchId, jurisdictionId: leave.jurisdictionId, action: `leave_request_${input.nextStatus}`, entityType: "leave_request", entityId: leave.id }); return { leaveRequestId: leave.id, status: input.nextStatus };
    }),
  }),
  procurement: router({
    list: protectedProcedure.input(organizationScope).query(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); await assertManagementAccess(db, ctx.user.id, ctx.user.role, input.organizationId); await assertOptionalBranchScope(db, ctx.user.id, ctx.user.role, input); const filters = [eq(procurementRequests.organizationId, input.organizationId), input.branchId !== undefined ? eq(procurementRequests.branchId, input.branchId) : undefined, optionalJurisdictionFilter(procurementRequests.jurisdictionId, input.jurisdictionId)].filter(Boolean) as any[]; return db.select().from(procurementRequests).where(and(...filters)).orderBy(desc(procurementRequests.createdAt)).limit(100); }),
    create: protectedProcedure.input(organizationScope.extend({ requestNumber: z.string().trim().min(3).max(80), requestType: z.enum(["stock", "service", "asset", "maintenance", "other"]), title: z.string().trim().min(3).max(240), businessJustification: z.string().trim().min(5).max(2000), estimatedAmount: z.coerce.number().nonnegative().finite().optional(), currencyCode: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/).default("EGP") })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); if (!input.branchId) throw new TRPCError({ code: "BAD_REQUEST", message: "Branch scope is required for procurement" }); const branchId = input.branchId; await assertOrganizationAccess(db, ctx.user.id, ctx.user.role, input.organizationId); await assertBranchAccess(db, ctx.user.id, ctx.user.role, input.organizationId, branchId, input.jurisdictionId); const result = await db.insert(procurementRequests).values({ organizationId: input.organizationId, branchId, jurisdictionId: input.jurisdictionId, requestNumber: normalizedRequestNumber(input.requestNumber), requestType: input.requestType, title: input.title, businessJustification: input.businessJustification, currencyCode: input.currencyCode, status: "draft", createdByUserId: ctx.user.id, estimatedAmount: input.estimatedAmount?.toFixed(2) }); const requestId = Number(result[0].insertId); await writeAudit(db, { userId: ctx.user.id, organizationId: input.organizationId, branchId, jurisdictionId: input.jurisdictionId, action: "procurement_request_created", entityType: "procurement_request", entityId: requestId }); return { requestId, status: "draft" as const }; }),
    transition: protectedProcedure.input(z.object({ requestId: z.number().int().positive(), nextStatus: z.enum(["submitted", "approved", "rejected", "cancelled", "fulfilled"]) })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); const request = (await db.select().from(procurementRequests).where(eq(procurementRequests.id, input.requestId)).limit(1))[0]; if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Procurement request not found" }); await assertOrganizationAccess(db, ctx.user.id, ctx.user.role, request.organizationId); if (!canTransitionProcurement(request.status, input.nextStatus)) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Procurement request transition is not allowed" }); if (["approved", "rejected", "fulfilled"].includes(input.nextStatus)) await assertManagementAccess(db, ctx.user.id, ctx.user.role, request.organizationId); await db.update(procurementRequests).set({ status: input.nextStatus, approvedByUserId: ["approved", "rejected"].includes(input.nextStatus) ? ctx.user.id : request.approvedByUserId, approvedAt: ["approved", "rejected"].includes(input.nextStatus) ? new Date() : request.approvedAt }).where(eq(procurementRequests.id, request.id)); await writeAudit(db, { userId: ctx.user.id, organizationId: request.organizationId, branchId: request.branchId, jurisdictionId: request.jurisdictionId, action: `procurement_request_${input.nextStatus}`, entityType: "procurement_request", entityId: request.id }); return { requestId: request.id, status: input.nextStatus }; }),
  }),
  crm: router({
    list: protectedProcedure.input(organizationScope).query(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); await assertOrganizationAccess(db, ctx.user.id, ctx.user.role, input.organizationId); await assertOptionalBranchScope(db, ctx.user.id, ctx.user.role, input); const filters = [eq(crmLeads.organizationId, input.organizationId), input.branchId !== undefined ? eq(crmLeads.branchId, input.branchId) : undefined, optionalJurisdictionFilter(crmLeads.jurisdictionId, input.jurisdictionId)].filter(Boolean) as any[]; return db.select().from(crmLeads).where(and(...filters)).orderBy(desc(crmLeads.updatedAt)).limit(100); }),
    create: protectedProcedure.input(organizationScope.extend({ label: z.string().trim().min(2).max(180), source: z.enum(["walk_in", "referral", "campaign", "call_centre", "other"]).default("other"), consentStatus: z.enum(["unknown", "granted", "withdrawn", "not_required"]).default("unknown"), assignedToUserId: z.number().int().positive().optional(), nextFollowUpAt: z.coerce.date().optional() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); await assertOrganizationAccess(db, ctx.user.id, ctx.user.role, input.organizationId); if (input.branchId) await assertBranchAccess(db, ctx.user.id, ctx.user.role, input.organizationId, input.branchId, input.jurisdictionId); if (input.assignedToUserId) { const member = await db.select({ id: organizationMemberships.id }).from(organizationMemberships).where(and(eq(organizationMemberships.organizationId, input.organizationId), eq(organizationMemberships.userId, input.assignedToUserId), eq(organizationMemberships.active, 1))).limit(1); if (!member.length) throw new TRPCError({ code: "FORBIDDEN", message: "Assigned user is outside the selected organization" }); } const result = await db.insert(crmLeads).values({ ...input, stage: input.consentStatus === "withdrawn" ? "do_not_contact" : "new", createdByUserId: ctx.user.id }); const leadId = Number(result[0].insertId); await writeAudit(db, { userId: ctx.user.id, organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, action: "crm_lead_created", entityType: "crm_lead", entityId: leadId }); return { leadId, status: input.consentStatus === "withdrawn" ? "do_not_contact" as const : "new" as const }; }),
    transition: protectedProcedure.input(z.object({ leadId: z.number().int().positive(), nextStage: z.enum(["contacted", "qualified", "converted", "lost", "do_not_contact"]) })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); const lead = (await db.select().from(crmLeads).where(eq(crmLeads.id, input.leadId)).limit(1))[0]; if (!lead) throw new TRPCError({ code: "NOT_FOUND", message: "CRM lead not found" }); await assertOrganizationAccess(db, ctx.user.id, ctx.user.role, lead.organizationId); if (!canTransitionLead(lead.stage, input.nextStage)) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "CRM stage transition is not allowed" }); if (["converted", "do_not_contact"].includes(input.nextStage) && !canApproveWorkflow(ctx.user.role)) await assertManagementAccess(db, ctx.user.id, ctx.user.role, lead.organizationId); await db.update(crmLeads).set({ stage: input.nextStage, consentStatus: input.nextStage === "do_not_contact" ? "withdrawn" : lead.consentStatus }).where(eq(crmLeads.id, lead.id)); await writeAudit(db, { userId: ctx.user.id, organizationId: lead.organizationId, branchId: lead.branchId, jurisdictionId: lead.jurisdictionId, action: `crm_lead_${input.nextStage}`, entityType: "crm_lead", entityId: lead.id }); return { leadId: lead.id, stage: input.nextStage }; }),
  }),
});

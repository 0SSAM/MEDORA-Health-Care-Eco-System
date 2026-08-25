import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { auditLogs, branches, branchJurisdictions, branchUsers, crmLeads, employeeAttendance, employeeLeaveRequests, employeeProfiles, organizationMemberships, procurementRequests } from "../../drizzle/schema";
import { getDb } from "../db";
import { hashAuditRecord } from "../domain/internal-auth";
import { canApproveWorkflow, canTransitionLead, canTransitionLeave, canTransitionProcurement, normalizedRequestNumber } from "../domain/operations-policy";
import { protectedProcedure, router } from "../_core/trpc";

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

async function writeAudit(db: Database, input: { userId: number; organizationId: number; branchId?: number | null; jurisdictionId?: number | null; action: string; entityType: string; entityId: number }) {
  const previous = await db.select({ recordHash: auditLogs.recordHash }).from(auditLogs)
    .where(and(eq(auditLogs.organizationId, input.organizationId), input.branchId ? eq(auditLogs.branchId, input.branchId) : undefined))
    .orderBy(desc(auditLogs.id)).limit(1);
  const createdAt = new Date().toISOString();
  const recordHash = hashAuditRecord({ eventType: input.action, userId: input.userId, organizationId: input.organizationId, branchId: input.branchId ?? null, jurisdictionId: input.jurisdictionId ?? null, requestId: `${input.entityType}:${input.entityId}`, createdAt });
  await db.insert(auditLogs).values({ userId: input.userId, organizationId: input.organizationId, branchId: input.branchId ?? null, action: input.action, entityType: input.entityType, entityId: String(input.entityId), previousHash: previous[0]?.recordHash ?? null, recordHash });
}

const organizationScope = z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive().optional(), jurisdictionId: z.number().int().positive().optional() });

export const operationsRouter = router({
  people: router({
    list: protectedProcedure.input(organizationScope).query(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await assertOrganizationAccess(db, ctx.user.id, ctx.user.role, input.organizationId);
      if (input.branchId) await assertBranchAccess(db, ctx.user.id, ctx.user.role, input.organizationId, input.branchId, input.jurisdictionId);
      const filters = [eq(employeeProfiles.organizationId, input.organizationId), input.branchId ? eq(employeeProfiles.branchId, input.branchId) : undefined, input.jurisdictionId ? eq(employeeProfiles.jurisdictionId, input.jurisdictionId) : undefined].filter(Boolean) as any[];
      return db.select().from(employeeProfiles).where(and(...filters)).orderBy(desc(employeeProfiles.updatedAt)).limit(100);
    }),
    create: protectedProcedure.input(organizationScope.extend({ employeeNumber: z.string().trim().min(2).max(64), displayName: z.string().trim().min(2).max(180), department: z.string().trim().max(120).optional(), jobTitle: z.string().trim().max(160).optional(), employmentStatus: z.enum(["onboarding", "active", "on_leave", "suspended", "inactive"]).default("onboarding"), hireDate: z.coerce.date().optional(), userId: z.number().int().positive().optional() })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await assertManagementAccess(db, ctx.user.id, ctx.user.role, input.organizationId);
      if (input.branchId) await assertBranchAccess(db, ctx.user.id, ctx.user.role, input.organizationId, input.branchId, input.jurisdictionId);
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
      if (!input) throw new TRPCError({ code: "BAD_REQUEST", message: "Organization scope is required" }); await assertOrganizationAccess(db, ctx.user.id, ctx.user.role, input.organizationId);
      const filters = [eq(employeeLeaveRequests.organizationId, input.organizationId), input.branchId ? eq(employeeLeaveRequests.branchId, input.branchId) : undefined, input.employeeProfileId ? eq(employeeLeaveRequests.employeeProfileId, input.employeeProfileId) : undefined].filter(Boolean) as any[];
      return db.select().from(employeeLeaveRequests).where(and(...filters)).orderBy(desc(employeeLeaveRequests.createdAt)).limit(100);
    }),
    createLeave: protectedProcedure.input(organizationScope.extend({ employeeProfileId: z.number().int().positive(), leaveType: z.enum(["annual", "sick", "emergency", "unpaid", "other"]), startsAt: z.coerce.date(), endsAt: z.coerce.date() })).mutation(async ({ ctx, input }) => {
      if (input.endsAt < input.startsAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Leave end date must follow the start date" });
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); await assertOrganizationAccess(db, ctx.user.id, ctx.user.role, input.organizationId);
      if (input.branchId) await assertBranchAccess(db, ctx.user.id, ctx.user.role, input.organizationId, input.branchId, input.jurisdictionId);
      const employee = (await db.select({ id: employeeProfiles.id }).from(employeeProfiles).where(and(eq(employeeProfiles.id, input.employeeProfileId), eq(employeeProfiles.organizationId, input.organizationId))).limit(1))[0]; if (!employee) throw new TRPCError({ code: "NOT_FOUND", message: "Employee profile is outside the selected organization" });
      const result = await db.insert(employeeLeaveRequests).values({ ...input, status: "draft", createdByUserId: ctx.user.id }); const leaveRequestId = Number(result[0].insertId); await writeAudit(db, { userId: ctx.user.id, organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, action: "leave_request_created", entityType: "leave_request", entityId: leaveRequestId }); return { leaveRequestId, status: "draft" as const };
    }),
    transitionLeave: protectedProcedure.input(z.object({ leaveRequestId: z.number().int().positive(), nextStatus: z.enum(["submitted", "approved", "rejected", "cancelled"]) })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); const leave = (await db.select().from(employeeLeaveRequests).where(eq(employeeLeaveRequests.id, input.leaveRequestId)).limit(1))[0]; if (!leave) throw new TRPCError({ code: "NOT_FOUND", message: "Leave request not found" }); await assertOrganizationAccess(db, ctx.user.id, ctx.user.role, leave.organizationId);
      if (!canTransitionLeave(leave.status, input.nextStatus)) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Leave request transition is not allowed" }); if (["approved", "rejected"].includes(input.nextStatus)) await assertManagementAccess(db, ctx.user.id, ctx.user.role, leave.organizationId);
      await db.update(employeeLeaveRequests).set({ status: input.nextStatus, decidedByUserId: ["approved", "rejected"].includes(input.nextStatus) ? ctx.user.id : leave.decidedByUserId, decidedAt: ["approved", "rejected"].includes(input.nextStatus) ? new Date() : leave.decidedAt }).where(eq(employeeLeaveRequests.id, leave.id)); await writeAudit(db, { userId: ctx.user.id, organizationId: leave.organizationId, branchId: leave.branchId, jurisdictionId: leave.jurisdictionId, action: `leave_request_${input.nextStatus}`, entityType: "leave_request", entityId: leave.id }); return { leaveRequestId: leave.id, status: input.nextStatus };
    }),
  }),
  procurement: router({
    list: protectedProcedure.input(organizationScope).query(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); await assertOrganizationAccess(db, ctx.user.id, ctx.user.role, input.organizationId); if (input.branchId) await assertBranchAccess(db, ctx.user.id, ctx.user.role, input.organizationId, input.branchId, input.jurisdictionId); const filters = [eq(procurementRequests.organizationId, input.organizationId), input.branchId ? eq(procurementRequests.branchId, input.branchId) : undefined].filter(Boolean) as any[]; return db.select().from(procurementRequests).where(and(...filters)).orderBy(desc(procurementRequests.createdAt)).limit(100); }),
    create: protectedProcedure.input(organizationScope.extend({ requestNumber: z.string().trim().min(3).max(80), requestType: z.enum(["stock", "service", "asset", "maintenance", "other"]), title: z.string().trim().min(3).max(240), businessJustification: z.string().trim().min(5).max(2000), estimatedAmount: z.coerce.number().nonnegative().finite().optional(), currencyCode: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/).default("EGP") })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); if (!input.branchId) throw new TRPCError({ code: "BAD_REQUEST", message: "Branch scope is required for procurement" }); const branchId = input.branchId; await assertOrganizationAccess(db, ctx.user.id, ctx.user.role, input.organizationId); await assertBranchAccess(db, ctx.user.id, ctx.user.role, input.organizationId, branchId, input.jurisdictionId); const result = await db.insert(procurementRequests).values({ organizationId: input.organizationId, branchId, jurisdictionId: input.jurisdictionId, requestNumber: normalizedRequestNumber(input.requestNumber), requestType: input.requestType, title: input.title, businessJustification: input.businessJustification, currencyCode: input.currencyCode, status: "draft", createdByUserId: ctx.user.id, estimatedAmount: input.estimatedAmount?.toFixed(2) }); const requestId = Number(result[0].insertId); await writeAudit(db, { userId: ctx.user.id, organizationId: input.organizationId, branchId, jurisdictionId: input.jurisdictionId, action: "procurement_request_created", entityType: "procurement_request", entityId: requestId }); return { requestId, status: "draft" as const }; }),
    transition: protectedProcedure.input(z.object({ requestId: z.number().int().positive(), nextStatus: z.enum(["submitted", "approved", "rejected", "cancelled", "fulfilled"]) })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); const request = (await db.select().from(procurementRequests).where(eq(procurementRequests.id, input.requestId)).limit(1))[0]; if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Procurement request not found" }); await assertOrganizationAccess(db, ctx.user.id, ctx.user.role, request.organizationId); if (!canTransitionProcurement(request.status, input.nextStatus)) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Procurement request transition is not allowed" }); if (["approved", "rejected", "fulfilled"].includes(input.nextStatus)) await assertManagementAccess(db, ctx.user.id, ctx.user.role, request.organizationId); await db.update(procurementRequests).set({ status: input.nextStatus, approvedByUserId: ["approved", "rejected"].includes(input.nextStatus) ? ctx.user.id : request.approvedByUserId, approvedAt: ["approved", "rejected"].includes(input.nextStatus) ? new Date() : request.approvedAt }).where(eq(procurementRequests.id, request.id)); await writeAudit(db, { userId: ctx.user.id, organizationId: request.organizationId, branchId: request.branchId, jurisdictionId: request.jurisdictionId, action: `procurement_request_${input.nextStatus}`, entityType: "procurement_request", entityId: request.id }); return { requestId: request.id, status: input.nextStatus }; }),
  }),
  crm: router({
    list: protectedProcedure.input(organizationScope).query(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); await assertOrganizationAccess(db, ctx.user.id, ctx.user.role, input.organizationId); if (input.branchId) await assertBranchAccess(db, ctx.user.id, ctx.user.role, input.organizationId, input.branchId, input.jurisdictionId); const filters = [eq(crmLeads.organizationId, input.organizationId), input.branchId ? eq(crmLeads.branchId, input.branchId) : undefined].filter(Boolean) as any[]; return db.select().from(crmLeads).where(and(...filters)).orderBy(desc(crmLeads.updatedAt)).limit(100); }),
    create: protectedProcedure.input(organizationScope.extend({ label: z.string().trim().min(2).max(180), source: z.enum(["walk_in", "referral", "campaign", "call_centre", "other"]).default("other"), consentStatus: z.enum(["unknown", "granted", "withdrawn", "not_required"]).default("unknown"), assignedToUserId: z.number().int().positive().optional(), nextFollowUpAt: z.coerce.date().optional() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); await assertOrganizationAccess(db, ctx.user.id, ctx.user.role, input.organizationId); if (input.branchId) await assertBranchAccess(db, ctx.user.id, ctx.user.role, input.organizationId, input.branchId, input.jurisdictionId); if (input.assignedToUserId) { const member = await db.select({ id: organizationMemberships.id }).from(organizationMemberships).where(and(eq(organizationMemberships.organizationId, input.organizationId), eq(organizationMemberships.userId, input.assignedToUserId), eq(organizationMemberships.active, 1))).limit(1); if (!member.length) throw new TRPCError({ code: "FORBIDDEN", message: "Assigned user is outside the selected organization" }); } const result = await db.insert(crmLeads).values({ ...input, stage: input.consentStatus === "withdrawn" ? "do_not_contact" : "new", createdByUserId: ctx.user.id }); const leadId = Number(result[0].insertId); await writeAudit(db, { userId: ctx.user.id, organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, action: "crm_lead_created", entityType: "crm_lead", entityId: leadId }); return { leadId, status: input.consentStatus === "withdrawn" ? "do_not_contact" as const : "new" as const }; }),
    transition: protectedProcedure.input(z.object({ leadId: z.number().int().positive(), nextStage: z.enum(["contacted", "qualified", "converted", "lost", "do_not_contact"]) })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); const lead = (await db.select().from(crmLeads).where(eq(crmLeads.id, input.leadId)).limit(1))[0]; if (!lead) throw new TRPCError({ code: "NOT_FOUND", message: "CRM lead not found" }); await assertOrganizationAccess(db, ctx.user.id, ctx.user.role, lead.organizationId); if (!canTransitionLead(lead.stage, input.nextStage)) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "CRM stage transition is not allowed" }); if (["converted", "do_not_contact"].includes(input.nextStage) && !canApproveWorkflow(ctx.user.role)) await assertManagementAccess(db, ctx.user.id, ctx.user.role, lead.organizationId); await db.update(crmLeads).set({ stage: input.nextStage, consentStatus: input.nextStage === "do_not_contact" ? "withdrawn" : lead.consentStatus }).where(eq(crmLeads.id, lead.id)); await writeAudit(db, { userId: ctx.user.id, organizationId: lead.organizationId, branchId: lead.branchId, jurisdictionId: lead.jurisdictionId, action: `crm_lead_${input.nextStage}`, entityType: "crm_lead", entityId: lead.id }); return { leadId: lead.id, stage: input.nextStage }; }),
  }),
});

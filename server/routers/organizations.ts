import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { branchJurisdictions, branchUsers, branches, internalCredentials, organizationMemberships, organizations, users } from "../../drizzle/schema";
import { getDb, recordAuthenticationEvent } from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { assertPasswordPolicy, hashInternalPassword, normalizeInternalUsername } from "../domain/internal-auth";
import { canManageOrganization, canViewOrganizationAudit, ORGANIZATION_CAPABILITIES, ORGANIZATION_ROLES, ROLE_CAPABILITIES } from "../domain/organization-access";

const organizationTypeSchema = z.enum(["government", "pharmacy", "pharmacy_chain", "distributor", "insurer", "rehabilitation", "hospital", "laboratory", "radiology"]);
const organizationRoleSchema = z.enum(ORGANIZATION_ROLES);
const employeeRoleSchema = z.enum(["staff", "operations_manager", "clinical_lead", "compliance_officer", "auditor", "org_admin"]);
const employeeBaseInput = z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), organizationRole: employeeRoleSchema });

async function requireOrganizationManager(ctx: { user: { id: number; role: string } }, organizationId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
  if (ctx.user.role === "admin") return db;
  const memberships = await db.select().from(organizationMemberships).where(and(eq(organizationMemberships.userId, ctx.user.id), eq(organizationMemberships.active, 1)));
  if (!canManageOrganization(ctx.user.role, memberships, organizationId)) throw new TRPCError({ code: "FORBIDDEN", message: "Organization management permission required" });
  return db;
}

async function assertBranchScope(db: Awaited<ReturnType<typeof getDb>>, organizationId: number, branchId: number, jurisdictionId: number) {
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
  const branch = (await db.select({ id: branches.id }).from(branches).where(and(eq(branches.id, branchId), eq(branches.organizationId, organizationId), eq(branches.active, 1))).limit(1))[0];
  if (!branch) throw new TRPCError({ code: "BAD_REQUEST", message: "Branch is outside the organization scope" });
  const jurisdiction = (await db.select({ id: branchJurisdictions.id }).from(branchJurisdictions).where(and(eq(branchJurisdictions.branchId, branchId), eq(branchJurisdictions.jurisdictionId, jurisdictionId))).limit(1))[0];
  if (!jurisdiction) throw new TRPCError({ code: "BAD_REQUEST", message: "Confirmed jurisdiction is required for this branch" });
}

export const organizationsRouter = router({
  mine: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    if (ctx.user.role === "admin") return db.select().from(organizations).where(eq(organizations.status, "active"));
    return db.select({ id: organizations.id, organizationType: organizations.organizationType, displayName: organizations.displayName, countryCode: organizations.countryCode, status: organizations.status, environment: organizations.environment, organizationRole: organizationMemberships.organizationRole }).from(organizationMemberships).innerJoin(organizations, eq(organizations.id, organizationMemberships.organizationId)).where(and(eq(organizationMemberships.userId, ctx.user.id), eq(organizationMemberships.active, 1), eq(organizations.status, "active")));
  }),

  get: protectedProcedure.input(z.object({ organizationId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
    const organization = (await db.select().from(organizations).where(eq(organizations.id, input.organizationId)).limit(1))[0];
    if (!organization) throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
    if (ctx.user.role !== "admin") {
      const membership = (await db.select().from(organizationMemberships).where(and(eq(organizationMemberships.organizationId, input.organizationId), eq(organizationMemberships.userId, ctx.user.id), eq(organizationMemberships.active, 1))).limit(1))[0];
      if (!membership) throw new TRPCError({ code: "FORBIDDEN", message: "Organization access denied" });
      return { ...organization, organizationRole: membership.organizationRole };
    }
    return { ...organization, organizationRole: "platform_admin" as const };
  }),

  create: protectedProcedure.input(z.object({ organizationType: organizationTypeSchema, legalName: z.string().min(2).max(240), displayName: z.string().min(2).max(240), countryCode: z.string().regex(/^[A-Z]{2,3}$/) })).mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Platform administration permission required" });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
    const result = await db.insert(organizations).values({ ...input, status: "pending" });
    return { id: Number(result[0].insertId), status: "pending" as const };
  }),

  members: protectedProcedure.input(z.object({ organizationId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
    if (ctx.user.role !== "admin") {
      const memberships = await db.select().from(organizationMemberships).where(and(eq(organizationMemberships.userId, ctx.user.id), eq(organizationMemberships.active, 1)));
      const canReadDirectory = canManageOrganization(ctx.user.role, memberships, input.organizationId) || canViewOrganizationAudit(ctx.user.role, memberships, input.organizationId);
      if (!canReadDirectory) throw new TRPCError({ code: "FORBIDDEN", message: "Organization member directory access denied" });
    }
    return db.select({ userId: users.id, name: users.name, email: users.email, organizationRole: organizationMemberships.organizationRole, active: organizationMemberships.active }).from(organizationMemberships).innerJoin(users, eq(users.id, organizationMemberships.userId)).where(eq(organizationMemberships.organizationId, input.organizationId));
  }),

  branches: protectedProcedure.input(z.object({ organizationId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = await requireOrganizationManager(ctx, input.organizationId);
    return db.select({ id: branches.id, code: branches.code, nameAr: branches.nameAr, jurisdictionId: branchJurisdictions.jurisdictionId }).from(branches).innerJoin(branchJurisdictions, eq(branchJurisdictions.branchId, branches.id)).where(and(eq(branches.organizationId, input.organizationId), eq(branches.active, 1)));
  }),

  employeeDirectory: protectedProcedure.input(z.object({ organizationId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = await requireOrganizationManager(ctx, input.organizationId);
    const rows = await db.select({ userId: users.id, name: users.name, email: users.email, username: internalCredentials.username, credentialActive: internalCredentials.active, organizationRole: organizationMemberships.organizationRole, membershipActive: organizationMemberships.active, branchId: branches.id, branchName: branches.nameAr }).from(organizationMemberships).innerJoin(users, eq(users.id, organizationMemberships.userId)).innerJoin(internalCredentials, eq(internalCredentials.userId, users.id)).innerJoin(branchUsers, and(eq(branchUsers.userId, users.id), eq(branchUsers.active, 1))).innerJoin(branches, and(eq(branches.id, branchUsers.branchId), eq(branches.organizationId, input.organizationId))).where(eq(organizationMemberships.organizationId, input.organizationId));
    return rows.map(row => ({ ...row, capabilities: ROLE_CAPABILITIES[row.organizationRole as keyof typeof ROLE_CAPABILITIES] ?? [] }));
  }),

  createEmployee: protectedProcedure.input(employeeBaseInput.extend({ name: z.string().min(2).max(160), email: z.string().email().max(320).optional(), username: z.string().min(3).max(80), password: z.string().min(12).max(200) })).mutation(async ({ ctx, input }) => {
    const db = await requireOrganizationManager(ctx, input.organizationId);
    if (input.organizationRole === "org_admin") throw new TRPCError({ code: "FORBIDDEN", message: "Only platform administration can create organization administrators" });
    try { assertPasswordPolicy(input.password); } catch { throw new TRPCError({ code: "BAD_REQUEST", message: "Password must include upper, lower, and numeric characters and be at least 12 characters" }); }
    const username = normalizeInternalUsername(input.username);
    await assertBranchScope(db, input.organizationId, input.branchId, input.jurisdictionId);
    const existing = (await db.select({ id: internalCredentials.id }).from(internalCredentials).where(eq(internalCredentials.username, username)).limit(1))[0];
    if (existing) throw new TRPCError({ code: "CONFLICT", message: "Username already exists" });
    const result = await db.transaction(async tx => {
      const userResult = await tx.insert(users).values({ openId: `internal-${randomUUID()}`, name: input.name.trim(), email: input.email?.trim() || null, loginMethod: "internal", role: "user" });
      const userId = Number(userResult[0].insertId);
      const credentialResult = await tx.insert(internalCredentials).values({ userId, username, passwordHash: hashInternalPassword(input.password), accountType: "employee", active: 1 });
      await tx.insert(organizationMemberships).values({ userId, organizationId: input.organizationId, organizationRole: input.organizationRole, active: 1 });
      await tx.insert(branchUsers).values({ userId, branchId: input.branchId, active: 1 });
      return { userId, credentialId: Number(credentialResult[0].insertId) };
    });
    await recordAuthenticationEvent({ userId: result.userId, username, organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, eventType: "password_reset_completed", source: "internal" });
    return { ...result, username, organizationRole: input.organizationRole };
  }),

  updateEmployee: protectedProcedure.input(employeeBaseInput.extend({ userId: z.number().int().positive(), active: z.boolean() })).mutation(async ({ ctx, input }) => {
    const db = await requireOrganizationManager(ctx, input.organizationId);
    if (input.userId === ctx.user.id && !input.active) throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot deactivate your own account" });
    if (input.organizationRole === "org_admin") throw new TRPCError({ code: "FORBIDDEN", message: "Only platform administration can assign organization administrators" });
    await assertBranchScope(db, input.organizationId, input.branchId, input.jurisdictionId);
    const membership = (await db.select({ id: organizationMemberships.id }).from(organizationMemberships).where(and(eq(organizationMemberships.userId, input.userId), eq(organizationMemberships.organizationId, input.organizationId))).limit(1))[0];
    const credential = (await db.select({ username: internalCredentials.username }).from(internalCredentials).where(eq(internalCredentials.userId, input.userId)).limit(1))[0];
    if (!membership || !credential) throw new TRPCError({ code: "NOT_FOUND", message: "Employee account not found in this organization" });
    await db.transaction(async tx => {
      await tx.update(organizationMemberships).set({ organizationRole: input.organizationRole, active: input.active ? 1 : 0 }).where(eq(organizationMemberships.id, membership.id));
      await tx.update(branchUsers).set({ active: 0 }).where(eq(branchUsers.userId, input.userId));
      const branchMembership = (await tx.select({ id: branchUsers.id }).from(branchUsers).where(and(eq(branchUsers.userId, input.userId), eq(branchUsers.branchId, input.branchId))).limit(1))[0];
      if (branchMembership) await tx.update(branchUsers).set({ active: input.active ? 1 : 0 }).where(eq(branchUsers.id, branchMembership.id));
      else await tx.insert(branchUsers).values({ userId: input.userId, branchId: input.branchId, active: input.active ? 1 : 0 });
      await tx.update(internalCredentials).set({ active: input.active ? 1 : 0 }).where(eq(internalCredentials.userId, input.userId));
      if (!input.active) await tx.update(require("../../drizzle/schema").internalSessions).set({ revokedAt: new Date() }).where(and(eq(require("../../drizzle/schema").internalSessions.userId, input.userId), require("drizzle-orm").isNull(require("../../drizzle/schema").internalSessions.revokedAt)));
    });
    await recordAuthenticationEvent({ userId: input.userId, username: credential.username, organizationId: input.organizationId, branchId: input.branchId, jurisdictionId: input.jurisdictionId, eventType: input.active ? "cache_refreshed" : "session_revoked", source: "internal" });
    return { updated: true };
  }),

  resetEmployeePassword: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), userId: z.number().int().positive(), password: z.string().min(12).max(200) })).mutation(async ({ ctx, input }) => {
    const db = await requireOrganizationManager(ctx, input.organizationId);
    try { assertPasswordPolicy(input.password); } catch { throw new TRPCError({ code: "BAD_REQUEST", message: "Password must include upper, lower, and numeric characters and be at least 12 characters" }); }
    const row = (await db.select({ username: internalCredentials.username }).from(internalCredentials).innerJoin(organizationMemberships, and(eq(organizationMemberships.userId, internalCredentials.userId), eq(organizationMemberships.organizationId, input.organizationId), eq(organizationMemberships.active, 1))).where(eq(internalCredentials.userId, input.userId)).limit(1))[0];
    if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Employee account not found in this organization" });
    await db.update(internalCredentials).set({ passwordHash: hashInternalPassword(input.password), failedAttempts: 0, lockedUntil: null, active: 1 }).where(eq(internalCredentials.userId, input.userId));
    await db.update(require("../../drizzle/schema").internalSessions).set({ revokedAt: new Date() }).where(and(eq(require("../../drizzle/schema").internalSessions.userId, input.userId), require("drizzle-orm").isNull(require("../../drizzle/schema").internalSessions.revokedAt)));
    await recordAuthenticationEvent({ userId: input.userId, username: row.username, organizationId: input.organizationId, eventType: "password_reset_completed", source: "internal" });
    return { reset: true };
  }),

  setMembership: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), userId: z.number().int().positive(), organizationRole: organizationRoleSchema, active: z.boolean().default(true) })).mutation(async ({ ctx, input }) => {
    const db = await requireOrganizationManager(ctx, input.organizationId);
    if (input.organizationRole === "owner" || input.organizationRole === "org_admin") throw new TRPCError({ code: "FORBIDDEN", message: "Use the employee administration policy for privileged roles" });
    const existing = (await db.select().from(organizationMemberships).where(and(eq(organizationMemberships.organizationId, input.organizationId), eq(organizationMemberships.userId, input.userId))).limit(1))[0];
    if (existing) { await db.update(organizationMemberships).set({ organizationRole: input.organizationRole, active: input.active ? 1 : 0 }).where(eq(organizationMemberships.id, existing.id)); return { id: existing.id, updated: true }; }
    const result = await db.insert(organizationMemberships).values({ organizationId: input.organizationId, userId: input.userId, organizationRole: input.organizationRole, active: input.active ? 1 : 0 });
    return { id: Number(result[0].insertId), updated: false };
  }),

  assertManager: protectedProcedure.input(z.object({ organizationId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
    if (ctx.user.role === "admin") return { allowed: true };
    const memberships = await db.select().from(organizationMemberships).where(and(eq(organizationMemberships.userId, ctx.user.id), eq(organizationMemberships.active, 1)));
    return { allowed: canManageOrganization(ctx.user.role, memberships, input.organizationId) };
  }),
});

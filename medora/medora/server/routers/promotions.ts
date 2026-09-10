import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { branches, branchJurisdictions, organizationMemberships, promotions } from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

const managerRoles = ["owner", "org_admin", "operations_manager"] as const;

async function assertOrganizationManager(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, userId: number, role: string, organizationId: number) {
  if (role === "admin") return;
  const rows = await db.select({ id: organizationMemberships.id }).from(organizationMemberships).where(and(eq(organizationMemberships.organizationId, organizationId), eq(organizationMemberships.userId, userId), eq(organizationMemberships.active, 1), inArray(organizationMemberships.organizationRole, managerRoles))).limit(1);
  if (!rows.length) throw new TRPCError({ code: "FORBIDDEN", message: "Promotion management requires organization management access" });
}

export const promotionsRouter = router({
  list: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive().optional() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    await assertOrganizationManager(db, ctx.user.id, ctx.user.role, input.organizationId);
    const filters = [eq(promotions.organizationId, input.organizationId), input.jurisdictionId === undefined ? undefined : eq(promotions.jurisdictionId, input.jurisdictionId)].filter(Boolean) as any[];
    return db.select().from(promotions).where(and(...filters)).orderBy(desc(promotions.updatedAt)).limit(100);
  }),
  create: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), jurisdictionId: z.number().int().positive(), branchId: z.number().int().positive().optional(), code: z.string().regex(/^[A-Z0-9_-]{3,48}$/), name: z.string().min(2).max(180), description: z.string().max(2000).optional(), discountType: z.enum(["percent", "fixed"]), discountValue: z.number().nonnegative(), startsAt: z.coerce.date(), endsAt: z.coerce.date(), usageLimit: z.number().int().positive().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    await assertOrganizationManager(db, ctx.user.id, ctx.user.role, input.organizationId);
    if (input.endsAt <= input.startsAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Promotion period is invalid" });
    if (input.discountType === "percent" && input.discountValue > 7) throw new TRPCError({ code: "BAD_REQUEST", message: "Promotion exceeds the statutory discount cap" });
    const scope = await db.select({ branchId: branches.id }).from(branches).innerJoin(branchJurisdictions, eq(branchJurisdictions.branchId, branches.id)).where(and(eq(branches.organizationId, input.organizationId), eq(branchJurisdictions.jurisdictionId, input.jurisdictionId), input.branchId === undefined ? undefined : eq(branches.id, input.branchId))).limit(1);
    if (!scope.length) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Promotion scope is not configured for this organization" });
    const inserted = await db.insert(promotions).values({ organizationId: input.organizationId, jurisdictionId: input.jurisdictionId, branchId: input.branchId ?? null, code: input.code, name: input.name, description: input.description, discountType: input.discountType, discountValue: input.discountValue.toFixed(2), startsAt: input.startsAt, endsAt: input.endsAt, usageLimit: input.usageLimit ?? null, status: "draft", createdByUserId: ctx.user.id });
    return { promotionId: Number(inserted[0].insertId), status: "draft" as const };
  }),
  approve: protectedProcedure.input(z.object({ promotionId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const promotion = (await db.select().from(promotions).where(eq(promotions.id, input.promotionId)).limit(1))[0];
    if (!promotion) throw new TRPCError({ code: "NOT_FOUND", message: "Promotion not found" });
    await assertOrganizationManager(db, ctx.user.id, ctx.user.role, promotion.organizationId);
    await db.update(promotions).set({ status: "active", approvedByUserId: ctx.user.id, approvedAt: new Date() }).where(eq(promotions.id, promotion.id));
    return { promotionId: promotion.id, status: "active" as const };
  }),
});

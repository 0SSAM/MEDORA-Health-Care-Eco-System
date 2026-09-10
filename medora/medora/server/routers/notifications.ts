import { and, desc, eq, gt, inArray, isNull, or } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../db";
import { branchUsers, branches, notificationReads, notifications, organizationMemberships } from "../../drizzle/schema";
import { TRPCError } from "@trpc/server";
import { canViewNotification } from "../domain/notifications-policy";
import { summarizeNotifications } from "../domain/notifications-view";
import { canAccessNotificationScope } from "../domain/notification-scope";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";

const notificationInput = z.object({
  organizationId: z.number().int().positive().nullable().optional(),
  branchId: z.number().int().positive().nullable().optional(),
  audienceRole: z.enum(["all", "admin", "manager", "pharmacist", "cashier", "org_admin", "clinical_lead", "operations_manager", "staff", "auditor"]).default("all"),
  severity: z.enum(["info", "success", "warning", "critical"]).default("info"),
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(1000),
  expiresAt: z.date().nullable().optional(),
});

export const notificationsRouter = router({
  list: protectedProcedure.input(z.object({ organizationId: z.number().int().positive().nullable().optional() }).optional()).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) return { items: [], unreadCount: 0 };

    const now = new Date();
    const visibleRole = ctx.user.role;
    if (input?.organizationId && ctx.user.role !== "admin") {
      const membership = await db.select({ id: organizationMemberships.id }).from(organizationMemberships).where(and(
        eq(organizationMemberships.organizationId, input.organizationId),
        eq(organizationMemberships.userId, ctx.user.id),
        eq(organizationMemberships.active, 1),
      )).limit(1);
      if (!membership.length) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك عضوية في هذه المؤسسة." });
    }
    const branchMemberships = ctx.user.role === "admin" || !input?.organizationId ? [] : await db.select({ branchId: branchUsers.branchId }).from(branchUsers).innerJoin(branches, eq(branches.id, branchUsers.branchId)).where(and(
      eq(branchUsers.userId, ctx.user.id),
      eq(branchUsers.active, 1),
      eq(branches.organizationId, input.organizationId),
      eq(branches.active, 1),
    ));
    const accessibleBranchIds = branchMemberships.map(row => row.branchId);
    const notificationScope = [
      eq(notifications.active, 1),
      or(isNull(notifications.expiresAt), gt(notifications.expiresAt, now)),
      or(isNull(notifications.organizationId), input?.organizationId ? eq(notifications.organizationId, input.organizationId) : isNull(notifications.organizationId)),
      ctx.user.role === "admin" ? undefined : or(isNull(notifications.branchId), accessibleBranchIds.length ? inArray(notifications.branchId, accessibleBranchIds) : eq(notifications.branchId, -1)),
      or(eq(notifications.audienceRole, "all"), eq(notifications.audienceRole, visibleRole as typeof notifications.audienceRole.enumValues[number])),
    ].filter((condition): condition is NonNullable<typeof condition> => Boolean(condition));
    const rows = await db.select({
      notification: notifications,
      read: notificationReads.id,
    })
      .from(notifications)
      .leftJoin(notificationReads, and(
        eq(notificationReads.notificationId, notifications.id),
        eq(notificationReads.userId, ctx.user.id),
      ))
      .where(and(...notificationScope))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    const items = rows
      .filter(row => canViewNotification(row.notification.audienceRole, ctx.user.role))
      .filter(row => canAccessNotificationScope({
        isAdmin: ctx.user.role === "admin",
        hasActiveOrganizationMembership: ctx.user.role === "admin" || Boolean(input?.organizationId),
        hasActiveBranchMembership: row.notification.branchId === null || accessibleBranchIds.includes(row.notification.branchId),
        requestedOrganizationId: input?.organizationId,
        requestedBranchId: row.notification.branchId,
        notification: { organizationId: row.notification.organizationId, branchId: row.notification.branchId },
      }))
      .map(row => ({ ...row.notification, isRead: row.read !== null }));
    return summarizeNotifications(items);
  }),

  markRead: protectedProcedure
    .input(z.object({ notificationId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "قاعدة البيانات غير متاحة حالياً." });
      const visible = await db.select({
        id: notifications.id,
        organizationId: notifications.organizationId,
        branchId: notifications.branchId,
        audienceRole: notifications.audienceRole,
      }).from(notifications).where(and(
        eq(notifications.id, input.notificationId),
        eq(notifications.active, 1),
      )).limit(1);
      if (!visible.length) throw new TRPCError({ code: "NOT_FOUND", message: "الإشعار غير متاح." });
      const notification = visible[0];
      const audienceVisible = canViewNotification(notification.audienceRole, ctx.user.role);
      if (!audienceVisible) throw new TRPCError({ code: "FORBIDDEN", message: "الإشعار غير موجه لدورك." });
      let hasActiveOrganizationMembership = notification.organizationId === null;
      if (notification.organizationId !== null && ctx.user.role !== "admin") {
        const membership = await db.select({ id: organizationMemberships.id }).from(organizationMemberships).where(and(
          eq(organizationMemberships.organizationId, notification.organizationId),
          eq(organizationMemberships.userId, ctx.user.id),
          eq(organizationMemberships.active, 1),
        )).limit(1);
        hasActiveOrganizationMembership = membership.length > 0;
      }
      const branchMembership = notification.branchId === null || ctx.user.role === "admin" ? true : Boolean((await db.select({ id: branchUsers.id }).from(branchUsers).where(and(
        eq(branchUsers.branchId, notification.branchId),
        eq(branchUsers.userId, ctx.user.id),
        eq(branchUsers.active, 1),
      )).limit(1))[0]);
      if (!canAccessNotificationScope({
        isAdmin: ctx.user.role === "admin",
        hasActiveOrganizationMembership,
        hasActiveBranchMembership: branchMembership,
        requestedOrganizationId: notification.organizationId,
        requestedBranchId: notification.branchId,
        notification: { organizationId: notification.organizationId, branchId: notification.branchId },
      })) throw new TRPCError({ code: "FORBIDDEN", message: "الإشعار خارج نطاق عضويتك." });
      await db.insert(notificationReads).values({ notificationId: input.notificationId, userId: ctx.user.id }).onDuplicateKeyUpdate({ set: { readAt: new Date() } });
      return { success: true } as const;
    }),

  create: adminProcedure
    .input(notificationInput)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "قاعدة البيانات غير متاحة حالياً." });
      const [created] = await db.insert(notifications).values({ ...input, createdByUserId: ctx.user.id }).$returningId();
      return { id: created.id };
    }),

  listForOrganization: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      if (ctx.user.role !== "admin") {
        const membership = await db.select({ id: organizationMemberships.id }).from(organizationMemberships).where(and(
          eq(organizationMemberships.organizationId, input.organizationId),
          eq(organizationMemberships.userId, ctx.user.id),
          eq(organizationMemberships.active, 1),
        )).limit(1);
        if (!membership.length) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك عضوية في هذه المؤسسة." });
      }
      const branchMemberships = ctx.user.role === "admin" ? [] : await db.select({ branchId: branchUsers.branchId }).from(branchUsers).innerJoin(branches, eq(branches.id, branchUsers.branchId)).where(and(
        eq(branchUsers.userId, ctx.user.id),
        eq(branchUsers.active, 1),
        eq(branches.organizationId, input.organizationId),
        eq(branches.active, 1),
      ));
      const branchIds = branchMemberships.map(row => row.branchId);
      const rows = await db.select().from(notifications).where(and(
        eq(notifications.organizationId, input.organizationId),
        eq(notifications.active, 1),
        ctx.user.role === "admin" ? undefined : or(isNull(notifications.branchId), branchIds.length ? inArray(notifications.branchId, branchIds) : eq(notifications.branchId, -1)),
      )).orderBy(desc(notifications.createdAt)).limit(100);
      return rows.filter(row => canViewNotification(row.audienceRole, ctx.user.role));
    }),
});

/**
 * rbac.ts — إدارة المستخدمين والأدوار والصلاحيات (لوحة الأدمن) — حزمة ترقية MEDORA 2026-08-28.
 *
 * Multi-tenant RBAC: every target user and role is explicitly scoped to the
 * requested organization. Platform admins retain the documented super-admin bypass.
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";

async function getDbOrThrow(): Promise<any> {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
  return db;
}

type CtxUser = { id: number; role: string };

async function dbWithOrgScope(ctx: { user: CtxUser }, organizationId: number) {
  const db = await getDbOrThrow();
  if (ctx.user.role === "admin") return db;
  const rows = (await db.execute(
    sql`SELECT id FROM organization_memberships WHERE organizationId=${organizationId} AND userId=${ctx.user.id} AND active=1 LIMIT 1`
  )) as any;
  if (!rows?.[0]?.[0]) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك عضوية فعّالة في هذه المنظمة." });
  return db;
}

/** Never allow RBAC mutations/queries to target a user outside the tenant. */
async function assertUserInOrg(db: any, organizationId: number, userId: number) {
  const rows = (await db.execute(
    sql`SELECT id FROM organization_memberships WHERE organizationId=${organizationId} AND userId=${userId} AND active=1 LIMIT 1`
  )) as any;
  if (!rows?.[0]?.[0]) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "المستخدم ليس عضوًا فعّالًا في المنظمة المحددة." });
  }
}

async function permissionCodes(db: any, organizationId: number, userId: number): Promise<string[]> {
  const rows = (await db.execute(
    sql`SELECT DISTINCT p.code FROM rbac_user_roles ur
        JOIN rbac_role_permissions rp ON rp.role_id = ur.role_id
        JOIN rbac_permissions p ON p.id = rp.permission_id
        WHERE ur.organization_id=${organizationId} AND ur.user_id=${userId}`
  )) as any;
  return (rows?.[0] ?? []).map((r: any) => r.code as string);
}

async function assertPermission(db: any, organizationId: number, userId: number, permission: string) {
  const codes = await permissionCodes(db, organizationId, userId);
  if (!codes.includes("*") && !codes.includes(permission)) {
    throw new TRPCError({ code: "FORBIDDEN", message: `الصلاحية مطلوبة: ${permission}` });
  }
}

const roleInput = z.object({
  code: z.string().trim().min(2).max(64),
  nameAr: z.string().trim().min(2).max(120),
  nameEn: z.string().trim().min(2).max(120),
  description: z.string().max(255).optional(),
  permissionCodes: z.array(z.string().trim().max(64)).min(1),
});

export const rbacRouter = router({
  listPermissions: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      const rows = (await db.execute(sql`SELECT code, module, name_ar, name_en FROM rbac_permissions ORDER BY module, code`)) as any;
      return (rows?.[0] ?? []).map((r: any) => ({ code: r.code, module: r.module, nameAr: r.name_ar, nameEn: r.name_en }));
    }),

  listRoles: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      const roles = (await db.execute(sql`SELECT id, code, name_ar, name_en, is_system, description FROM rbac_roles WHERE organization_id=${input.organizationId} ORDER BY id`)) as any;
      const counts = (await db.execute(sql`SELECT role_id, COUNT(*) AS c FROM rbac_role_permissions GROUP BY role_id`)) as any;
      const map = new Map((counts?.[0] ?? []).map((r: any) => [r.role_id, r.c]));
      return (roles?.[0] ?? []).map((r: any) => ({ id: r.id, code: r.code, nameAr: r.name_ar, nameEn: r.name_en, isSystem: !!r.is_system, description: r.description, permissionCount: map.get(r.id) ?? 0 }));
    }),

  createRole: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), role: roleInput }))
    .mutation(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      await assertPermission(db, input.organizationId, (ctx as any).user.id, "admin.roles.create");
      const permRows = (await db.execute(sql`SELECT id, code FROM rbac_permissions WHERE code IN (${input.role.permissionCodes})`)) as any;
      const permissions = permRows?.[0] ?? [];
      const requested = new Set(input.role.permissionCodes);
      const found = new Set(permissions.map((p: any) => p.code as string));
      if (found.size !== requested.size || Array.from(requested).some((code) => !found.has(code))) throw new TRPCError({ code: "BAD_REQUEST", message: "يوجد رمز صلاحية غير معروف." });
      const duplicate = (await db.execute(sql`SELECT id FROM rbac_roles WHERE organization_id=${input.organizationId} AND code=${input.role.code} LIMIT 1`)) as any;
      if (duplicate?.[0]?.[0]) throw new TRPCError({ code: "CONFLICT", message: "رمز الدور مستخدم بالفعل في هذه المنظمة." });
      const res = (await db.execute(sql`INSERT INTO rbac_roles (organization_id, code, name_ar, name_en, description, is_system) VALUES (${input.organizationId}, ${input.role.code}, ${input.role.nameAr}, ${input.role.nameEn}, ${input.role.description ?? null}, 0)`)) as any;
      const roleId = Number(res?.[0]?.insertId ?? 0);
      if (!roleId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "فشل إنشاء الدور" });
      try {
        for (const p of permissions) await db.execute(sql`INSERT INTO rbac_role_permissions (role_id, permission_id) VALUES (${roleId}, ${p.id})`);
      } catch (error) {
        await db.execute(sql`DELETE FROM rbac_role_permissions WHERE role_id=${roleId}`);
        await db.execute(sql`DELETE FROM rbac_roles WHERE id=${roleId}`);
        throw error;
      }
      return { roleId };
    }),

  updateRole: protectedProcedure
    .input(z.object({ roleId: z.number().int().positive(), patch: roleInput.partial() }))
    .mutation(async ({ ctx, input }) => {
      const baseDb = await getDbOrThrow();
      const orgRows = (await baseDb.execute(sql`SELECT organization_id, code, name_ar, name_en, description, is_system FROM rbac_roles WHERE id=${input.roleId} LIMIT 1`)) as any;
      const role = orgRows?.[0]?.[0];
      if (!role) throw new TRPCError({ code: "NOT_FOUND", message: "الدور غير موجود" });
      const orgId = Number(role.organization_id);
      const db = await dbWithOrgScope(ctx as any, orgId);
      await assertPermission(db, orgId, (ctx as any).user.id, "admin.roles.update");
      if (role.is_system) throw new TRPCError({ code: "FORBIDDEN", message: "لا يمكن تعديل دور نظام" });
      if (input.patch.code) {
        const duplicate = (await db.execute(sql`SELECT id FROM rbac_roles WHERE organization_id=${orgId} AND code=${input.patch.code} AND id<>${input.roleId} LIMIT 1`)) as any;
        if (duplicate?.[0]?.[0]) throw new TRPCError({ code: "CONFLICT", message: "رمز الدور مستخدم بالفعل في هذه المنظمة." });
      }
      if (input.patch.permissionCodes) {
        const permRows = (await db.execute(sql`SELECT id, code FROM rbac_permissions WHERE code IN (${input.patch.permissionCodes})`)) as any;
        const permissions = permRows?.[0] ?? [];
        const requested = new Set(input.patch.permissionCodes);
        const found = new Set(permissions.map((p: any) => p.code as string));
        if (found.size !== requested.size || Array.from(requested).some((code) => !found.has(code))) throw new TRPCError({ code: "BAD_REQUEST", message: "يوجد رمز صلاحية غير معروف." });
        try {
          await db.transaction(async (tx: any) => {
            await tx.execute(sql`UPDATE rbac_roles SET code=${input.patch.code ?? role.code}, name_ar=${input.patch.nameAr ?? role.name_ar}, name_en=${input.patch.nameEn ?? role.name_en}, description=${input.patch.description ?? role.description} WHERE id=${input.roleId} AND organization_id=${orgId}`);
            await tx.execute(sql`DELETE FROM rbac_role_permissions WHERE role_id=${input.roleId}`);
            for (const p of permissions) await tx.execute(sql`INSERT INTO rbac_role_permissions (role_id, permission_id) VALUES (${input.roleId}, ${p.id})`);
          });
        } catch (error) { throw error; }
      } else {
        await db.execute(sql`UPDATE rbac_roles SET code=${input.patch.code ?? role.code}, name_ar=${input.patch.nameAr ?? role.name_ar}, name_en=${input.patch.nameEn ?? role.name_en}, description=${input.patch.description ?? role.description} WHERE id=${input.roleId} AND organization_id=${orgId}`);
      }
      return { ok: true };
    }),

  deleteRole: protectedProcedure
    .input(z.object({ roleId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const baseDb = await getDbOrThrow();
      const orgRows = (await baseDb.execute(sql`SELECT organization_id, is_system FROM rbac_roles WHERE id=${input.roleId} LIMIT 1`)) as any;
      const role = orgRows?.[0]?.[0];
      if (!role) throw new TRPCError({ code: "NOT_FOUND" });
      const db = await dbWithOrgScope(ctx as any, role.organization_id);
      await assertPermission(db, role.organization_id, (ctx as any).user.id, "admin.roles.delete");
      if (role.is_system) throw new TRPCError({ code: "FORBIDDEN", message: "لا يمكن حذف دور نظام" });
      await db.transaction(async (tx: any) => {
        await tx.execute(sql`DELETE FROM rbac_user_roles WHERE role_id=${input.roleId} AND organization_id=${role.organization_id}`);
        await tx.execute(sql`DELETE FROM rbac_role_permissions WHERE role_id=${input.roleId}`);
        await tx.execute(sql`DELETE FROM rbac_roles WHERE id=${input.roleId} AND organization_id=${role.organization_id}`);
      });
      return { ok: true };
    }),

  assignUserRole: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), userId: z.number().int().positive(), roleId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      await assertPermission(db, input.organizationId, (ctx as any).user.id, "admin.users.assign");
      await assertUserInOrg(db, input.organizationId, input.userId);
      const roleRows = (await db.execute(sql`SELECT id FROM rbac_roles WHERE id=${input.roleId} AND organization_id=${input.organizationId} LIMIT 1`)) as any;
      if (!roleRows?.[0]?.[0]) throw new TRPCError({ code: "BAD_REQUEST", message: "الدور لا ينتمي إلى المنظمة المحددة." });
      await db.execute(sql`INSERT IGNORE INTO rbac_user_roles (organization_id, user_id, role_id, granted_by_user_id) VALUES (${input.organizationId}, ${input.userId}, ${input.roleId}, ${(ctx as any).user.id})`);
      return { ok: true };
    }),

  revokeUserRole: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), userId: z.number().int().positive(), roleId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      await assertPermission(db, input.organizationId, (ctx as any).user.id, "admin.users.revoke");
      await assertUserInOrg(db, input.organizationId, input.userId);
      await db.execute(sql`DELETE FROM rbac_user_roles WHERE organization_id=${input.organizationId} AND user_id=${input.userId} AND role_id=${input.roleId}`);
      return { ok: true };
    }),

  listUserRoles: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), userId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      await assertUserInOrg(db, input.organizationId, input.userId);
      const rows = (await db.execute(sql`SELECT r.id, r.code, r.name_ar, r.name_en, r.is_system FROM rbac_user_roles ur JOIN rbac_roles r ON r.id = ur.role_id AND r.organization_id = ur.organization_id WHERE ur.organization_id=${input.organizationId} AND ur.user_id=${input.userId} ORDER BY r.id`)) as any;
      return (rows?.[0] ?? []).map((r: any) => ({ id: r.id, code: r.code, nameAr: r.name_ar, nameEn: r.name_en, isSystem: !!r.is_system }));
    }),

  myPermissions: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const user = (ctx as any).user as CtxUser;
      if (user.role === "admin") return { codes: ["*"], isSuper: true };
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      return { codes: await permissionCodes(db, input.organizationId, user.id), isSuper: false };
    }),
});

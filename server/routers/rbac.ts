/**
 * rbac.ts — إدارة المستخدمين والأدوار والصلاحيات (لوحة الأدمن) — حزمة ترقية MEDORA 2026-08-28.
 *
 * صمم وفق النمط المؤكد من كود المستودع:
 *   protectedProcedure, router من "../_core/trpc"  (مثل kpi.ts)
 *   getDb من "../db"                               (مثل باقي الموجّهات)
 *   ctx.user.role / ctx.user.id                    (مثل organizations.ts)
 * سياسة المشروع: لا branches — العمل على main مباشرة.
 *
 * الدمج:
 *  1) استيراد drizzle/medora-upgrade-schema.ts في drizzle/schema.ts ثم drizzle-kit generate && migrate
 *  2) تسجيل rbacRouter في server/routers.ts:  rbac: rbacRouter,
 *  3) node scripts/seed-rbac-and-roles.mjs
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";

/** getDb مع ضمان عدم القيمة الفارغة (قاعدة MEDORA مطلوبة) */
async function getDbOrThrow(): Promise<any> {
  const db = await getDbOrThrow();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
  return db;
}


type CtxUser = { id: number; role: string };

/** نطاق منظمة + صلاحية إدارية: مشرف المنصة يمر دائمًا، والباقي عبر عضوية فعّالة. */
async function dbWithOrgScope(ctx: { user: CtxUser }, organizationId: number) {
  const db = await getDbOrThrow();
  if (ctx.user.role === "admin") return db;
  const rows = (await db.execute(
    sql`SELECT id FROM organization_memberships WHERE organizationId=${organizationId} AND userId=${ctx.user.id} AND active=1 LIMIT 1`
  )) as any;
  if (!rows?.[0]?.[0]) {
    throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك عضوية فعّالة في هذه المنظمة." });
  }
  return db;
}

/** رموز الصلاحيات الفعلية لمستخدم داخل منظمة ("*" = كل الصلاحيات). */
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
  code: z.string().min(2).max(64),
  nameAr: z.string().min(2).max(120),
  nameEn: z.string().min(2).max(120),
  description: z.string().max(255).optional(),
  permissionCodes: z.array(z.string().max(64)).min(1),
});

export const rbacRouter = router({
  /** مرجعية كل الصلاحيات المتاحة */
  listPermissions: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      const rows = (await db.execute(sql`SELECT code, module, name_ar, name_en FROM rbac_permissions ORDER BY module, code`)) as any;
      return (rows?.[0] ?? []).map((r: any) => ({ code: r.code, module: r.module, nameAr: r.name_ar, nameEn: r.name_en }));
    }),

  /** أدوار منظمة مع عدد صلاحيات كل دور */
  listRoles: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      const roles = (await db.execute(sql`SELECT id, code, name_ar, name_en, is_system, description FROM rbac_roles WHERE organization_id=${input.organizationId} ORDER BY id`)) as any;
      const counts = (await db.execute(
        sql`SELECT role_id, COUNT(*) AS c FROM rbac_role_permissions GROUP BY role_id`
      )) as any;
      const map = new Map((counts?.[0] ?? []).map((r: any) => [r.role_id, r.c]));
      return (roles?.[0] ?? []).map((r: any) => ({
        id: r.id, code: r.code, nameAr: r.name_ar, nameEn: r.name_en, isSystem: !!r.is_system, description: r.description,
        permissionCount: map.get(r.id) ?? 0,
      }));
    }),

  /** إنشاء دور جديد مع صلاحياته */
  createRole: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), role: roleInput }))
    .mutation(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      await assertPermission(db, input.organizationId, (ctx as any).user.id, "admin.roles.create");
      const res = (await db.execute(
        sql`INSERT INTO rbac_roles (organization_id, code, name_ar, name_en, description, is_system)
            VALUES (${input.organizationId}, ${input.role.code}, ${input.role.nameAr}, ${input.role.nameEn}, ${input.role.description ?? null}, 0)`
      )) as any;
      const roleId = Number(res?.[0]?.insertId ?? 0);
      if (!roleId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "فشل إنشاء الدور" });
      const permRows = (await db.execute(
        sql`SELECT id, code FROM rbac_permissions WHERE code IN (${input.role.permissionCodes})`
      )) as any;
      for (const p of permRows?.[0] ?? []) {
        await db.execute(sql`INSERT IGNORE INTO rbac_role_permissions (role_id, permission_id) VALUES (${roleId}, ${p.id})`);
      }
      return { roleId };
    }),

  /** تعديل دور (أدوار النظام محمية) */
  updateRole: protectedProcedure
    .input(z.object({ roleId: z.number().int().positive(), patch: roleInput.partial() }))
    .mutation(async ({ ctx, input }) => {
      const orgRows = (await (await getDbOrThrow()).execute(sql`SELECT organization_id FROM rbac_roles WHERE id=${input.roleId}`)) as any;
      const orgId = orgRows?.[0]?.[0]?.organization_id;
      if (!orgId) throw new TRPCError({ code: "NOT_FOUND", message: "الدور غير موجود" });
      const db = await dbWithOrgScope(ctx as any, orgId);
      await assertPermission(db, orgId, (ctx as any).user.id, "admin.roles.update");
      const role = orgRows[0][0];
      if (role.is_system) throw new TRPCError({ code: "FORBIDDEN", message: "لا يمكن تعديل دور نظام" });
      await db.execute(
        sql`UPDATE rbac_roles SET code=${input.patch.code ?? role.code}, name_ar=${input.patch.nameAr ?? role.name_ar},
            name_en=${input.patch.nameEn ?? role.name_en}, description=${input.patch.description ?? role.description} WHERE id=${input.roleId}`
      );
      if (input.patch.permissionCodes) {
        await db.execute(sql`DELETE FROM rbac_role_permissions WHERE role_id=${input.roleId}`);
        const permRows = (await db.execute(sql`SELECT id FROM rbac_permissions WHERE code IN (${input.patch.permissionCodes})`)) as any;
        for (const p of permRows?.[0] ?? []) {
          await db.execute(sql`INSERT IGNORE INTO rbac_role_permissions (role_id, permission_id) VALUES (${input.roleId}, ${p.id})`);
        }
      }
      return { ok: true };
    }),

  /** حذف دور مخصص فقط */
  deleteRole: protectedProcedure
    .input(z.object({ roleId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const orgRows = (await (await getDbOrThrow()).execute(sql`SELECT organization_id, is_system FROM rbac_roles WHERE id=${input.roleId}`)) as any;
      const role = orgRows?.[0]?.[0];
      if (!role) throw new TRPCError({ code: "NOT_FOUND" });
      const db = await dbWithOrgScope(ctx as any, role.organization_id);
      await assertPermission(db, role.organization_id, (ctx as any).user.id, "admin.roles.delete");
      if (role.is_system) throw new TRPCError({ code: "FORBIDDEN", message: "لا يمكن حذف دور نظام" });
      await db.execute(sql`DELETE FROM rbac_user_roles WHERE role_id=${input.roleId}`);
      await db.execute(sql`DELETE FROM rbac_role_permissions WHERE role_id=${input.roleId}`);
      await db.execute(sql`DELETE FROM rbac_roles WHERE id=${input.roleId}`);
      return { ok: true };
    }),

  /** منح دور لمستخدم */
  assignUserRole: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), userId: z.number().int().positive(), roleId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      await assertPermission(db, input.organizationId, (ctx as any).user.id, "admin.users.assign");
      await db.execute(
        sql`INSERT IGNORE INTO rbac_user_roles (organization_id, user_id, role_id, granted_by_user_id)
            VALUES (${input.organizationId}, ${input.userId}, ${input.roleId}, ${(ctx as any).user.id})`
      );
      return { ok: true };
    }),

  /** سحب دور من مستخدم */
  revokeUserRole: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), userId: z.number().int().positive(), roleId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      await assertPermission(db, input.organizationId, (ctx as any).user.id, "admin.users.revoke");
      await db.execute(
        sql`DELETE FROM rbac_user_roles WHERE organization_id=${input.organizationId} AND user_id=${input.userId} AND role_id=${input.roleId}`
      );
      return { ok: true };
    }),

  /** أدوار مستخدم معيّن */
  listUserRoles: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), userId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      const rows = (await db.execute(
        sql`SELECT r.id, r.code, r.name_ar, r.name_en, r.is_system FROM rbac_user_roles ur
            JOIN rbac_roles r ON r.id = ur.role_id
            WHERE ur.organization_id=${input.organizationId} AND ur.user_id=${input.userId} ORDER BY r.id`
      )) as any;
      return (rows?.[0] ?? []).map((r: any) => ({ id: r.id, code: r.code, nameAr: r.name_ar, nameEn: r.name_en, isSystem: !!r.is_system }));
    }),

  /** صلاحياتي الفعلية (يستعملها الواجهة لتمكين/تعطيل الأزرار) */
  myPermissions: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const user = (ctx as any).user as CtxUser;
      if (user.role === "admin") return { codes: ["*"], isSuper: true };
      const db = await dbWithOrgScope(ctx as any, input.organizationId);
      return { codes: await permissionCodes(db, input.organizationId, user.id), isSuper: false };
    }),
});

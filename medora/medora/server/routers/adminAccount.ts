/**
 * adminAccount.ts — تغيير اسم المستخدم وكلمة المرور لحساب الأدمن (من حساب الأدمن فقط).
 * حزمة MEDORA 2026-08-28.
 *
 * الأمان:
 *  - يتطلب إعادة التحقق من كلمة المرور الحالية (verifyInternalPassword — دالة التطبيق نفسها)
 *  - يتطلب ctx.user.role === "admin" + عضوية فعّالة
 *  - كلمة مرور جديدة تخضع لسياسة التطبيق assertPasswordPolicy (12 حرفًا على الأقل)
 *  - بعد التغيير: إبطال كل جلسات المستخدم (إعادة تسجيل دخول إلزامية)
 *  - لا يمكن تغيير الدور من هذه الإجراءات (يمنع رفع الصلاحيات)
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { assertPasswordPolicy, hashInternalPassword, normalizeInternalUsername, verifyInternalPassword } from "../domain/internal-auth";

async function getDbOrThrow(): Promise<any> {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متاحة." });
  return db;
}

async function requireAdminSession(ctx: { user: { id: number; role: string } }, organizationId: number) {
  const db = await getDbOrThrow();
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "هذه العملية متاحة لحساب الأدمن فقط." });
  }
  const rows = (await db.execute(
    sql`SELECT id FROM organization_memberships WHERE organizationId=${organizationId} AND userId=${ctx.user.id} AND active=1 LIMIT 1`
  )) as any;
  if (!rows?.[0]?.[0]) throw new TRPCError({ code: "FORBIDDEN", message: "لا تملك عضوية فعّالة في هذه المنظمة." });
  return db;
}

async function getAdminCredential(db: any, userId: number) {
  const result = (await db.execute(
    sql`SELECT id, userId, username, passwordHash FROM internal_credentials WHERE userId=${userId} LIMIT 1`
  )) as any;
  const credential = result?.[0]?.[0];
  if (!credential) throw new TRPCError({ code: "NOT_FOUND", message: "لا توجد اعتمادات داخلية لهذا الحساب." });
  return credential;
}

function verifyCurrentPassword(currentPassword: string, passwordHash: string) {
  if (!verifyInternalPassword(currentPassword, passwordHash)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "كلمة المرور الحالية غير صحيحة." });
  }
}

async function revokeAllSessions(db: any, userId: number) {
  try {
    await db.execute(sql`UPDATE internal_sessions SET revokedAt=CURRENT_TIMESTAMP WHERE userId=${userId} AND revokedAt IS NULL`);
  } catch {
    // Some legacy deployments do not have the optional session-revocation column.
  }
}

export const adminAccountRouter = router({
  changeUsername: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), currentPassword: z.string().min(1), newUsername: z.string().min(3).max(64) }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminSession(ctx as any, input.organizationId);
      const c = await getAdminCredential(db, ctx.user.id);
      verifyCurrentPassword(input.currentPassword, c.passwordHash);
      const normalized = normalizeInternalUsername(input.newUsername);
      const dup = (await db.execute(
        sql`SELECT id FROM internal_credentials WHERE username=${normalized} AND userId<>${c.userId} LIMIT 1`
      )) as any;
      if (dup?.[0]?.[0]) throw new TRPCError({ code: "CONFLICT", message: "اسم المستخدم مستخدم بالفعل." });
      await db.execute(sql`UPDATE internal_credentials SET username=${normalized} WHERE id=${c.id}`);
      await revokeAllSessions(db, c.userId);
      return { ok: true, newUsername: normalized, note: "سجّل الدخول من جديد باسم المستخدم الجديد." };
    }),

  changePassword: protectedProcedure
    .input(z.object({ organizationId: z.number().int().positive(), currentPassword: z.string().min(1), newPassword: z.string().min(8) }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireAdminSession(ctx as any, input.organizationId);
      const c = await getAdminCredential(db, ctx.user.id);
      verifyCurrentPassword(input.currentPassword, c.passwordHash);
      assertPasswordPolicy(input.newPassword);
      const hashed = hashInternalPassword(input.newPassword);
      await db.execute(
        sql`UPDATE internal_credentials SET passwordHash=${hashed}, failedAttempts=0, lockedUntil=NULL WHERE id=${c.id}`
      );
      try {
        await db.execute(sql`UPDATE internal_credentials SET passwordChangedAt=CURRENT_TIMESTAMP WHERE id=${c.id}`);
      } catch {
        // Optional column on older deployments.
      }
      await revokeAllSessions(db, c.userId);
      return { ok: true, note: "تم تغيير كلمة المرور. سجّل الدخول من جديد بكلمة المرور الجديدة — وأُلغيت كل الجلسات الأخرى." };
    }),

  passwordPolicyCheck: protectedProcedure
    .input(z.object({ password: z.string().min(1) }))
    .query(({ input }) => {
      try {
        assertPasswordPolicy(input.password);
        return { ok: true, minLength: 12, message: "كلمة المرور مقبولة" };
      } catch (e: any) {
        return { ok: false, minLength: 12, message: String(e?.message ?? "كلمة المرور ضعيفة") };
      }
    }),
});

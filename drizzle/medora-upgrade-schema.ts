/**
 * medora-upgrade-schema.ts — حزمة ترقية MEDORA 2026-08-28
 * 1) RBAC دقيق: أدوار + صلاحيات + ربط (مستخدم ← دور ← صلاحية)
 * 2) AI Auto Review: جولات مراجعة + نتائج + توصيات
 * المبدأ: عمود organizationId فقط — لا branches (سياسة المشروع: No branches).
 * الدمج: استيراد هذا الملف في drizzle/schema.ts ثم: drizzle-kit generate && drizzle-kit migrate
 * كل الجداول بمعرفات autoincrement (نمط القاعدة الفعلية snake_case).
 */
import { mysqlTable, int, varchar, text, boolean, datetime, index, uniqueIndex } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/* ================= RBAC ================= */

export const rbacPermissions = mysqlTable("rbac_permissions", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull(),
  module: varchar("module", { length: 32 }).notNull(),
  nameAr: varchar("name_ar", { length: 120 }).notNull(),
  nameEn: varchar("name_en", { length: 120 }).notNull(),
  description: varchar("description", { length: 255 }),
  createdAt: datetime("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`),
}, (t) => [uniqueIndex("rbac_permissions_code_idx").on(t.code)]);

export const rbacRoles = mysqlTable("rbac_roles", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  code: varchar("code", { length: 64 }).notNull(),
  nameAr: varchar("name_ar", { length: 120 }).notNull(),
  nameEn: varchar("name_en", { length: 120 }).notNull(),
  description: varchar("description", { length: 255 }),
  isSystem: boolean("is_system").default(false),
  createdAt: datetime("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`),
}, (t) => [uniqueIndex("rbac_roles_org_code_idx").on(t.organizationId, t.code)]);

export const rbacRolePermissions = mysqlTable("rbac_role_permissions", {
  id: int("id").autoincrement().primaryKey(),
  roleId: int("role_id").notNull(),
  permissionId: int("permission_id").notNull(),
}, (t) => [uniqueIndex("rbac_role_perm_idx").on(t.roleId, t.permissionId)]);

export const rbacUserRoles = mysqlTable("rbac_user_roles", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  userId: int("user_id").notNull(),
  roleId: int("role_id").notNull(),
  grantedByUserId: int("granted_by_user_id"),
  createdAt: datetime("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`),
}, (t) => [uniqueIndex("rbac_user_role_idx").on(t.organizationId, t.userId, t.roleId)]);

/* ================= AI AUTO REVIEW ================= */

export const aiReviewRuns = mysqlTable("ai_review_runs", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organization_id").notNull(),
  trigger: varchar("trigger", { length: 16 }).notNull(), // manual | scheduled
  status: varchar("status", { length: 16 }).notNull(),   // running | completed | failed
  scoreOverall: int("score_overall"),
  reportMarkdown: text("report_markdown"),
  startedAt: datetime("started_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`),
  finishedAt: datetime("finished_at", { mode: "date" }),
}, (t) => [index("ai_review_runs_org_idx").on(t.organizationId)]);

export const aiReviewFindings = mysqlTable("ai_review_findings", {
  id: int("id").autoincrement().primaryKey(),
  runId: int("run_id").notNull(),
  module: varchar("module", { length: 32 }).notNull(),
  kpi: varchar("kpi", { length: 48 }).notNull(),
  severity: varchar("severity", { length: 8 }).notNull(), // low | medium | high | critical
  score: int("score"),
  messageAr: varchar("message_ar", { length: 255 }).notNull(),
  evidence: varchar("evidence", { length: 255 }),
}, (t) => [index("ai_review_findings_run_idx").on(t.runId)]);

export const aiReviewRecommendations = mysqlTable("ai_review_recommendations", {
  id: int("id").autoincrement().primaryKey(),
  runId: int("run_id").notNull(),
  priority: varchar("priority", { length: 8 }).notNull(), // p0 | p1 | p2 | p3
  titleAr: varchar("title_ar", { length: 160 }).notNull(),
  detailAr: varchar("detail_ar", { length: 255 }),
  module: varchar("module", { length: 32 }),
  status: varchar("status", { length: 16 }).notNull().default("open"), // open | done | dismissed
  resolvedAt: datetime("resolved_at", { mode: "date" }),
});

import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createHash } from "crypto";
import { parse as parseCookie } from "cookie";
import { protectedProcedure, router } from "../_core/trpc";
import { createHeartbeatJob } from "../_core/heartbeat";
import { COOKIE_NAME } from "@shared/const";
import { getDb } from "../db";
import { storageGetSignedUrl, storagePut } from "../storage";
import { backupPolicies, backupRuns, branches, organizations, products, inventoryBatches, sales, purchaseOrders, auditLogs, organizationMemberships } from "../../drizzle/schema";

const scopeInput = z.object({ organizationId: z.number().int().positive(), branchId: z.number().int().positive().nullable().optional() });

const cronFieldMaximums = [59, 59, 23, 31, 12, 7] as const;

function minuteMinimumGap(expression: string) {
  if (expression === "*" || /^\*\/[1-9]\d*$/.test(expression) && Number(expression.slice(2)) < 15) return 1;
  const step = expression.match(/\/(\d+)$/);
  if (step) return Number(step[1]);
  if (expression.includes("-")) return 1;
  const values = expression.split(",").map(Number).sort((left, right) => left - right);
  if (!values.every(Number.isFinite)) return 1;
  if (values.length < 2) return 60;
  return values.reduce((smallest, value, index) => {
    const next = index === values.length - 1 ? values[0] + 60 : values[index + 1];
    return Math.min(smallest, next - value);
  }, 60);
}

export function validateBackupCron(expression: string) {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 6) return "backup-cron-six-fields-required";
  if (parts[0] !== "0") return "backup-cron-seconds-must-be-zero";
  if (parts.some((part, index) => !/^[\d*/,-]+$/.test(part) || (part.match(/\d+/g) ?? []).some(value => Number(value) > cronFieldMaximums[index]))) return "backup-cron-invalid";
  if (minuteMinimumGap(parts[1]) < 15) return "backup-cron-too-frequent";
  return null;
}

const backupCronSchema = z.string().trim().min(9).max(64).superRefine((value, context) => {
  const issue = validateBackupCron(value);
  if (issue) context.addIssue({ code: z.ZodIssueCode.custom, message: issue });
});

async function assertScope(userId: number, role: string, organizationId: number, branchId?: number | null) {
  const db = await getDb();
  if (!db) throw new Error("database-unavailable");
  if (role !== "admin") {
    const membership = await db.select({ id: organizationMemberships.id }).from(organizationMemberships).where(and(eq(organizationMemberships.organizationId, organizationId), eq(organizationMemberships.userId, userId), eq(organizationMemberships.active, 1))).limit(1);
    if (!membership.length) throw new Error("scope-forbidden");
  }
  if (branchId) {
    const branch = await db.select({ id: branches.id }).from(branches).where(and(eq(branches.id, branchId), eq(branches.organizationId, organizationId), eq(branches.active, 1))).limit(1);
    if (!branch.length) throw new Error("branch-forbidden");
  }
  return db;
}

export function verifyScopedManifest(bytes: Buffer, expectedSha256: string, organizationId: number, branchId?: number | null) {
  const actualSha256 = createHash("sha256").update(bytes).digest("hex");
  if (actualSha256 !== expectedSha256) throw new Error("backup-integrity-mismatch");
  const manifest = JSON.parse(bytes.toString("utf8")) as { format?: string; scope?: { organizationId?: number; branchId?: number | null }; data?: Record<string, unknown> };
  if (manifest.format !== "MEDORA-SCOPED-BACKUP-V1") throw new Error("backup-format-invalid");
  if (manifest.scope?.organizationId !== organizationId || (manifest.scope.branchId ?? null) !== (branchId ?? null)) throw new Error("backup-scope-mismatch");
  for (const required of ["organization", "branches", "products", "inventoryBatches", "sales", "purchaseOrders", "auditLogs"]) {
    if (!Array.isArray(manifest.data?.[required])) throw new Error("backup-payload-invalid");
  }
  return { format: manifest.format, scope: manifest.scope, recordCount: Object.values(manifest.data ?? {}).reduce<number>((sum, value) => sum + (Array.isArray(value) ? value.length : 0), 0), sha256: actualSha256 };
}

export async function buildScopedManifest(db: any, organizationId: number, branchId?: number | null) {
  const organization = await db.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1);
  const branchRows = branchId
    ? await db.select().from(branches).where(and(eq(branches.organizationId, organizationId), eq(branches.id, branchId))).limit(100)
    : await db.select().from(branches).where(eq(branches.organizationId, organizationId)).limit(500);
  const productRows = await db.select().from(products).where(eq(products.organizationId, organizationId)).limit(5000);
  const inventoryRows = branchId
    ? await db.select().from(inventoryBatches).where(and(eq(inventoryBatches.organizationId, organizationId), eq(inventoryBatches.branchId, branchId))).limit(10000)
    : await db.select().from(inventoryBatches).where(eq(inventoryBatches.organizationId, organizationId)).limit(10000);
  const salesRows = branchId
    ? await db.select().from(sales).where(and(eq(sales.organizationId, organizationId), eq(sales.branchId, branchId))).limit(10000)
    : await db.select().from(sales).where(eq(sales.organizationId, organizationId)).limit(10000);
  const purchaseRows = await db.select().from(purchaseOrders).where(eq(purchaseOrders.organizationId, organizationId)).limit(10000);
  const auditRows = branchId
    ? await db.select().from(auditLogs).where(and(eq(auditLogs.organizationId, organizationId), eq(auditLogs.branchId, branchId))).orderBy(desc(auditLogs.createdAt)).limit(20000)
    : await db.select().from(auditLogs).where(eq(auditLogs.organizationId, organizationId)).orderBy(desc(auditLogs.createdAt)).limit(20000);
  return { format: "MEDORA-SCOPED-BACKUP-V1", generatedAt: new Date().toISOString(), scope: { organizationId, branchId: branchId ?? null }, coverage: { organizations: organization.length, branches: branchRows.length, products: productRows.length, inventoryBatches: inventoryRows.length, sales: salesRows.length, purchaseOrders: purchaseRows.length, auditLogs: auditRows.length }, data: { organization, branches: branchRows, products: productRows, inventoryBatches: inventoryRows, sales: salesRows, purchaseOrders: purchaseRows, auditLogs: auditRows } };
}

export const backupRouter = router({
  listPolicies: protectedProcedure.input(scopeInput).query(async ({ ctx, input }) => {
    const db = await assertScope(ctx.user.id, ctx.user.role, input.organizationId, input.branchId);
    return db.select().from(backupPolicies).where(and(eq(backupPolicies.organizationId, input.organizationId), input.branchId ? eq(backupPolicies.branchId, input.branchId) : undefined)).orderBy(desc(backupPolicies.createdAt));
  }),
  listRuns: protectedProcedure.input(scopeInput).query(async ({ ctx, input }) => {
    const db = await assertScope(ctx.user.id, ctx.user.role, input.organizationId, input.branchId);
    return db.select().from(backupRuns).where(and(eq(backupRuns.organizationId, input.organizationId), input.branchId ? eq(backupRuns.branchId, input.branchId) : undefined)).orderBy(desc(backupRuns.createdAt)).limit(100);
  }),
  createPolicy: protectedProcedure.input(z.object({ ...scopeInput.shape, name: z.string().trim().min(3).max(160), destinationType: z.enum(["online", "offline_export"]), cronExpression: backupCronSchema, retentionDays: z.number().int().min(1).max(3650).default(30), encryptionMode: z.enum(["platform_managed", "customer_key_required"]).default("platform_managed") })).mutation(async ({ ctx, input }) => {
    const db = await assertScope(ctx.user.id, ctx.user.role, input.organizationId, input.branchId);
    const result = await db.insert(backupPolicies).values({ organizationId: input.organizationId, branchId: input.branchId ?? null, name: input.name, destinationType: input.destinationType, cronExpression: input.cronExpression, retentionDays: input.retentionDays, encryptionMode: input.encryptionMode, createdByUserId: ctx.user.id });
    const policyId = Number(result[0].insertId);
    const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
    const job = await createHeartbeatJob({ name: `medora-backup-${policyId}`, cron: input.cronExpression, path: "/api/scheduled/backup", payload: { policyId }, description: `MEDORA backup policy ${policyId}` }, sessionToken);
    await db.update(backupPolicies).set({ scheduleCronTaskUid: job.taskUid }).where(eq(backupPolicies.id, policyId));
    return { policyId, taskUid: job.taskUid, nextExecutionAt: job.nextExecutionAt ?? null };
  }),
  requestOfflineExportUrl: protectedProcedure.input(z.object({ runId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("database-unavailable");
    const runs = await db.select().from(backupRuns).where(eq(backupRuns.id, input.runId)).limit(1);
    const run = runs[0];
    if (!run || run.status !== "verified" || !run.manifestKey || !run.manifestSha256) throw new Error("offline-export-not-available");
    const policies = await db.select().from(backupPolicies).where(eq(backupPolicies.id, run.policyId)).limit(1);
    const policy = policies[0];
    if (!policy || policy.destinationType !== "offline_export" || policy.organizationId !== run.organizationId || (policy.branchId ?? null) !== (run.branchId ?? null)) throw new Error("offline-export-policy-mismatch");
    await assertScope(ctx.user.id, ctx.user.role, run.organizationId, run.branchId);
    return { url: await storageGetSignedUrl(run.manifestKey), sha256: run.manifestSha256, recordCount: run.recordCount };
  }),
  verifyRun: protectedProcedure.input(z.object({ runId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("database-unavailable");
    const rows = await db.select().from(backupRuns).where(eq(backupRuns.id, input.runId)).limit(1);
    const run = rows[0];
    if (!run || !run.manifestKey || !run.manifestSha256) throw new Error("backup-run-not-verifiable");
    await assertScope(ctx.user.id, ctx.user.role, run.organizationId, run.branchId);
    const signedUrl = await storageGetSignedUrl(run.manifestKey);
    const response = await fetch(signedUrl);
    if (!response.ok) throw new Error("backup-manifest-unavailable");
    const bytes = Buffer.from(await response.arrayBuffer());
    return verifyScopedManifest(bytes, run.manifestSha256, run.organizationId, run.branchId);
  }),
  runNow: protectedProcedure.input(z.object({ policyId: z.number().int().positive(), idempotencyKey: z.string().trim().min(8).max(160) })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("database-unavailable");
    const policies = await db.select().from(backupPolicies).where(eq(backupPolicies.id, input.policyId)).limit(1);
    const policy = policies[0];
    if (!policy) throw new Error("policy-not-found");
    await assertScope(ctx.user.id, ctx.user.role, policy.organizationId, policy.branchId);
    const existing = await db.select().from(backupRuns).where(and(eq(backupRuns.policyId, policy.id), eq(backupRuns.idempotencyKey, input.idempotencyKey))).limit(1);
    if (existing[0]) return existing[0];
    const inserted = await db.insert(backupRuns).values({ policyId: policy.id, organizationId: policy.organizationId, branchId: policy.branchId, idempotencyKey: input.idempotencyKey, status: "running", startedAt: new Date() });
    const runId = Number(inserted[0].insertId);
    try {
      const manifest = await buildScopedManifest(db, policy.organizationId, policy.branchId);
      const bytes = Buffer.from(JSON.stringify(manifest));
      const sha256 = createHash("sha256").update(bytes).digest("hex");
      const key = `${policy.storagePrefix ?? `backups/org-${policy.organizationId}`}/run-${runId}-${sha256.slice(0, 16)}.json`;
      const stored = await storagePut(key, bytes, "application/json");
      const recordCount = Object.values(manifest.coverage).reduce((sum, value) => sum + Number(value), 0);
      await db.update(backupRuns).set({ status: "verified", manifestKey: stored.key, manifestSha256: sha256, recordCount, completedAt: new Date() }).where(eq(backupRuns.id, runId));
      return { id: runId, status: "verified" as const, manifestKey: stored.key, manifestSha256: sha256, recordCount };
    } catch (error) {
      await db.update(backupRuns).set({ status: "failed", errorCode: error instanceof Error ? error.message.slice(0, 80) : "backup-failed", completedAt: new Date() }).where(eq(backupRuns.id, runId));
      throw error;
    }
  }),
});

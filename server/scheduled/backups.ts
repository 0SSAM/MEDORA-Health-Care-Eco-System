import { and, eq } from "drizzle-orm";
import { createHash } from "crypto";
import type { Request, Response } from "express";
import { backupPolicies, backupRuns } from "../../drizzle/schema";
import { getDb } from "../db";
import { sdk } from "../_core/sdk";
import { storagePut } from "../storage";
import { buildScopedManifest } from "../routers/backup";

export async function backupHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    const taskUid = user.taskUid;
    if (!user.isCron || !taskUid) return res.status(403).json({ error: "cron-only" });
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "database-unavailable" });
    const policy = (await db.select().from(backupPolicies).where(and(eq(backupPolicies.scheduleCronTaskUid, taskUid), eq(backupPolicies.active, 1))).limit(1))[0];
    if (!policy) return res.json({ ok: true, skipped: "orphan" });
    const minuteKey = new Date().toISOString().slice(0, 16);
    const idempotencyKey = `${taskUid}:${minuteKey}`;
    const existing = (await db.select().from(backupRuns).where(and(eq(backupRuns.policyId, policy.id), eq(backupRuns.idempotencyKey, idempotencyKey))).limit(1))[0];
    if (existing) return res.json({ ok: true, skipped: "duplicate", runId: existing.id, status: existing.status });
    const inserted = await db.insert(backupRuns).values({ policyId: policy.id, organizationId: policy.organizationId, branchId: policy.branchId, taskUid, idempotencyKey, status: "running", startedAt: new Date() });
    const runId = Number(inserted[0].insertId);
    try {
      const manifest = await buildScopedManifest(db, policy.organizationId, policy.branchId);
      const bytes = Buffer.from(JSON.stringify(manifest));
      const manifestSha256 = createHash("sha256").update(bytes).digest("hex");
      const key = `${policy.storagePrefix ?? `backups/org-${policy.organizationId}`}/run-${runId}-${manifestSha256.slice(0, 16)}.json`;
      const stored = await storagePut(key, bytes, "application/json");
      const recordCount = Object.values(manifest.coverage).reduce((sum, value) => sum + Number(value), 0);
      await db.update(backupRuns).set({ status: "verified", manifestKey: stored.key, manifestSha256, recordCount, completedAt: new Date() }).where(eq(backupRuns.id, runId));
      return res.json({ ok: true, runId, status: "verified", manifestSha256, recordCount });
    } catch (error) {
      await db.update(backupRuns).set({ status: "failed", errorCode: error instanceof Error ? error.message.slice(0, 80) : "backup-failed", completedAt: new Date() }).where(eq(backupRuns.id, runId));
      return res.status(500).json({ ok: false, error: "backup-failed", runId });
    }
  } catch {
    return res.status(500).json({ error: "backup-transport-failed" });
  }
}

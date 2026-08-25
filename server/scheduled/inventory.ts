import type { Request, Response } from "express";
import { and, eq, gte, lte, or } from "drizzle-orm";
import { branchAlerts, branchUsers, inventoryBatches, scheduledJobs, users } from "../../drizzle/schema";
import { getDb } from "../db";
import { sdk } from "../_core/sdk";

export function safeInventoryTransportError(_error: unknown) {
  return { error: "inventory-alert-execution-failed" } as const;
}

export async function inventoryAlertHandler(req: Request, res: Response) {
  let taskUid: string | undefined;
  try {
    const user = await sdk.authenticateRequest(req);
    taskUid = user.taskUid;
    if (!user.isCron || !taskUid) return res.status(403).json({ error: "cron-only" });
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "database-unavailable" });

    const job = (await db.select().from(scheduledJobs).where(eq(scheduledJobs.scheduleCronTaskUid, taskUid)).limit(1))[0];
    if (!job) return res.json({ ok: true, skipped: "orphan" });

    const now = new Date();
    const expiryLimit = new Date(now.getTime() + 30 * 86_400_000);
    const alertDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const batches = await db.select().from(inventoryBatches).where(or(lte(inventoryBatches.quantityOnHand, inventoryBatches.reorderPoint), and(gte(inventoryBatches.expiryDate, now), lte(inventoryBatches.expiryDate, expiryLimit))));
    const managers = await db.select({ branchId: branchUsers.branchId, userId: branchUsers.userId }).from(branchUsers).innerJoin(users, eq(users.id, branchUsers.userId)).where(and(eq(branchUsers.active, 1), eq(users.role, "manager")));
    let queued = 0;
    for (const batch of batches) {
      const type = Number(batch.quantityOnHand) <= Number(batch.reorderPoint) ? "reorder" : "expiry";
      for (const manager of managers.filter(item => item.branchId === batch.branchId)) {
        await db.insert(branchAlerts).values({ branchId: batch.branchId, managerUserId: manager.userId, alertType: type, inventoryBatchId: batch.id, alertDate: alertDay, status: "queued" }).onDuplicateKeyUpdate({ set: { status: "queued" } });
        queued += 1;
      }
    }
    await db.update(scheduledJobs).set({ lastRunAt: now }).where(eq(scheduledJobs.id, job.id));
    return res.json({ ok: true, taskUid, batchesEvaluated: batches.length, managerAlertsQueued: queued, delivery: "branch_alert_queue" });
  } catch (error) {
    return res.status(500).json(safeInventoryTransportError(error));
  }
}

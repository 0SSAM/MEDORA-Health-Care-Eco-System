import type { Request, Response } from "express";
import { and, eq, gte, inArray, lte, or } from "drizzle-orm";
import { automationOutboundEvents, branchAlerts, branchUsers, inventoryBatches, notifications, organizationMemberships, scheduledJobs } from "../../drizzle/schema";
import { getDb } from "../db";
import { sdk } from "../_core/sdk";
import { ENV } from "../_core/env";
import { buildInventoryAutomationInternalEvent, internalEventLedgerAvailable, serializeAndSignInternalEvent, shouldNotifyRepeatedAutomationFailure } from "./outbound-events";

export function safeInventoryTransportError(_error: unknown) {
  return { error: "inventory-alert-execution-failed" } as const;
}

export function inventoryAutomationSkipReason(job: { active: number; workflowKey: string; organizationId: number | null; branchId: number | null; jurisdictionId: number | null } | undefined) {
  if (!job) return "orphan" as const;
  if (job.active !== 1) return "inactive" as const;
  if (job.workflowKey !== "inventory_alert_scan") return "unsupported-workflow" as const;
  if (job.organizationId === null || job.branchId === null || job.jurisdictionId === null) return "unscoped" as const;
  return null;
}

export async function inventoryAlertHandler(req: Request, res: Response) {
  let taskUid: string | undefined;
  let jobId: number | undefined;
  let scopedJob: { id: number; organizationId: number | null; branchId: number | null; jurisdictionId: number | null; consecutiveFailureCount: number; lastFailureNotificationCount: number; automationFailureNotificationThreshold: number } | undefined;
  let db: Awaited<ReturnType<typeof getDb>> | undefined;
  try {
    const user = await sdk.authenticateRequest(req);
    taskUid = user.taskUid;
    if (!user.isCron || !taskUid) return res.status(403).json({ error: "cron-only" });
    db = await getDb();
    if (!db) return res.status(503).json({ error: "database-unavailable" });

    const job = (await db.select().from(scheduledJobs).where(eq(scheduledJobs.scheduleCronTaskUid, taskUid)).limit(1))[0];
    const skipReason = inventoryAutomationSkipReason(job);
    if (skipReason) {
      if (job) await db.update(scheduledJobs).set({ lastRunAt: new Date(), lastRunStatus: "skipped", lastErrorCode: skipReason }).where(eq(scheduledJobs.id, job.id));
      return res.json({ ok: true, skipped: skipReason });
    }
    jobId = job.id;
    scopedJob = job;

    const now = new Date();
    const expiryLimit = new Date(now.getTime() + 30 * 86_400_000);
    const alertDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const batches = await db.select().from(inventoryBatches).where(and(
      eq(inventoryBatches.organizationId, job.organizationId!),
      eq(inventoryBatches.branchId, job.branchId!),
      eq(inventoryBatches.jurisdictionId, job.jurisdictionId!),
      or(lte(inventoryBatches.quantityOnHand, inventoryBatches.reorderPoint), and(gte(inventoryBatches.expiryDate, now), lte(inventoryBatches.expiryDate, expiryLimit))),
    ));
    const managers = await db.select({ userId: branchUsers.userId }).from(branchUsers).innerJoin(organizationMemberships, eq(organizationMemberships.userId, branchUsers.userId)).where(and(
      eq(branchUsers.branchId, job.branchId!),
      eq(branchUsers.active, 1),
      eq(organizationMemberships.organizationId, job.organizationId!),
      eq(organizationMemberships.active, 1),
      inArray(organizationMemberships.organizationRole, ["owner", "org_admin", "operations_manager"]),
    ));
    let queued = 0;
    for (const batch of batches) {
      const type = Number(batch.quantityOnHand) <= Number(batch.reorderPoint) ? "reorder" : "expiry";
      for (const manager of managers) {
        await db.insert(branchAlerts).values({ organizationId: job.organizationId, branchId: job.branchId!, managerUserId: manager.userId, alertType: type, inventoryBatchId: batch.id, alertDate: alertDay, status: "queued" }).onDuplicateKeyUpdate({ set: { status: "queued" } });
        queued += 1;
      }
    }
    if (!internalEventLedgerAvailable(ENV.auditSigningKey)) throw new Error("internal-event-ledger-signing-key-unavailable");
    const eventId = `inventory-automation:${job.id}:${now.getTime()}`;
    const event = buildInventoryAutomationInternalEvent({ eventId, occurredAt: now, organizationId: job.organizationId!, branchId: job.branchId!, jurisdictionId: job.jurisdictionId!, batchesEvaluated: batches.length, managerAlertsQueued: queued });
    const { body, signature } = serializeAndSignInternalEvent(event, ENV.auditSigningKey);
    await db.insert(automationOutboundEvents).values({ scheduledJobId: job.id, organizationId: job.organizationId!, branchId: job.branchId!, jurisdictionId: job.jurisdictionId!, eventId, eventType: event.eventType, status: "succeeded", occurredAt: now, deliveredAt: null, recordedAt: now, safeErrorCode: null, auditPayloadJson: body, signatureHex: signature });
    await db.update(scheduledJobs).set({ lastRunAt: now, lastRunStatus: "succeeded", lastRunEvaluatedCount: batches.length, lastRunQueuedCount: queued, lastErrorCode: null, consecutiveFailureCount: 0, lastFailureNotificationCount: 0, lastInternalEventAt: now, lastInternalEventStatus: "recorded" }).where(eq(scheduledJobs.id, job.id));
    return res.json({ ok: true, taskUid, batchesEvaluated: batches.length, managerAlertsQueued: queued, delivery: "branch_alert_queue" });
  } catch (error) {
    const failedJob = scopedJob;
    const failedJobId = jobId;
    if (db && typeof failedJobId === "number" && failedJob && failedJob.organizationId !== null && failedJob.branchId !== null) {
      const nextConsecutiveFailureCount = failedJob.consecutiveFailureCount + 1;
      const threshold = Math.max(2, Math.min(10, failedJob.automationFailureNotificationThreshold || 3));
      const shouldNotify = shouldNotifyRepeatedAutomationFailure({ nextConsecutiveFailureCount, lastFailureNotificationCount: failedJob.lastFailureNotificationCount, threshold });
      await db.transaction(async tx => {
        await tx.update(scheduledJobs).set({ lastRunAt: new Date(), lastRunStatus: "failed", lastErrorCode: "inventory-alert-execution-failed", consecutiveFailureCount: nextConsecutiveFailureCount, lastFailureNotificationCount: shouldNotify ? nextConsecutiveFailureCount : failedJob.lastFailureNotificationCount }).where(eq(scheduledJobs.id, failedJobId));
        if (shouldNotify) await tx.insert(notifications).values({ organizationId: failedJob.organizationId, branchId: failedJob.branchId, audienceRole: "manager", severity: "warning", title: "Inventory automation needs review", body: "A scoped inventory automation run has failed repeatedly. Review automation status in MEDORA.", active: 1 });
      }).catch(() => undefined);
    }
    return res.status(500).json(safeInventoryTransportError(error));
  }
}

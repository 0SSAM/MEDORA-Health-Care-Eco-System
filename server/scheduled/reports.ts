import type { Request, Response } from "express";
import { and, eq, gte, lte } from "drizzle-orm";
import { balanceLedgerEntries, branchJurisdictions, inventoryBatches, notifications, organizationMemberships, purchaseOrders, reportDefinitions, reportDeliveryAttempts, reportRuns, sales, users } from "../../drizzle/schema";
import { getDb } from "../db";
import { sdk } from "../_core/sdk";
import { ENV } from "../_core/env";
import { notifyOwner } from "../_core/notification";

export type ReportExecutionDefinition = { id: number; status: string; jurisdictionId: number | null; queryKey: string };

export function boundedReportErrorCode(_error: unknown): "REPORT_QUERY_FAILED" {
  return "REPORT_QUERY_FAILED";
}

export function safeReportTransportError(_error: unknown): { error: "report-execution-failed" } {
  return { error: "report-execution-failed" };
}

export function reportExecutionSkipReason(definition: ReportExecutionDefinition): "inactive" | "missing_scope" | "unsupported_query" | undefined {
  if (definition.status !== "active") return "inactive";
  if (definition.jurisdictionId === null) return "missing_scope";
  if (!new Set(["inventory.alerts.v1", "procurement.purchases.v1", "finance.balances.v1", "sales.daily.v1", "compliance.expiry.v1", "operations.summary.v1"]).has(definition.queryKey)) return "unsupported_query";
  return undefined;
}

export function buildReportDeliveryAudit(input: { reportRunId: number; definitionId: number; organizationId: number; jurisdictionId: number | null; channel: "in_app" | "email" | "webhook"; status: "queued" | "delivered" | "skipped" | "failed"; notificationId?: number | null; errorCode?: string | null }) {
  if (input.channel !== "in_app" && input.channel !== "email") throw new Error("Unsupported report delivery channel");
  if (!Number.isInteger(input.reportRunId) || input.reportRunId <= 0) throw new Error("Report run is required");
  if (!Number.isInteger(input.definitionId) || input.definitionId <= 0) throw new Error("Report definition is required");
  if (!Number.isInteger(input.organizationId) || input.organizationId <= 0) throw new Error("Report organization scope is required");
  if (!Number.isInteger(input.jurisdictionId) || (input.jurisdictionId ?? -1) < 0) throw new Error("Report jurisdiction scope is required");
  return { reportRunId: input.reportRunId, definitionId: input.definitionId, organizationId: input.organizationId, jurisdictionId: input.jurisdictionId, channel: input.channel, status: input.status, notificationId: input.notificationId ?? null, errorCode: input.errorCode ?? null };
}

function boundedDeliveryErrorCode(error: unknown): "EMAIL_DELIVERY_FAILED" {
  console.warn("[Scheduled report] Email delivery failed", error instanceof Error ? error.name : "unknown-error");
  return "EMAIL_DELIVERY_FAILED";
}

function reportEmailContent(definition: typeof reportDefinitions.$inferSelect, output: Record<string, unknown>, periodStart: Date, periodEnd: Date) {
  const summary = Object.entries(output)
    .filter(([, value]) => ["string", "number", "boolean"].includes(typeof value))
    .map(([label, value]) => `- ${label}: ${String(value)}`)
    .join("\n");
  const subject = `MEDORA report ready: ${definition.name}`.slice(0, 160);
  const text = [
    `Your authorized MEDORA report is ready: ${definition.name}.`,
    `Period: ${periodStart.toISOString()} to ${periodEnd.toISOString()}.`,
    "This message contains an aggregate summary only. Open MEDORA Reports to review the scoped report.",
    "",
    summary || "No aggregate values were produced.",
  ].join("\n");
  return { subject, text, html: `<p>${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />")}</p>` };
}

async function recordInAppDelivery(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, definition: typeof reportDefinitions.$inferSelect, reportRunId: number) {
  const audit = buildReportDeliveryAudit({ reportRunId, definitionId: definition.id, organizationId: definition.organizationId, jurisdictionId: definition.jurisdictionId, channel: "in_app", status: "queued" });
  const base = { ...audit, recipientRole: definition.recipientRole, recipientUserId: definition.recipientUserId };
  if (definition.recipientUserId !== null) {
    await db.insert(reportDeliveryAttempts).values({ ...base, status: "skipped", errorCode: "RECIPIENT_USER_TARGET_UNSUPPORTED", completedAt: new Date() });
    return { status: "skipped" as const, reason: "recipient_user_target_unsupported" as const };
  }
  const audienceRole = definition.recipientRole === "owner" || definition.recipientRole === "compliance_officer" ? "org_admin" : definition.recipientRole ?? "all";
  const created = await db.insert(notifications).values({
    organizationId: definition.organizationId,
    branchId: null,
    audienceRole,
    severity: "info",
    title: `Report ready: ${definition.name}`.slice(0, 160),
    body: "A scoped scheduled report completed. Open Reports to review the authorized summary.",
    createdByUserId: null,
  }).$returningId();
  const notificationId = created[0]?.id ?? null;
  await db.insert(reportDeliveryAttempts).values({ ...base, status: "delivered", notificationId, completedAt: new Date() });
  return { status: "delivered" as const, notificationId };
}

export async function recordEmailDelivery(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, definition: typeof reportDefinitions.$inferSelect, reportRunId: number, output: Record<string, unknown>, periodStart: Date, periodEnd: Date) {
  const audit = buildReportDeliveryAudit({ reportRunId, definitionId: definition.id, organizationId: definition.organizationId, jurisdictionId: definition.jurisdictionId, channel: "email", status: "queued" });
  const base = { ...audit, recipientRole: definition.recipientRole, recipientUserId: definition.recipientUserId };
  if (definition.deliveryEnabled !== 1) {
    await db.insert(reportDeliveryAttempts).values({ ...base, status: "skipped", errorCode: "DELIVERY_DISABLED", completedAt: new Date() });
    return { status: "skipped" as const, reason: "delivery_disabled" as const };
  }
  if (!definition.recipientUserId) {
    await db.insert(reportDeliveryAttempts).values({ ...base, status: "skipped", errorCode: "RECIPIENT_REQUIRED", completedAt: new Date() });
    return { status: "skipped" as const, reason: "recipient_required" as const };
  }
  if (!ENV.reportMailApiKey || !ENV.reportMailFrom) {
    await db.insert(reportDeliveryAttempts).values({ ...base, status: "failed", errorCode: "EMAIL_PROVIDER_UNCONFIGURED", completedAt: new Date() });
    return { status: "failed" as const, reason: "email_provider_unconfigured" as const };
  }
  const recipient = (await db.select({ email: users.email }).from(users).innerJoin(organizationMemberships, and(eq(organizationMemberships.userId, users.id), eq(organizationMemberships.organizationId, definition.organizationId), eq(organizationMemberships.active, 1))).where(eq(users.id, definition.recipientUserId)).limit(1))[0];
  if (!recipient?.email) {
    await db.insert(reportDeliveryAttempts).values({ ...base, status: "failed", errorCode: "RECIPIENT_EMAIL_UNAVAILABLE", completedAt: new Date() });
    return { status: "failed" as const, reason: "recipient_email_unavailable" as const };
  }
  try {
    const content = reportEmailContent(definition, output, periodStart, periodEnd);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${ENV.reportMailApiKey}`,
        "content-type": "application/json",
        "Idempotency-Key": `medora-report-${definition.id}-${reportRunId}`,
      },
      body: JSON.stringify({ from: ENV.reportMailFrom, to: [recipient.email], subject: content.subject, text: content.text, html: content.html }),
    });
    if (!response.ok) throw new Error(`email-http-${response.status}`);
    await db.insert(reportDeliveryAttempts).values({ ...base, status: "delivered", completedAt: new Date() });
    return { status: "delivered" as const };
  } catch (error) {
    const errorCode = boundedDeliveryErrorCode(error);
    await db.insert(reportDeliveryAttempts).values({ ...base, status: "failed", errorCode, completedAt: new Date() });
    try {
      const ownerNotified = await notifyOwner({ title: "MEDORA scheduled report delivery failed", content: `A scheduled report email delivery failed and was recorded in the report-delivery audit (run ${reportRunId}, definition ${definition.id}).` });
      if (!ownerNotified) console.warn("[Scheduled report] Owner delivery-failure notification was not accepted");
    } catch {
      console.warn("[Scheduled report] Owner delivery-failure notification could not be attempted");
    }
    return { status: "failed" as const, reason: "email_delivery_failed" as const };
  }
}

async function executeAllowlistedQuery(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, definition: typeof reportDefinitions.$inferSelect, periodStart: Date, periodEnd: Date) {
  const scopedBatches = await db.select({ id: inventoryBatches.id, quantityOnHand: inventoryBatches.quantityOnHand, reorderPoint: inventoryBatches.reorderPoint, expiryDate: inventoryBatches.expiryDate }).from(inventoryBatches).innerJoin(branchJurisdictions, eq(branchJurisdictions.branchId, inventoryBatches.branchId)).where(and(eq(inventoryBatches.organizationId, definition.organizationId), eq(branchJurisdictions.jurisdictionId, definition.jurisdictionId ?? -1)));
  const scopedSales = await db.select({ id: sales.id, totalAmount: sales.totalAmount }).from(sales).innerJoin(branchJurisdictions, eq(branchJurisdictions.branchId, sales.branchId)).where(and(eq(sales.organizationId, definition.organizationId), eq(branchJurisdictions.jurisdictionId, definition.jurisdictionId ?? -1), gte(sales.createdAt, periodStart), lte(sales.createdAt, periodEnd)));
  const expiring = scopedBatches.filter(row => row.expiryDate >= periodStart && row.expiryDate <= new Date(periodEnd.getTime() + 30 * 86_400_000));
  const reorder = scopedBatches.filter(row => Number(row.quantityOnHand) <= Number(row.reorderPoint));
  if (definition.queryKey === "procurement.purchases.v1") { const purchases = await db.select({ id: purchaseOrders.id, totalAmount: purchaseOrders.totalAmount, status: purchaseOrders.status }).from(purchaseOrders).innerJoin(branchJurisdictions, eq(branchJurisdictions.branchId, purchaseOrders.branchId)).where(and(eq(purchaseOrders.organizationId, definition.organizationId), eq(branchJurisdictions.jurisdictionId, definition.jurisdictionId ?? -1), gte(purchaseOrders.createdAt, periodStart), lte(purchaseOrders.createdAt, periodEnd))); return { queryKey: definition.queryKey, purchaseCount: purchases.length, totalAmount: purchases.reduce((sum, row) => sum + Number(row.totalAmount), 0), statuses: purchases.reduce<Record<string, number>>((acc, row) => { acc[row.status] = (acc[row.status] ?? 0) + 1; return acc; }, {}) }; }
  if (definition.queryKey === "finance.balances.v1") { const entries = await db.select({ amount: balanceLedgerEntries.amount, direction: balanceLedgerEntries.direction, partyType: balanceLedgerEntries.partyType }).from(balanceLedgerEntries).innerJoin(branchJurisdictions, eq(branchJurisdictions.branchId, balanceLedgerEntries.branchId)).where(and(eq(balanceLedgerEntries.organizationId, definition.organizationId), eq(branchJurisdictions.jurisdictionId, definition.jurisdictionId ?? -1), eq(balanceLedgerEntries.approvalStatus, "approved"), gte(balanceLedgerEntries.createdAt, periodStart), lte(balanceLedgerEntries.createdAt, periodEnd))); return { queryKey: definition.queryKey, entryCount: entries.length, netAmount: entries.reduce((sum, row) => sum + (row.direction === "debit" ? Number(row.amount) : -Number(row.amount)), 0), supplierEntries: entries.filter(row => row.partyType === "supplier").length, customerEntries: entries.filter(row => row.partyType === "customer").length }; }
  if (definition.queryKey === "inventory.alerts.v1") return { queryKey: definition.queryKey, batchesEvaluated: scopedBatches.length, reorderCount: reorder.length, expiringCount: expiring.length };
  if (definition.queryKey === "compliance.expiry.v1") return { queryKey: definition.queryKey, expiringCount: expiring.length, horizonDays: 30 };
  if (definition.queryKey === "sales.daily.v1") return { queryKey: definition.queryKey, salesCount: scopedSales.length, totalAmount: scopedSales.reduce((sum, row) => sum + Number(row.totalAmount), 0) };
  return { queryKey: definition.queryKey, batchesEvaluated: scopedBatches.length, salesCount: scopedSales.length, expiringCount: expiring.length, reorderCount: reorder.length };
}

export async function reportExecutionHandler(req: Request, res: Response) {
  let taskUid: string | undefined;
  try {
    const user = await sdk.authenticateRequest(req);
    taskUid = user.taskUid;
    if (!user.isCron || !taskUid) return res.status(403).json({ error: "cron-only" });
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "database-unavailable" });

    const definition = (await db.select().from(reportDefinitions).where(eq(reportDefinitions.scheduleCronTaskUid, taskUid)).limit(1))[0];
    if (!definition) return res.json({ ok: true, skipped: "orphan" });
    const skipReason = reportExecutionSkipReason(definition);
    if (skipReason) return res.json({ ok: true, skipped: skipReason, definitionId: definition.id });

    const periodEnd = new Date();
    const periodStart = new Date(periodEnd.getTime() - 24 * 60 * 60 * 1000);
    const idempotencyKey = `${taskUid}:${periodEnd.toISOString().slice(0, 10)}`;
    const existing = (await db.select({ id: reportRuns.id, status: reportRuns.status }).from(reportRuns).where(eq(reportRuns.idempotencyKey, idempotencyKey)).limit(1))[0];
    if (existing) return res.json({ ok: true, skipped: "duplicate", runId: existing.id, status: existing.status });

    let output: Record<string, unknown>;
    try {
      output = await executeAllowlistedQuery(db, definition, periodStart, periodEnd);
    } catch (error) {
      const errorCode = boundedReportErrorCode(error);
      const failed = await db.insert(reportRuns).values({ definitionId: definition.id, organizationId: definition.organizationId, jurisdictionId: definition.jurisdictionId, idempotencyKey, periodStart, periodEnd, status: "failed", errorCode, startedAt: periodEnd, finishedAt: new Date() });
      return res.status(500).json({ ok: false, error: "report-execution-failed", errorCode, runId: Number(failed[0].insertId) });
    }
    const inserted = await db.insert(reportRuns).values({ definitionId: definition.id, organizationId: definition.organizationId, jurisdictionId: definition.jurisdictionId, idempotencyKey, periodStart, periodEnd, status: "succeeded", outputRef: JSON.stringify(output).slice(0, 500), startedAt: periodEnd, finishedAt: new Date() });
    const runId = Number(inserted[0].insertId);
    const delivery = definition.deliveryChannel === "email"
      ? await recordEmailDelivery(db, definition, runId, output, periodStart, periodEnd)
      : await recordInAppDelivery(db, definition, runId);
    return res.json({ ok: true, runId, status: "succeeded", output, delivery });
  } catch (error) {
    return res.status(500).json(safeReportTransportError(error));
  }
}

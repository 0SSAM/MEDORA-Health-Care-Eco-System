import { TRPCError } from "@trpc/server";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

const DOMAINS = [
  "fiscalPeriods", "accountsPayable", "accountsReceivable", "budgets", "fixedAssets",
  "warehouseBins", "stockReservations", "warehouseTasks", "cycleCounts", "qualityPlans",
  "qualityInspections", "qualityNonconformances", "capaActions", "boms", "bomLines",
  "workCenters", "routings", "routingOperations", "productionOrders", "productionMaterialMoves",
  "productionReceipts", "projects", "projectTasks", "projectTimesheets", "projectChangeOrders",
  "maintenanceAssets", "maintenancePlans", "maintenanceWorkOrders", "maintenanceParts",
  "fleetVehicles", "fleetDrivers", "fleetTrips", "fleetFuelLogs", "ecommerceStorefronts",
  "ecommerceOrders", "ecommerceOrderLines", "marketingCampaigns", "marketingSegments",
  "campaignAttribution", "esgMetrics", "esgTargets", "idempotency", "workflowTransitions",
] as const;
type Domain = typeof DOMAINS[number];
type Meta = { table: string; org?: string; branch?: string; status?: string };

const TABLES: Partial<Record<Domain, Meta>> = {
  fiscalPeriods: { table: "erp_fiscal_period_controls", org: "organization_id", branch: "branch_id", status: "status" },
  accountsPayable: { table: "erp_accounts_payable_documents", org: "organization_id", branch: "branch_id", status: "status" },
  accountsReceivable: { table: "erp_accounts_receivable_documents", org: "organization_id", branch: "branch_id", status: "status" },
  budgets: { table: "erp_budget_headers", org: "organization_id", branch: "branch_id", status: "status" },
  fixedAssets: { table: "erp_fixed_assets", org: "organization_id", branch: "branch_id", status: "status" },
  warehouseBins: { table: "erp_warehouse_bins", org: "organization_id", branch: "branch_id" },
  stockReservations: { table: "erp_stock_reservations", org: "organization_id", branch: "branch_id", status: "status" },
  warehouseTasks: { table: "erp_warehouse_tasks", org: "organization_id", branch: "branch_id", status: "status" },
  cycleCounts: { table: "erp_cycle_counts", org: "organization_id", branch: "branch_id", status: "status" },
  qualityPlans: { table: "erp_quality_inspection_plans", org: "organization_id" },
  qualityInspections: { table: "erp_quality_inspections", org: "organization_id", branch: "branch_id", status: "release_status" },
  qualityNonconformances: { table: "erp_quality_nonconformances", org: "organization_id", branch: "branch_id", status: "disposition" },
  boms: { table: "erp_boms", org: "organization_id", status: "status" },
  workCenters: { table: "erp_work_centers", org: "organization_id" },
  routings: { table: "erp_routings", org: "organization_id", status: "status" },
  productionOrders: { table: "erp_production_orders", org: "organization_id", branch: "branch_id", status: "status" },
  projects: { table: "erp_projects", org: "organization_id", branch: "branch_id", status: "status" },
  maintenanceAssets: { table: "erp_maintenance_assets", org: "organization_id", branch: "branch_id", status: "status" },
  fleetVehicles: { table: "erp_fleet_vehicles", org: "organization_id", status: "status" },
  fleetDrivers: { table: "erp_fleet_drivers", org: "organization_id", status: "status" },
  fleetTrips: { table: "erp_fleet_trips", org: "organization_id", branch: "branch_id", status: "status" },
  ecommerceStorefronts: { table: "erp_ecommerce_storefronts", org: "organization_id", status: "status" },
  ecommerceOrders: { table: "erp_ecommerce_orders", org: "organization_id", branch: "branch_id" },
  marketingCampaigns: { table: "erp_marketing_campaigns", org: "organization_id", status: "status" },
  marketingSegments: { table: "erp_marketing_segments", org: "organization_id" },
  esgMetrics: { table: "erp_esg_metrics", org: "organization_id" },
  esgTargets: { table: "erp_esg_targets", org: "organization_id", status: "status" },
};

const TRANSITIONS: Partial<Record<Domain, readonly string[]>> = {
  fiscalPeriods: ["open", "soft_closed", "closed", "reopened"],
  accountsPayable: ["draft", "approved", "posted", "partially_paid", "paid", "voided"],
  accountsReceivable: ["draft", "approved", "posted", "partially_paid", "paid", "voided"],
  budgets: ["draft", "submitted", "approved", "locked", "superseded"],
  fixedAssets: ["draft", "active", "impaired", "disposed"],
  stockReservations: ["requested", "allocated", "released", "consumed", "cancelled"],
  warehouseTasks: ["queued", "assigned", "in_progress", "completed", "cancelled", "blocked"],
  cycleCounts: ["draft", "in_progress", "submitted", "approved", "rejected"],
  qualityInspections: ["not_applicable", "held", "released", "rejected"],
  qualityNonconformances: ["open", "containment", "corrective_action", "verified", "closed", "rejected"],
  boms: ["draft", "approved", "obsolete"],
  routings: ["draft", "approved", "obsolete"],
  productionOrders: ["planned", "released", "in_progress", "paused", "completed", "cancelled"],
  projects: ["draft", "active", "on_hold", "completed", "cancelled"],
  maintenanceAssets: ["active", "down", "retired"],
  fleetVehicles: ["available", "assigned", "maintenance", "inactive"],
  fleetDrivers: ["active", "suspended", "inactive"],
  fleetTrips: ["planned", "dispatched", "in_progress", "completed", "cancelled"],
  ecommerceStorefronts: ["draft", "active", "suspended"],
  marketingCampaigns: ["draft", "scheduled", "running", "paused", "completed", "cancelled"],
  esgTargets: ["draft", "approved", "active", "achieved", "missed"],
};

async function dbOrThrow() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  return db;
}

async function assertOrg(ctx: { user: { id: number; role: string } }, organizationId: number) {
  const db = await dbOrThrow();
  if (ctx.user.role === "admin") return db;
  const rows = (await db.execute(sql`SELECT id FROM organization_memberships WHERE organizationId=${organizationId} AND userId=${ctx.user.id} AND active=1 LIMIT 1`)) as any;
  if (!rows?.[0]?.[0]) throw new TRPCError({ code: "FORBIDDEN", message: "Organization scope rejected" });
  return db;
}

function getMeta(domain: Domain) {
  const meta = TABLES[domain];
  if (!meta) throw new TRPCError({ code: "BAD_REQUEST", message: "This ERP domain is a child table and must be reached through its parent workflow" });
  return meta;
}

export const enterpriseErpRouter = router({
  domains: protectedProcedure.query(() => DOMAINS),

  health: protectedProcedure.input(z.object({ organizationId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = await assertOrg(ctx, input.organizationId);
    const counts: Record<string, number> = {};
    for (const domain of DOMAINS) {
      const m = TABLES[domain];
      if (!m?.org) continue;
      const rows = (await db.execute(sql`SELECT COUNT(*) AS count FROM ${sql.raw(m.table)} WHERE ${sql.raw(m.org)}=${input.organizationId}`)) as any;
      counts[domain] = Number(rows?.[0]?.[0]?.count ?? 0);
    }
    return { organizationId: input.organizationId, counts, generatedAt: new Date().toISOString() };
  }),

  list: protectedProcedure.input(z.object({
    organizationId: z.number().int().positive(), domain: z.enum(DOMAINS), branchId: z.number().int().positive().optional(),
    status: z.string().max(40).optional(), limit: z.number().int().min(1).max(200).default(50),
  })).query(async ({ ctx, input }) => {
    const db = await assertOrg(ctx, input.organizationId);
    const m = getMeta(input.domain);
    const filters = [sql`${sql.raw(m.org!)}=${input.organizationId}`];
    if (m.branch && input.branchId) filters.push(sql`${sql.raw(m.branch)}=${input.branchId}`);
    if (m.status && input.status) filters.push(sql`${sql.raw(m.status)}=${input.status}`);
    const rows = (await db.execute(sql`SELECT * FROM ${sql.raw(m.table)} WHERE ${sql.join(filters, sql` AND `)} ORDER BY id DESC LIMIT ${input.limit}`)) as any;
    return rows?.[0] ?? [];
  }),

  transition: protectedProcedure.input(z.object({
    organizationId: z.number().int().positive(), domain: z.enum(DOMAINS), id: z.number().int().positive(),
    toStatus: z.string().max(40), reason: z.string().max(1000).optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await assertOrg(ctx, input.organizationId);
    const m = getMeta(input.domain);
    const statusColumn = m.status;
    if (!statusColumn || !TRANSITIONS[input.domain]?.includes(input.toStatus)) throw new TRPCError({ code: "BAD_REQUEST", message: "Unsupported or unsafe workflow transition" });
    return db.transaction(async (tx: any) => {
      const rows = (await tx.execute(sql`SELECT id, ${sql.raw(statusColumn)} AS current_status FROM ${sql.raw(m.table)} WHERE id=${input.id} AND ${sql.raw(m.org!)}=${input.organizationId} LIMIT 1 FOR UPDATE`)) as any;
      const current = rows?.[0]?.[0];
      if (!current) throw new TRPCError({ code: "NOT_FOUND", message: "ERP record not found in organization scope" });
      const allowedFrom = TRANSITIONS[input.domain]!;
      if (current.current_status && !allowedFrom.includes(String(current.current_status))) throw new TRPCError({ code: "CONFLICT", message: "Current ERP state is outside the controlled workflow" });
      if (String(current.current_status) === input.toStatus) return { ok: true, id: input.id, domain: input.domain, fromStatus: input.toStatus, status: input.toStatus };
      const updated = (await tx.execute(sql`UPDATE ${sql.raw(m.table)} SET ${sql.raw(statusColumn)}=${input.toStatus} WHERE id=${input.id} AND ${sql.raw(m.org!)}=${input.organizationId} AND ${sql.raw(statusColumn)}=${current.current_status}`)) as any;
      if (!updated?.[0]?.affectedRows) throw new TRPCError({ code: "CONFLICT", message: "ERP record changed concurrently; transition was not applied" });
      await tx.execute(sql`INSERT INTO erp_workflow_state_transitions (organization_id, entity_type, entity_id, from_state, to_state, actor_user_id, reason) VALUES (${input.organizationId}, ${input.domain}, ${String(input.id)}, ${current.current_status ?? null}, ${input.toStatus}, ${ctx.user.id}, ${input.reason ?? null})`);
      return { ok: true, id: input.id, domain: input.domain, fromStatus: current.current_status ?? null, status: input.toStatus };
    });
  }),

  idempotency: protectedProcedure.input(z.object({
    organizationId: z.number().int().positive(), operationKey: z.string().min(8).max(160),
    operationType: z.string().min(2).max(100), requestHash: z.string().min(16).max(128),
  })).mutation(async ({ ctx, input }) => {
    const db = await assertOrg(ctx, input.organizationId);
    try {
      const inserted = (await db.execute(sql`INSERT INTO erp_transaction_idempotency (organization_id, operation_key, operation_type, request_hash) VALUES (${input.organizationId}, ${input.operationKey}, ${input.operationType}, ${input.requestHash})`)) as any;
      return { replay: false, recordId: Number(inserted?.[0]?.insertId ?? 0) || undefined };
    } catch (error: any) {
      // The unique (organization_id, operation_key) constraint arbitrates concurrent requests.
      // Re-read after a duplicate-key race and only replay an exactly matching request.
      if (String(error?.code) !== "ER_DUP_ENTRY" && Number(error?.errno) !== 1062) throw error;
      const existing = (await db.execute(sql`SELECT id, operation_type, request_hash, response_json FROM erp_transaction_idempotency WHERE organization_id=${input.organizationId} AND operation_key=${input.operationKey} LIMIT 1`)) as any;
      const row = existing?.[0]?.[0];
      if (!row) throw new TRPCError({ code: "CONFLICT", message: "Idempotency key collision could not be resolved" });
      if (String(row.request_hash) !== input.requestHash || String(row.operation_type) !== input.operationType) throw new TRPCError({ code: "CONFLICT", message: "Idempotency key reused with a different request" });
      return { replay: true, recordId: Number(row.id), response: row.response_json ?? null };
    }
  }),

  fiscalPeriod: router({
    close: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const db = await assertOrg(ctx, input.organizationId);
      const result = (await db.execute(sql`UPDATE erp_fiscal_period_controls SET status='closed', closed_by_user_id=${ctx.user.id}, closed_at=CURRENT_TIMESTAMP WHERE id=${input.id} AND organization_id=${input.organizationId} AND status IN ('open','soft_closed')`)) as any;
      if (!result?.[0]?.affectedRows) throw new TRPCError({ code: "CONFLICT", message: "Fiscal period cannot be closed from its current state" });
      return { ok: true };
    }),
    reopen: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), id: z.number().int().positive(), reason: z.string().min(5).max(500) })).mutation(async ({ ctx, input }) => {
      const db = await assertOrg(ctx, input.organizationId);
      const result = (await db.execute(sql`UPDATE erp_fiscal_period_controls SET status='reopened', reopen_reason=${input.reason}, closed_by_user_id=NULL, closed_at=NULL WHERE id=${input.id} AND organization_id=${input.organizationId} AND status='closed'`)) as any;
      if (!result?.[0]?.affectedRows) throw new TRPCError({ code: "CONFLICT", message: "Only a closed fiscal period can be reopened" });
      return { ok: true };
    }),
  }),
});

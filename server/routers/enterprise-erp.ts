import { TRPCError } from "@trpc/server";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
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
type TableMeta = { table: string; org: string | null; branch: string | null; status: string | null };

const TABLES: Record<Domain, TableMeta> = {
  fiscalPeriods: { table: "erp_fiscal_period_controls", org: "organization_id", branch: "branch_id", status: "status" },
  accountsPayable: { table: "erp_accounts_payable_documents", org: "organization_id", branch: "branch_id", status: "status" },
  accountsReceivable: { table: "erp_accounts_receivable_documents", org: "organization_id", branch: "branch_id", status: "status" },
  budgets: { table: "erp_budget_headers", org: "organization_id", branch: "branch_id", status: "status" },
  fixedAssets: { table: "erp_fixed_assets", org: "organization_id", branch: "branch_id", status: "status" },
  warehouseBins: { table: "erp_warehouse_bins", org: "organization_id", branch: "branch_id", status: null },
  stockReservations: { table: "erp_stock_reservations", org: "organization_id", branch: "branch_id", status: "status" },
  warehouseTasks: { table: "erp_warehouse_tasks", org: "organization_id", branch: "branch_id", status: "status" },
  cycleCounts: { table: "erp_cycle_counts", org: "organization_id", branch: "branch_id", status: "status" },
  qualityPlans: { table: "erp_quality_inspection_plans", org: "organization_id", branch: null, status: null },
  qualityInspections: { table: "erp_quality_inspections", org: "organization_id", branch: "branch_id", status: "release_status" },
  qualityNonconformances: { table: "erp_quality_nonconformances", org: "organization_id", branch: "branch_id", status: "disposition" },
  capaActions: { table: "erp_quality_capa_actions", org: null, branch: null, status: "effectiveness_result" },
  boms: { table: "erp_boms", org: "organization_id", branch: null, status: "status" },
  bomLines: { table: "erp_bom_lines", org: null, branch: null, status: null },
  workCenters: { table: "erp_work_centers", org: "organization_id", branch: null, status: null },
  routings: { table: "erp_routings", org: "organization_id", branch: null, status: "status" },
  routingOperations: { table: "erp_routing_operations", org: null, branch: null, status: null },
  productionOrders: { table: "erp_production_orders", org: "organization_id", branch: "branch_id", status: "status" },
  productionMaterialMoves: { table: "erp_production_material_moves", org: null, branch: null, status: "movement_type" },
  productionReceipts: { table: "erp_production_receipts", org: null, branch: null, status: null },
  projects: { table: "erp_projects", org: "organization_id", branch: "branch_id", status: "status" },
  projectTasks: { table: "erp_project_tasks", org: null, branch: null, status: "status" },
  projectTimesheets: { table: "erp_project_timesheets", org: null, branch: null, status: "status" },
  projectChangeOrders: { table: "erp_project_change_orders", org: null, branch: null, status: "status" },
  maintenanceAssets: { table: "erp_maintenance_assets", org: "organization_id", branch: "branch_id", status: "status" },
  maintenancePlans: { table: "erp_maintenance_plans", org: null, branch: null, status: "status" },
  maintenanceWorkOrders: { table: "erp_maintenance_work_orders", org: "organization_id", branch: "branch_id", status: "status" },
  maintenanceParts: { table: "erp_maintenance_parts", org: null, branch: null, status: null },
  fleetVehicles: { table: "erp_fleet_vehicles", org: "organization_id", branch: "branch_id", status: "status" },
  fleetDrivers: { table: "erp_fleet_drivers", org: "organization_id", branch: "branch_id", status: "status" },
  fleetTrips: { table: "erp_fleet_trips", org: "organization_id", branch: "branch_id", status: "status" },
  fleetFuelLogs: { table: "erp_fleet_fuel_logs", org: null, branch: null, status: null },
  ecommerceStorefronts: { table: "erp_ecommerce_storefronts", org: "organization_id", branch: "branch_id", status: "status" },
  ecommerceOrders: { table: "erp_ecommerce_orders", org: "organization_id", branch: "branch_id", status: "status" },
  ecommerceOrderLines: { table: "erp_ecommerce_order_lines", org: null, branch: null, status: null },
  marketingCampaigns: { table: "erp_marketing_campaigns", org: "organization_id", branch: null, status: "status" },
  marketingSegments: { table: "erp_marketing_segments", org: "organization_id", branch: null, status: "status" },
  campaignAttribution: { table: "erp_campaign_attribution", org: null, branch: null, status: null },
  esgMetrics: { table: "erp_esg_metrics", org: "organization_id", branch: "branch_id", status: null },
  esgTargets: { table: "erp_esg_targets", org: "organization_id", branch: null, status: "status" },
  idempotency: { table: "erp_transaction_idempotency", org: "organization_id", branch: null, status: "status" },
  workflowTransitions: { table: "erp_workflow_state_transitions", org: "organization_id", branch: "branch_id", status: "status" },
};

const TRANSITIONS: Record<Domain, readonly string[]> = {
  fiscalPeriods: ["open", "soft_closed", "closed", "reopened"],
  accountsPayable: ["draft", "approved", "posted", "partially_paid", "paid", "voided"],
  accountsReceivable: ["draft", "approved", "posted", "partially_paid", "paid", "voided"],
  budgets: ["draft", "submitted", "approved", "locked", "superseded"],
  fixedAssets: ["draft", "active", "impaired", "disposed"],
  warehouseBins: [], stockReservations: ["requested", "allocated", "released", "consumed", "cancelled"],
  warehouseTasks: ["queued", "assigned", "in_progress", "completed", "cancelled", "blocked"],
  cycleCounts: ["draft", "in_progress", "submitted", "approved", "rejected"],
  qualityPlans: [], qualityInspections: ["not_applicable", "held", "released", "rejected"],
  qualityNonconformances: ["open", "containment", "corrective_action", "verified", "closed", "rejected"],
  capaActions: ["pending", "effective", "ineffective"], boms: ["draft", "approved", "obsolete"], bomLines: [],
  workCenters: [], routings: ["draft", "approved", "obsolete"], routingOperations: [],
  productionOrders: ["planned", "released", "in_progress", "paused", "completed", "cancelled"],
  productionMaterialMoves: ["issue", "return", "scrap"], productionReceipts: [],
  projects: ["draft", "planned", "active", "on_hold", "completed", "cancelled"],
  projectTasks: ["todo", "in_progress", "blocked", "done", "cancelled"],
  projectTimesheets: ["draft", "submitted", "approved", "rejected"],
  projectChangeOrders: ["draft", "submitted", "approved", "rejected", "implemented"],
  maintenanceAssets: ["active", "inactive", "retired"], maintenancePlans: ["draft", "active", "inactive"],
  maintenanceWorkOrders: ["draft", "scheduled", "in_progress", "completed", "cancelled"], maintenanceParts: [],
  fleetVehicles: ["active", "maintenance", "inactive", "retired"], fleetDrivers: ["active", "inactive"],
  fleetTrips: ["planned", "dispatched", "in_transit", "completed", "cancelled"], fleetFuelLogs: [],
  ecommerceStorefronts: ["draft", "active", "suspended", "closed"],
  ecommerceOrders: ["pending", "confirmed", "paid", "fulfilled", "shipped", "delivered", "cancelled", "refunded"],
  ecommerceOrderLines: [], marketingCampaigns: ["draft", "scheduled", "active", "paused", "completed", "cancelled"],
  marketingSegments: ["draft", "active", "archived"], campaignAttribution: [], esgMetrics: [],
  esgTargets: ["draft", "active", "achieved", "missed", "cancelled"], idempotency: ["started", "completed", "failed"],
  workflowTransitions: ["applied", "rejected"],
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

function meta(domain: Domain) {
  const value = TABLES[domain];
  if (!value) throw new TRPCError({ code: "BAD_REQUEST", message: "Unsupported ERP domain" });
  return value;
}

export const enterpriseErpRouter = router({
  domains: protectedProcedure.query(() => DOMAINS),

  health: protectedProcedure.input(z.object({ organizationId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const db = await assertOrg(ctx, input.organizationId);
    const result: Record<string, number> = {};
    for (const domain of DOMAINS) {
      const m = meta(domain);
      if (!m.org) continue;
      const rows = (await db.execute(sql`SELECT COUNT(*) AS count FROM ${sql.raw(m.table)} WHERE ${sql.raw(m.org)}=${input.organizationId}`)) as any;
      result[domain] = Number(rows?.[0]?.[0]?.count ?? 0);
    }
    return { organizationId: input.organizationId, counts: result, generatedAt: new Date().toISOString() };
  }),

  list: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), domain: z.enum(DOMAINS), branchId: z.number().int().positive().optional(), status: z.string().max(40).optional(), limit: z.number().int().min(1).max(200).default(50) })).query(async ({ ctx, input }) => {
    const db = await assertOrg(ctx, input.organizationId);
    const m = meta(input.domain);
    if (!m.org) throw new TRPCError({ code: "BAD_REQUEST", message: "This child domain must be accessed through its parent workflow" });
    const filters = [sql`${sql.raw(m.org)}=${input.organizationId}`];
    if (m.branch && input.branchId) filters.push(sql`${sql.raw(m.branch)}=${input.branchId}`);
    if (m.status && input.status) filters.push(sql`${sql.raw(m.status)}=${input.status}`);
    const rows = (await db.execute(sql`SELECT * FROM ${sql.raw(m.table)} WHERE ${sql.join(filters, sql` AND `)} ORDER BY id DESC LIMIT ${input.limit}`)) as any;
    return rows?.[0] ?? [];
  }),

  transition: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), domain: z.enum(DOMAINS), id: z.number().int().positive(), toStatus: z.string().max(40), reason: z.string().max(1000).optional() })).mutation(async ({ ctx, input }) => {
    const db = await assertOrg(ctx, input.organizationId);
    const m = meta(input.domain);
    if (!m.org || !m.status || !TRANSITIONS[input.domain].includes(input.toStatus)) throw new TRPCError({ code: "BAD_REQUEST", message: "Unsupported or unsafe workflow transition" });
    const ownership = (await db.execute(sql`SELECT id FROM ${sql.raw(m.table)} WHERE id=${input.id} AND ${sql.raw(m.org)}=${input.organizationId} LIMIT 1`)) as any;
    if (!ownership?.[0]?.[0]) throw new TRPCError({ code: "NOT_FOUND", message: "ERP record not found in organization scope" });
    await db.execute(sql`UPDATE ${sql.raw(m.table)} SET ${sql.raw(m.status)}=${input.toStatus} WHERE id=${input.id} AND ${sql.raw(m.org)}=${input.organizationId}`);
    await db.execute(sql`INSERT INTO erp_workflow_state_transitions (organization_id, branch_id, entity_type, entity_id, from_status, to_status, reason, changed_by_user_id, changed_at, status) SELECT ${input.organizationId}, NULL, ${input.domain}, id, NULL, ${input.toStatus}, ${input.reason ?? null}, ${ctx.user.id}, CURRENT_TIMESTAMP, 'applied' FROM ${sql.raw(m.table)} WHERE id=${input.id} LIMIT 1`);
    return { ok: true, id: input.id, domain: input.domain, status: input.toStatus };
  }),

  idempotency: protectedProcedure.input(z.object({ organizationId: z.number().int().positive(), requestKey: z.string().min(8).max(180), operation: z.string().min(2).max(120), payloadHash: z.string().min(16).max(200) })).mutation(async ({ ctx, input }) => {
    const db = await assertOrg(ctx, input.organizationId);
    const existing = (await db.execute(sql`SELECT id, status, response_json FROM erp_transaction_idempotency WHERE organization_id=${input.organizationId} AND request_key=${input.requestKey} AND operation=${input.operation} LIMIT 1`)) as any;
    if (existing?.[0]?.[0]) return { replay: true, ...existing[0][0] };
    await db.execute(sql`INSERT INTO erp_transaction_idempotency (organization_id, request_key, operation, payload_hash, status, created_by_user_id, created_at) VALUES (${input.organizationId}, ${input.requestKey}, ${input.operation}, ${input.payloadHash}, 'started', ${ctx.user.id}, CURRENT_TIMESTAMP)`);
    return { replay: false, status: "started" };
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

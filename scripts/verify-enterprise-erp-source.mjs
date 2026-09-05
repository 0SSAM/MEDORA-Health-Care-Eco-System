import { readFileSync, existsSync } from "node:fs";

const requiredTables = [
  "erp_fiscal_period_controls", "erp_accounts_payable_documents", "erp_accounts_receivable_documents", "erp_budget_headers", "erp_budget_lines", "erp_fixed_assets", "erp_asset_depreciation_runs", "erp_warehouse_bins", "erp_stock_reservations", "erp_warehouse_tasks", "erp_cycle_counts", "erp_quality_inspection_plans", "erp_quality_inspections", "erp_quality_nonconformances", "erp_quality_capa_actions", "erp_boms", "erp_bom_lines", "erp_work_centers", "erp_routings", "erp_routing_operations", "erp_production_orders", "erp_production_material_moves", "erp_production_receipts", "erp_projects", "erp_project_tasks", "erp_project_timesheets", "erp_project_change_orders", "erp_maintenance_assets", "erp_maintenance_plans", "erp_maintenance_work_orders", "erp_maintenance_parts", "erp_fleet_vehicles", "erp_fleet_drivers", "erp_fleet_trips", "erp_fleet_fuel_logs", "erp_ecommerce_storefronts", "erp_ecommerce_orders", "erp_ecommerce_order_lines", "erp_marketing_campaigns", "erp_marketing_segments", "erp_campaign_attribution", "erp_esg_metrics", "erp_esg_targets", "erp_transaction_idempotency", "erp_workflow_state_transitions",
];

const migrationPath = "drizzle/0047_enterprise_erp_completion.sql";
const routerPath = "server/routers/enterprise-erp.ts";
const visualPath = "client/src/pages/Welcome.tsx";

for (const path of [migrationPath, routerPath, visualPath]) {
  if (!existsSync(path)) throw new Error(`Missing required audit target: ${path}`);
}

const migration = readFileSync(migrationPath, "utf8");
const router = readFileSync(routerPath, "utf8");
const visual = readFileSync(visualPath, "utf8");

const missingTables = requiredTables.filter(table => !migration.includes(`CREATE TABLE IF NOT EXISTS ${table}`));
if (missingTables.length) throw new Error(`ERP migration is missing tables: ${missingTables.join(", ")}`);

for (const token of ["organization_id", "operation_key", "operation_type", "request_hash", "from_state", "to_state", "actor_user_id"]) {
  if (!migration.includes(token)) throw new Error(`ERP migration missing workflow/idempotency field: ${token}`);
}

for (const token of ["scopedDb", "organization_memberships", "erp_workflow_state_transitions", "erp_transaction_idempotency", "fiscalPeriod", "transition", "health"]) {
  if (!router.includes(token)) throw new Error(`ERP router contract missing: ${token}`);
}

const visualChecks = {
  bilingualCopy: visual.includes("language === \"en\"") && visual.includes("منظومة الرعاية الصحية المتكاملة"),
  rtl: visual.includes("dir={direction}"),
  accessibleBrand: visual.includes('role="img"') && visual.includes('aria-label='),
  responsiveLayout: /sm:|md:|lg:/.test(visual),
  touchFriendly: /min-h-|h-\d+|p-\d+/.test(visual),
  reducedExternalDependency: visual.includes("public preview must stay independent of production auth/tRPC APIs"),
};

const visualFailures = Object.entries(visualChecks).filter(([, ok]) => !ok).map(([name]) => name);
if (visualFailures.length) throw new Error(`Visual contract failures: ${visualFailures.join(", ")}`);

console.log(JSON.stringify({
  ok: true,
  enterpriseTables: requiredTables.length,
  sourceContracts: ["scoped tenant access", "workflow transition audit", "transaction idempotency", "fiscal period governance"],
  visualContracts: Object.keys(visualChecks).filter(key => visualChecks[key]),
}, null, 2));

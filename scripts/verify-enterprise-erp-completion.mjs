import "dotenv/config";
import mysql from "mysql2/promise";

const requiredTables = [
  "erp_fiscal_period_controls",
  "erp_accounts_payable_documents",
  "erp_accounts_receivable_documents",
  "erp_budget_headers",
  "erp_budget_lines",
  "erp_fixed_assets",
  "erp_asset_depreciation_runs",
  "erp_warehouse_bins",
  "erp_stock_reservations",
  "erp_warehouse_tasks",
  "erp_cycle_counts",
  "erp_quality_inspection_plans",
  "erp_quality_inspections",
  "erp_quality_nonconformances",
  "erp_quality_capa_actions",
  "erp_boms",
  "erp_bom_lines",
  "erp_work_centers",
  "erp_routings",
  "erp_routing_operations",
  "erp_production_orders",
  "erp_production_material_moves",
  "erp_production_receipts",
  "erp_projects",
  "erp_project_tasks",
  "erp_project_timesheets",
  "erp_project_change_orders",
  "erp_maintenance_assets",
  "erp_maintenance_plans",
  "erp_maintenance_work_orders",
  "erp_maintenance_parts",
  "erp_fleet_vehicles",
  "erp_fleet_drivers",
  "erp_fleet_trips",
  "erp_fleet_fuel_logs",
  "erp_ecommerce_storefronts",
  "erp_ecommerce_orders",
  "erp_ecommerce_order_lines",
  "erp_marketing_campaigns",
  "erp_marketing_segments",
  "erp_campaign_attribution",
  "erp_esg_metrics",
  "erp_esg_targets",
  "erp_transaction_idempotency",
  "erp_workflow_state_transitions",
];

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(2);
}

const connection = await mysql.createConnection(databaseUrl);
try {
  const placeholders = requiredTables.map(() => "?").join(",");
  const [rows] = await connection.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN (${placeholders})`,
    requiredTables,
  );
  const found = new Set(rows.map(row => row.TABLE_NAME));
  const missing = requiredTables.filter(table => !found.has(table));
  console.log(JSON.stringify({
    expected: requiredTables.length,
    found: found.size,
    missing,
    complete: missing.length === 0,
  }, null, 2));
  if (missing.length) process.exitCode = 1;
} finally {
  await connection.end();
}

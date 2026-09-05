-- MEDORA Enterprise ERP Completion Layer
-- Idempotent SQL. This extends the existing healthcare ERP without changing
-- current tables. External integrations remain fail-closed until accredited.

CREATE TABLE IF NOT EXISTS erp_fiscal_period_controls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  branch_id INT NULL,
  period_code VARCHAR(40) NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  status ENUM('open','soft_closed','closed','reopened') NOT NULL DEFAULT 'open',
  closed_by_user_id INT NULL,
  closed_at DATETIME NULL,
  reopen_reason VARCHAR(500) NULL,
  UNIQUE KEY erp_fiscal_period_scope_code (organization_id, branch_id, period_code),
  KEY erp_fiscal_period_scope_dates (organization_id, branch_id, starts_at, ends_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_accounts_payable_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  branch_id INT NULL,
  vendor_id INT NULL,
  document_number VARCHAR(100) NOT NULL,
  document_type ENUM('bill','debit_note','credit_note') NOT NULL DEFAULT 'bill',
  document_date DATETIME NOT NULL,
  due_date DATETIME NULL,
  currency_code VARCHAR(8) NOT NULL DEFAULT 'EGP',
  net_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  gross_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  status ENUM('draft','approved','posted','partially_paid','paid','voided') NOT NULL DEFAULT 'draft',
  posting_reference VARCHAR(120) NULL,
  created_by_user_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY erp_ap_scope_document (organization_id, branch_id, document_number),
  KEY erp_ap_due_status (organization_id, branch_id, status, due_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_accounts_receivable_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  branch_id INT NULL,
  customer_id INT NULL,
  document_number VARCHAR(100) NOT NULL,
  document_type ENUM('invoice','debit_note','credit_note') NOT NULL DEFAULT 'invoice',
  document_date DATETIME NOT NULL,
  due_date DATETIME NULL,
  currency_code VARCHAR(8) NOT NULL DEFAULT 'EGP',
  net_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  gross_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  received_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  status ENUM('draft','approved','posted','partially_paid','paid','voided') NOT NULL DEFAULT 'draft',
  posting_reference VARCHAR(120) NULL,
  created_by_user_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY erp_ar_scope_document (organization_id, branch_id, document_number),
  KEY erp_ar_due_status (organization_id, branch_id, status, due_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_budget_headers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  branch_id INT NULL,
  fiscal_year SMALLINT NOT NULL,
  name VARCHAR(180) NOT NULL,
  version_no INT NOT NULL DEFAULT 1,
  status ENUM('draft','submitted','approved','locked','superseded') NOT NULL DEFAULT 'draft',
  total_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  approved_by_user_id INT NULL,
  approved_at DATETIME NULL,
  created_by_user_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY erp_budget_scope_version (organization_id, branch_id, fiscal_year, version_no),
  KEY erp_budget_status (organization_id, fiscal_year, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_budget_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  budget_id INT NOT NULL,
  account_id INT NULL,
  cost_center_id INT NULL,
  period_no TINYINT NOT NULL,
  amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  committed_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  actual_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  KEY erp_budget_lines_budget (budget_id),
  KEY erp_budget_lines_account (account_id, cost_center_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_fixed_assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  branch_id INT NULL,
  asset_code VARCHAR(80) NOT NULL,
  name VARCHAR(220) NOT NULL,
  category VARCHAR(100) NOT NULL,
  acquisition_date DATETIME NOT NULL,
  acquisition_cost DECIMAL(18,2) NOT NULL,
  residual_value DECIMAL(18,2) NOT NULL DEFAULT 0,
  useful_life_months INT NOT NULL,
  depreciation_method ENUM('straight_line','declining_balance','units_of_production') NOT NULL DEFAULT 'straight_line',
  accumulated_depreciation DECIMAL(18,2) NOT NULL DEFAULT 0,
  status ENUM('draft','active','impaired','disposed') NOT NULL DEFAULT 'active',
  location VARCHAR(220) NULL,
  serial_number VARCHAR(120) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY erp_asset_scope_code (organization_id, branch_id, asset_code),
  KEY erp_asset_status (organization_id, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_asset_depreciation_runs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id INT NOT NULL,
  period_code VARCHAR(40) NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  accumulated_after DECIMAL(18,2) NOT NULL,
  journal_reference VARCHAR(120) NULL,
  posted_at DATETIME NULL,
  UNIQUE KEY erp_asset_depr_period (asset_id, period_code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_warehouse_bins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  branch_id INT NOT NULL,
  warehouse_code VARCHAR(60) NOT NULL,
  bin_code VARCHAR(80) NOT NULL,
  zone_code VARCHAR(80) NULL,
  bin_type ENUM('storage','staging','quarantine','picking','packing','receiving','shipping') NOT NULL DEFAULT 'storage',
  active TINYINT NOT NULL DEFAULT 1,
  UNIQUE KEY erp_bin_scope_code (organization_id, branch_id, warehouse_code, bin_code),
  KEY erp_bin_zone (organization_id, branch_id, zone_code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_stock_reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  branch_id INT NOT NULL,
  product_id INT NOT NULL,
  batch_id INT NULL,
  bin_id INT NULL,
  source_type VARCHAR(60) NOT NULL,
  source_id INT NOT NULL,
  quantity DECIMAL(18,3) NOT NULL,
  status ENUM('requested','allocated','released','consumed','cancelled') NOT NULL DEFAULT 'requested',
  expires_at DATETIME NULL,
  created_by_user_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY erp_reservation_source (source_type, source_id, status),
  KEY erp_reservation_stock (organization_id, branch_id, product_id, batch_id, bin_id, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_warehouse_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  branch_id INT NOT NULL,
  task_type ENUM('receive','putaway','pick','pack','ship','transfer','count','quarantine_release') NOT NULL,
  source_type VARCHAR(60) NULL,
  source_id INT NULL,
  from_bin_id INT NULL,
  to_bin_id INT NULL,
  product_id INT NULL,
  batch_id INT NULL,
  quantity DECIMAL(18,3) NULL,
  status ENUM('queued','assigned','in_progress','completed','cancelled','blocked') NOT NULL DEFAULT 'queued',
  assigned_user_id INT NULL,
  completed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY erp_wms_task_queue (organization_id, branch_id, status, task_type),
  KEY erp_wms_task_source (source_type, source_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_cycle_counts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  branch_id INT NOT NULL,
  bin_id INT NOT NULL,
  count_date DATETIME NOT NULL,
  status ENUM('draft','in_progress','submitted','approved','rejected') NOT NULL DEFAULT 'draft',
  expected_lines INT NOT NULL DEFAULT 0,
  counted_lines INT NOT NULL DEFAULT 0,
  variance_value DECIMAL(18,2) NOT NULL DEFAULT 0,
  counted_by_user_id INT NULL,
  approved_by_user_id INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY erp_cycle_count_scope (organization_id, branch_id, count_date, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_quality_inspection_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  name VARCHAR(180) NOT NULL,
  item_type VARCHAR(60) NOT NULL,
  sampling_rule VARCHAR(180) NULL,
  active TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY erp_qc_plan_scope (organization_id, item_type, active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_quality_inspections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  branch_id INT NULL,
  plan_id INT NULL,
  source_type VARCHAR(60) NOT NULL,
  source_id INT NOT NULL,
  result ENUM('pending','passed','failed','conditional') NOT NULL DEFAULT 'pending',
  hold_required TINYINT NOT NULL DEFAULT 0,
  release_status ENUM('not_applicable','held','released','rejected') NOT NULL DEFAULT 'not_applicable',
  inspector_user_id INT NULL,
  inspected_at DATETIME NULL,
  notes VARCHAR(4000) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY erp_qc_inspection_source (source_type, source_id),
  KEY erp_qc_inspection_status (organization_id, result, release_status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_quality_nonconformances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  branch_id INT NULL,
  inspection_id INT NULL,
  reference_code VARCHAR(80) NOT NULL,
  severity ENUM('minor','major','critical') NOT NULL,
  description VARCHAR(4000) NOT NULL,
  disposition ENUM('open','containment','corrective_action','verified','closed','rejected') NOT NULL DEFAULT 'open',
  owner_user_id INT NULL,
  due_at DATETIME NULL,
  closed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY erp_nc_scope_code (organization_id, reference_code),
  KEY erp_nc_status (organization_id, disposition, severity)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_quality_capa_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nonconformance_id INT NOT NULL,
  action_type ENUM('corrective','preventive') NOT NULL,
  description VARCHAR(4000) NOT NULL,
  owner_user_id INT NULL,
  due_at DATETIME NULL,
  effectiveness_result ENUM('pending','effective','ineffective') NOT NULL DEFAULT 'pending',
  completed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY erp_capa_nc (nonconformance_id, effectiveness_result)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_boms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  product_id INT NOT NULL,
  revision VARCHAR(40) NOT NULL,
  effective_from DATETIME NOT NULL,
  effective_to DATETIME NULL,
  status ENUM('draft','approved','obsolete') NOT NULL DEFAULT 'draft',
  yield_quantity DECIMAL(18,3) NOT NULL DEFAULT 1,
  UNIQUE KEY erp_bom_revision (organization_id, product_id, revision),
  KEY erp_bom_effectivity (organization_id, product_id, status, effective_from, effective_to)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_bom_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bom_id INT NOT NULL,
  component_product_id INT NOT NULL,
  quantity DECIMAL(18,3) NOT NULL,
  scrap_percent DECIMAL(8,3) NOT NULL DEFAULT 0,
  operation_sequence INT NULL,
  KEY erp_bom_line_bom (bom_id, operation_sequence)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_work_centers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  code VARCHAR(60) NOT NULL,
  name VARCHAR(180) NOT NULL,
  capacity_per_hour DECIMAL(18,3) NOT NULL DEFAULT 0,
  cost_per_hour DECIMAL(18,2) NOT NULL DEFAULT 0,
  active TINYINT NOT NULL DEFAULT 1,
  UNIQUE KEY erp_work_center_code (organization_id, code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_routings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  product_id INT NOT NULL,
  revision VARCHAR(40) NOT NULL,
  status ENUM('draft','approved','obsolete') NOT NULL DEFAULT 'draft',
  UNIQUE KEY erp_routing_revision (organization_id, product_id, revision)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_routing_operations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  routing_id INT NOT NULL,
  sequence_no INT NOT NULL,
  work_center_id INT NOT NULL,
  setup_minutes DECIMAL(12,2) NOT NULL DEFAULT 0,
  run_minutes DECIMAL(12,2) NOT NULL DEFAULT 0,
  UNIQUE KEY erp_routing_operation_sequence (routing_id, sequence_no)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_production_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  branch_id INT NULL,
  order_number VARCHAR(80) NOT NULL,
  product_id INT NOT NULL,
  bom_id INT NULL,
  routing_id INT NULL,
  planned_quantity DECIMAL(18,3) NOT NULL,
  produced_quantity DECIMAL(18,3) NOT NULL DEFAULT 0,
  status ENUM('planned','released','in_progress','paused','completed','cancelled') NOT NULL DEFAULT 'planned',
  planned_start DATETIME NULL,
  planned_end DATETIME NULL,
  actual_start DATETIME NULL,
  actual_end DATETIME NULL,
  created_by_user_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY erp_production_order_scope_number (organization_id, branch_id, order_number),
  KEY erp_production_status (organization_id, branch_id, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_production_material_moves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  production_order_id INT NOT NULL,
  component_product_id INT NOT NULL,
  batch_id INT NULL,
  quantity DECIMAL(18,3) NOT NULL,
  movement_type ENUM('issue','return','scrap') NOT NULL,
  moved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  moved_by_user_id INT NOT NULL,
  KEY erp_production_material_order (production_order_id, movement_type)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_production_receipts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  production_order_id INT NOT NULL,
  product_id INT NOT NULL,
  batch_id INT NULL,
  quantity DECIMAL(18,3) NOT NULL,
  unit_cost DECIMAL(18,4) NOT NULL DEFAULT 0,
  received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  received_by_user_id INT NOT NULL,
  KEY erp_production_receipt_order (production_order_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  branch_id INT NULL,
  project_code VARCHAR(80) NOT NULL,
  name VARCHAR(220) NOT NULL,
  customer_id INT NULL,
  manager_user_id INT NULL,
  start_date DATETIME NULL,
  end_date DATETIME NULL,
  budget_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  actual_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  status ENUM('draft','active','on_hold','completed','cancelled') NOT NULL DEFAULT 'draft',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY erp_project_scope_code (organization_id, project_code),
  KEY erp_project_status (organization_id, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_project_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  parent_task_id INT NULL,
  task_code VARCHAR(80) NOT NULL,
  name VARCHAR(220) NOT NULL,
  planned_hours DECIMAL(12,2) NOT NULL DEFAULT 0,
  actual_hours DECIMAL(12,2) NOT NULL DEFAULT 0,
  planned_cost DECIMAL(18,2) NOT NULL DEFAULT 0,
  actual_cost DECIMAL(18,2) NOT NULL DEFAULT 0,
  progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  status ENUM('not_started','in_progress','blocked','done','cancelled') NOT NULL DEFAULT 'not_started',
  UNIQUE KEY erp_project_task_code (project_id, task_code),
  KEY erp_project_task_parent (project_id, parent_task_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_project_timesheets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  task_id INT NULL,
  user_id INT NOT NULL,
  work_date DATETIME NOT NULL,
  hours DECIMAL(10,2) NOT NULL,
  billable TINYINT NOT NULL DEFAULT 1,
  billing_rate DECIMAL(18,2) NOT NULL DEFAULT 0,
  approval_status ENUM('draft','submitted','approved','rejected') NOT NULL DEFAULT 'draft',
  approved_by_user_id INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY erp_timesheet_project_date (project_id, work_date),
  KEY erp_timesheet_user_status (user_id, approval_status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_project_change_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  reference_code VARCHAR(80) NOT NULL,
  description VARCHAR(4000) NOT NULL,
  budget_delta DECIMAL(18,2) NOT NULL DEFAULT 0,
  schedule_delta_days INT NOT NULL DEFAULT 0,
  status ENUM('draft','submitted','approved','rejected','implemented') NOT NULL DEFAULT 'draft',
  requested_by_user_id INT NOT NULL,
  approved_by_user_id INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY erp_change_order_reference (project_id, reference_code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_maintenance_assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  branch_id INT NULL,
  asset_code VARCHAR(80) NOT NULL,
  name VARCHAR(220) NOT NULL,
  category VARCHAR(100) NOT NULL,
  serial_number VARCHAR(120) NULL,
  criticality ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  status ENUM('active','down','retired') NOT NULL DEFAULT 'active',
  meter_value DECIMAL(18,3) NULL,
  UNIQUE KEY erp_maintenance_asset_code (organization_id, branch_id, asset_code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_maintenance_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id INT NOT NULL,
  plan_type ENUM('time','meter','condition') NOT NULL,
  interval_value DECIMAL(18,3) NOT NULL,
  last_completed_at DATETIME NULL,
  next_due_at DATETIME NULL,
  active TINYINT NOT NULL DEFAULT 1,
  KEY erp_maintenance_plan_due (asset_id, active, next_due_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_maintenance_work_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id INT NOT NULL,
  plan_id INT NULL,
  work_order_number VARCHAR(80) NOT NULL,
  work_type ENUM('preventive','corrective','inspection','emergency') NOT NULL,
  priority ENUM('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
  status ENUM('open','assigned','in_progress','completed','cancelled') NOT NULL DEFAULT 'open',
  assigned_user_id INT NULL,
  planned_cost DECIMAL(18,2) NOT NULL DEFAULT 0,
  actual_cost DECIMAL(18,2) NOT NULL DEFAULT 0,
  opened_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  UNIQUE KEY erp_maintenance_work_order_number (work_order_number),
  KEY erp_maintenance_work_order_status (asset_id, status, priority)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_maintenance_parts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_order_id INT NOT NULL,
  product_id INT NOT NULL,
  batch_id INT NULL,
  quantity DECIMAL(18,3) NOT NULL,
  unit_cost DECIMAL(18,4) NOT NULL DEFAULT 0,
  KEY erp_maintenance_parts_order (work_order_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_fleet_vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  vehicle_code VARCHAR(80) NOT NULL,
  plate_number VARCHAR(80) NOT NULL,
  vehicle_type VARCHAR(80) NOT NULL,
  status ENUM('available','assigned','maintenance','inactive') NOT NULL DEFAULT 'available',
  odometer DECIMAL(18,2) NOT NULL DEFAULT 0,
  fuel_type VARCHAR(40) NULL,
  UNIQUE KEY erp_fleet_vehicle_code (organization_id, vehicle_code),
  UNIQUE KEY erp_fleet_plate (organization_id, plate_number)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_fleet_drivers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  user_id INT NULL,
  driver_code VARCHAR(80) NOT NULL,
  license_expiry DATETIME NULL,
  status ENUM('active','suspended','inactive') NOT NULL DEFAULT 'active',
  UNIQUE KEY erp_fleet_driver_code (organization_id, driver_code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_fleet_trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  branch_id INT NULL,
  vehicle_id INT NOT NULL,
  driver_id INT NULL,
  route_reference VARCHAR(120) NULL,
  trip_type ENUM('delivery','transfer','service','return') NOT NULL,
  status ENUM('planned','dispatched','in_progress','completed','cancelled') NOT NULL DEFAULT 'planned',
  planned_distance_km DECIMAL(12,2) NULL,
  actual_distance_km DECIMAL(12,2) NULL,
  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  cost_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  KEY erp_fleet_trip_status (organization_id, branch_id, status, started_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_fleet_fuel_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  trip_id INT NULL,
  logged_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  quantity DECIMAL(12,3) NOT NULL,
  unit_cost DECIMAL(18,4) NOT NULL,
  total_cost DECIMAL(18,2) NOT NULL,
  odometer DECIMAL(18,2) NULL,
  KEY erp_fleet_fuel_vehicle_date (vehicle_id, logged_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_ecommerce_storefronts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  code VARCHAR(80) NOT NULL,
  name VARCHAR(180) NOT NULL,
  currency_code VARCHAR(8) NOT NULL DEFAULT 'EGP',
  status ENUM('draft','active','suspended') NOT NULL DEFAULT 'draft',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY erp_storefront_code (organization_id, code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_ecommerce_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  storefront_id INT NOT NULL,
  organization_id INT NOT NULL,
  branch_id INT NULL,
  order_number VARCHAR(100) NOT NULL,
  customer_id INT NULL,
  subtotal DECIMAL(18,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  payment_status ENUM('pending','authorized','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  fulfillment_status ENUM('unfulfilled','allocated','packed','shipped','delivered','cancelled','returned') NOT NULL DEFAULT 'unfulfilled',
  idempotency_key VARCHAR(160) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY erp_ecommerce_order_number (storefront_id, order_number),
  UNIQUE KEY erp_ecommerce_idempotency (storefront_id, idempotency_key),
  KEY erp_ecommerce_fulfillment (organization_id, branch_id, fulfillment_status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_ecommerce_order_lines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity DECIMAL(18,3) NOT NULL,
  unit_price DECIMAL(18,2) NOT NULL,
  tax_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  KEY erp_ecommerce_order_line_order (order_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_marketing_campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  code VARCHAR(80) NOT NULL,
  name VARCHAR(220) NOT NULL,
  channel ENUM('email','sms','whatsapp','push','web','mixed') NOT NULL,
  status ENUM('draft','scheduled','running','paused','completed','cancelled') NOT NULL DEFAULT 'draft',
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  budget_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  consent_required TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY erp_campaign_code (organization_id, code),
  KEY erp_campaign_status (organization_id, status, starts_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_marketing_segments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  name VARCHAR(180) NOT NULL,
  rule_json JSON NOT NULL,
  consent_policy ENUM('opt_in','legitimate_interest','transactional_only') NOT NULL DEFAULT 'opt_in',
  active TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY erp_segment_scope (organization_id, active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_campaign_attribution (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id INT NOT NULL,
  source_type VARCHAR(60) NOT NULL,
  source_id INT NULL,
  conversion_type VARCHAR(80) NOT NULL,
  conversion_value DECIMAL(18,2) NOT NULL DEFAULT 0,
  occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY erp_campaign_attribution_campaign (campaign_id, occurred_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_esg_metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  metric_code VARCHAR(80) NOT NULL,
  period_code VARCHAR(40) NOT NULL,
  value DECIMAL(20,6) NOT NULL,
  unit VARCHAR(40) NOT NULL,
  evidence_reference VARCHAR(500) NULL,
  verified TINYINT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY erp_esg_metric_period (organization_id, metric_code, period_code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_esg_targets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  metric_code VARCHAR(80) NOT NULL,
  baseline_value DECIMAL(20,6) NOT NULL,
  target_value DECIMAL(20,6) NOT NULL,
  target_period VARCHAR(40) NOT NULL,
  status ENUM('draft','approved','active','achieved','missed') NOT NULL DEFAULT 'draft',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY erp_esg_target_scope (organization_id, metric_code, target_period)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_transaction_idempotency (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  operation_key VARCHAR(160) NOT NULL,
  operation_type VARCHAR(100) NOT NULL,
  request_hash VARCHAR(128) NOT NULL,
  response_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY erp_idempotency_scope_key (organization_id, operation_key),
  KEY erp_idempotency_type (organization_id, operation_type, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS erp_workflow_state_transitions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  from_state VARCHAR(80) NULL,
  to_state VARCHAR(80) NOT NULL,
  actor_user_id INT NOT NULL,
  reason VARCHAR(1000) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY erp_transition_entity (organization_id, entity_type, entity_id, created_at),
  KEY erp_transition_actor (organization_id, actor_user_id, created_at)
) ENGINE=InnoDB;

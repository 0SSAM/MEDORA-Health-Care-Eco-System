CREATE TABLE IF NOT EXISTS quality_inspections (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  organizationId INT NOT NULL,
  branchId INT NOT NULL,
  jurisdictionId INT NOT NULL,
  warehouseId INT NOT NULL,
  itemCode VARCHAR(64) NOT NULL,
  batchNo VARCHAR(40) NULL,
  sampleSize INT NOT NULL,
  acceptedUnits INT NOT NULL DEFAULT 0,
  rejectedUnits INT NOT NULL DEFAULT 0,
  status ENUM('draft','in_review','accepted','held','rejected','rework','released') NOT NULL DEFAULT 'draft',
  disposition ENUM('release','hold','reject','rework') NULL,
  inspectorUserId INT NOT NULL,
  approvedByUserId INT NULL,
  reason VARCHAR(500) NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX qi_scope_status (organizationId, branchId, jurisdictionId, status),
  INDEX qi_batch (organizationId, branchId, warehouseId, itemCode, batchNo),
  INDEX qi_created (organizationId, branchId, createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS quality_holds (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  inspectionId BIGINT NOT NULL,
  organizationId INT NOT NULL,
  branchId INT NOT NULL,
  jurisdictionId INT NOT NULL,
  warehouseId INT NOT NULL,
  itemCode VARCHAR(64) NOT NULL,
  batchNo VARCHAR(40) NULL,
  quantity INT NOT NULL,
  status ENUM('active','released') NOT NULL DEFAULT 'active',
  createdByUserId INT NOT NULL,
  releasedByUserId INT NULL,
  releaseReason VARCHAR(500) NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  releasedAt TIMESTAMP NULL,
  UNIQUE KEY qh_active_inspection (inspectionId, status),
  INDEX qh_stock_scope (organizationId, branchId, warehouseId, itemCode, batchNo, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS quality_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  inspectionId BIGINT NULL,
  holdId BIGINT NULL,
  organizationId INT NOT NULL,
  branchId INT NOT NULL,
  jurisdictionId INT NOT NULL,
  eventType VARCHAR(64) NOT NULL,
  actorUserId INT NOT NULL,
  payloadJson TEXT NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX qe_scope_created (organizationId, branchId, jurisdictionId, createdAt),
  INDEX qe_inspection (inspectionId, createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

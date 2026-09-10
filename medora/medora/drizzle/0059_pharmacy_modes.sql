CREATE TABLE IF NOT EXISTS stock_transfer_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizationId INT NOT NULL,
  fromBranchId INT NOT NULL,
  toBranchId INT NOT NULL,
  itemCode VARCHAR(64) NOT NULL,
  qty INT NOT NULL,
  reason VARCHAR(200) NULL,
  status ENUM('requested','approved','in_transit','received','cancelled') NOT NULL DEFAULT 'requested',
  requestedByUserId INT NOT NULL DEFAULT 0,
  approvedByUserId INT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX str_org (organizationId, status),
  INDEX str_branches (fromBranchId, toBranchId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ward_stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizationId INT NOT NULL,
  branchId INT NOT NULL,
  wardName VARCHAR(120) NOT NULL,
  itemCode VARCHAR(64) NOT NULL,
  onHand INT NOT NULL DEFAULT 0,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ws_unique (organizationId, branchId, wardName, itemCode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS datamatrix_scan_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  organizationId INT NOT NULL,
  branchId INT NOT NULL,
  gtin VARCHAR(14) NULL,
  serial VARCHAR(40) NULL,
  batch VARCHAR(40) NULL,
  expiry DATE NULL,
  valid TINYINT NOT NULL DEFAULT 0,
  scannedByUserId INT NOT NULL DEFAULT 0,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX dm_org (organizationId, valid),
  INDEX dm_gtin (gtin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

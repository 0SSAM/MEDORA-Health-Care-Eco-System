CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizationId INT NOT NULL,
  code VARCHAR(20) NOT NULL,
  nameAr VARCHAR(120) NOT NULL,
  type ENUM('asset','liability','equity','revenue','expense') NOT NULL,
  parentId INT NULL,
  active TINYINT NOT NULL DEFAULT 1,
  UNIQUE KEY coa_org_code (organizationId, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS journal_entries (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  organizationId INT NOT NULL,
  branchId INT NOT NULL,
  entryDate DATE NOT NULL,
  memo VARCHAR(255) NULL,
  status ENUM('draft','posted','void') NOT NULL DEFAULT 'draft',
  createdByUserId INT NOT NULL DEFAULT 0,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX je_org_date (organizationId, entryDate, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS journal_lines (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  journalEntryId BIGINT NOT NULL,
  accountId INT NOT NULL,
  debit DECIMAL(14,2) NOT NULL DEFAULT 0,
  credit DECIMAL(14,2) NOT NULL DEFAULT 0,
  INDEX jl_entry (journalEntryId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  organizationId INT NOT NULL,
  branchId INT NOT NULL,
  direction ENUM('in','out') NOT NULL,
  method ENUM('cash','card','transfer','wallet') NOT NULL DEFAULT 'cash',
  amount DECIMAL(14,2) NOT NULL,
  refType VARCHAR(40) NULL,
  refId BIGINT NULL,
  paidAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdByUserId INT NOT NULL DEFAULT 0,
  INDEX pay_org (organizationId, direction, paidAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS warehouses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizationId INT NOT NULL,
  branchId INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  type ENUM('main','branch','ward','quarantine') NOT NULL DEFAULT 'branch',
  active TINYINT NOT NULL DEFAULT 1,
  UNIQUE KEY wh_unique (organizationId, branchId, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS stock_movements (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  organizationId INT NOT NULL,
  branchId INT NOT NULL,
  warehouseId INT NOT NULL,
  itemCode VARCHAR(64) NOT NULL,
  batchNo VARCHAR(40) NULL,
  expiryDate DATE NULL,
  qty INT NOT NULL,
  direction ENUM('in','out','transfer_in','transfer_out','adjust') NOT NULL,
  reason VARCHAR(120) NULL,
  refType VARCHAR(40) NULL,
  refId BIGINT NULL,
  movedByUserId INT NOT NULL DEFAULT 0,
  movedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX sm_wh_item (organizationId, warehouseId, itemCode),
  INDEX sm_expiry (expiryDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS goods_receipts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  organizationId INT NOT NULL,
  branchId INT NOT NULL,
  purchaseOrderId BIGINT NOT NULL,
  receivedByUserId INT NOT NULL DEFAULT 0,
  note VARCHAR(255) NULL,
  receivedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX gr_po (purchaseOrderId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

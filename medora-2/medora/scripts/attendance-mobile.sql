-- attendance mobile (GPS + biometric) schema — applied live 2026-08-28; idempotent
ALTER TABLE employee_attendance
  ADD COLUMN checkInLat DECIMAL(9,6) NULL, ADD COLUMN checkInLng DECIMAL(9,6) NULL,
  ADD COLUMN checkOutLat DECIMAL(9,6) NULL, ADD COLUMN checkOutLng DECIMAL(9,6) NULL,
  ADD COLUMN deviceId VARCHAR(128) NULL, ADD COLUMN deviceModel VARCHAR(80) NULL,
  ADD COLUMN biometricMethod VARCHAR(40) NULL, ADD COLUMN biometricVerifiedAt TIMESTAMP NULL,
  ADD COLUMN geofenceStatus VARCHAR(20) NULL, ADD COLUMN distanceMeters INT NULL,
  ADD COLUMN serverReceivedAt TIMESTAMP NULL, ADD COLUMN riskFlags VARCHAR(255) NULL;
CREATE TABLE IF NOT EXISTS attendance_geofences (
  id INT AUTO_INCREMENT PRIMARY KEY, organizationId INT NOT NULL DEFAULT 1, branchId INT NOT NULL DEFAULT 1,
  name VARCHAR(120) NOT NULL, lat DECIMAL(9,6) NOT NULL, lng DECIMAL(9,6) NOT NULL,
  radiusMeters INT NOT NULL DEFAULT 300, active TINYINT NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS attendance_events (
  id INT AUTO_INCREMENT PRIMARY KEY, organizationId INT NOT NULL DEFAULT 1, branchId INT NOT NULL DEFAULT 1,
  employeeProfileId INT NOT NULL, eventType ENUM('check_in','check_out') NOT NULL,
  outcome ENUM('accepted','rejected') NOT NULL, reason VARCHAR(60) NULL,
  punchHash VARCHAR(64) NULL, lat DECIMAL(9,6) NULL, lng DECIMAL(9,6) NULL,
  deviceId VARCHAR(128) NULL, biometricMethod VARCHAR(40) NULL,
  mockLocationAttested TINYINT NOT NULL DEFAULT 0, emulatorAttested TINYINT NOT NULL DEFAULT 0,
  clockSkewSeconds INT NULL, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_ev_punch (punchHash), KEY idx_ev_date (createdAt)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS kpi_definitions (
  id INT AUTO_INCREMENT PRIMARY KEY, organizationId INT NOT NULL DEFAULT 1, branchId INT NOT NULL DEFAULT 1,
  jurisdictionId INT NOT NULL DEFAULT 0, code VARCHAR(64) NOT NULL,
  nameAr VARCHAR(160), nameEn VARCHAR(160), unit VARCHAR(32), target DECIMAL(12,2), direction ENUM('higher_better','lower_better') DEFAULT 'higher_better',
  active TINYINT NOT NULL DEFAULT 1, createdByUserId INT NULL, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_kpi_def (organizationId, branchId, code)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS kpi_entries (
  id INT AUTO_INCREMENT PRIMARY KEY, kpiDefinitionId INT NOT NULL, periodFrom DATE NOT NULL, periodTo DATE NOT NULL,
  actualValue DECIMAL(14,4), targetValue DECIMAL(14,4), achievedPct DECIMAL(8,2), status VARCHAR(24),
  snapshotJson TEXT, createdByUserId INT NULL, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_kpi_ent (kpiDefinitionId, periodFrom, periodTo)
) ENGINE=InnoDB;

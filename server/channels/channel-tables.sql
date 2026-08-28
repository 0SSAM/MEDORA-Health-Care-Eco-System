-- channel tables (applied live 2026-08-28; idempotent) — see docs/COMMS-INTEGRATION-2026-08-28.md
CREATE TABLE IF NOT EXISTS channel_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizationId INT NOT NULL DEFAULT 1,
  branchId INT NULL,
  channel ENUM('whatsapp','twilio') NOT NULL,
  name VARCHAR(120) NOT NULL,
  config_json TEXT NOT NULL,
  active TINYINT NOT NULL DEFAULT 1,
  createdByUserId INT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_channel_org (organizationId, channel)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS channel_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizationId INT NOT NULL DEFAULT 1,
  branchId INT NULL,
  channel ENUM('whatsapp','telephony') NOT NULL,
  direction ENUM('inbound','outbound') NOT NULL,
  platformMessageId VARCHAR(160) NULL,
  fromNumber VARCHAR(32) NOT NULL,
  toNumber VARCHAR(32) NOT NULL,
  body TEXT NULL,
  mediaType VARCHAR(40) NULL,
  status VARCHAR(40) NULL,
  ticketId INT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_msg_platform (platformMessageId),
  KEY idx_msg_ticket (ticketId)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS channel_calls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizationId INT NOT NULL DEFAULT 1,
  branchId INT NULL,
  platformCallSid VARCHAR(80) NULL,
  direction ENUM('inbound','outbound') NOT NULL,
  fromNumber VARCHAR(32) NOT NULL,
  toNumber VARCHAR(32) NOT NULL,
  status VARCHAR(40) NULL,
  durationSeconds INT NULL,
  recordingUrl TEXT NULL,
  ticketId INT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_call_sid (platformCallSid),
  KEY idx_call_ticket (ticketId)
) ENGINE=InnoDB;

CREATE TABLE `insurance_payer_connectors` (
  `id` int AUTO_INCREMENT NOT NULL,
  `organizationId` int NOT NULL,
  `jurisdictionId` int NOT NULL,
  `payerCode` varchar(80) NOT NULL,
  `connectorType` enum('api','portal') NOT NULL,
  `endpointUrl` varchar(500),
  `status` enum('draft','test_ready','production_ready','suspended') NOT NULL DEFAULT 'draft',
  `contractVersion` varchar(80),
  `authMethod` varchar(80),
  `credentialRef` varchar(180),
  `eligibilityMappingVerified` int NOT NULL DEFAULT 0,
  `benefitsMappingVerified` int NOT NULL DEFAULT 0,
  `preauthMappingVerified` int NOT NULL DEFAULT 0,
  `claimMappingVerified` int NOT NULL DEFAULT 0,
  `remittanceMappingVerified` int NOT NULL DEFAULT 0,
  `rejectionMappingVerified` int NOT NULL DEFAULT 0,
  `attachmentsSupported` int NOT NULL DEFAULT 0,
  `sandboxVerified` int NOT NULL DEFAULT 0,
  `acceptanceCriteriaVerified` int NOT NULL DEFAULT 0,
  `approvedByUserId` int,
  `lastVerifiedAt` timestamp,
  `createdByUserId` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `insurance_payer_connectors_id` PRIMARY KEY(`id`),
  CONSTRAINT `insurance_payer_connectors_scope_payer_idx` UNIQUE(`organizationId`,`jurisdictionId`,`payerCode`)
);
--> statement-breakpoint
CREATE TABLE `insurance_coverage_rules` (
  `id` int AUTO_INCREMENT NOT NULL,
  `organizationId` int NOT NULL,
  `jurisdictionId` int NOT NULL,
  `payerCode` varchar(80) NOT NULL,
  `planCode` varchar(120) NOT NULL,
  `serviceCode` varchar(120) NOT NULL,
  `benefitType` enum('covered','excluded','conditional') NOT NULL,
  `coveragePercent` decimal(6,3),
  `copayAmount` decimal(14,2),
  `deductibleAmount` decimal(14,2),
  `annualLimitAmount` decimal(14,2),
  `visitLimit` int,
  `requiresPreauthorization` int NOT NULL DEFAULT 0,
  `requiresReferral` int NOT NULL DEFAULT 0,
  `exclusionsJson` text,
  `effectiveFrom` timestamp NOT NULL,
  `effectiveTo` timestamp,
  `active` int NOT NULL DEFAULT 1,
  `createdByUserId` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `insurance_coverage_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `insurance_coverage_rules_scope_lookup_idx` ON `insurance_coverage_rules` (`organizationId`,`jurisdictionId`,`payerCode`,`planCode`,`serviceCode`,`active`);
--> statement-breakpoint
CREATE TABLE `insurance_claim_events` (
  `id` int AUTO_INCREMENT NOT NULL,
  `organizationId` int NOT NULL,
  `jurisdictionId` int NOT NULL,
  `branchId` int NOT NULL,
  `claimId` int NOT NULL,
  `fromStatus` varchar(40),
  `toStatus` varchar(40) NOT NULL,
  `eventType` varchar(80) NOT NULL,
  `externalReference` varchar(160),
  `message` varchar(500),
  `payloadHash` varchar(64) NOT NULL,
  `previousHash` varchar(64),
  `recordHash` varchar(64) NOT NULL,
  `createdByUserId` int,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `insurance_claim_events_id` PRIMARY KEY(`id`),
  CONSTRAINT `insurance_claim_events_hash_idx` UNIQUE(`recordHash`)
);
--> statement-breakpoint
CREATE INDEX `insurance_claim_events_claim_idx` ON `insurance_claim_events` (`organizationId`,`jurisdictionId`,`branchId`,`claimId`,`createdAt`);
--> statement-breakpoint
CREATE TABLE `insurance_claim_attachments` (
  `id` int AUTO_INCREMENT NOT NULL,
  `organizationId` int NOT NULL,
  `jurisdictionId` int NOT NULL,
  `branchId` int NOT NULL,
  `claimId` int NOT NULL,
  `documentType` varchar(80) NOT NULL,
  `storageRef` varchar(500) NOT NULL,
  `fileName` varchar(255),
  `contentType` varchar(120),
  `sha256` varchar(64) NOT NULL,
  `status` enum('referenced','verified','rejected') NOT NULL DEFAULT 'referenced',
  `createdByUserId` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `insurance_claim_attachments_id` PRIMARY KEY(`id`),
  CONSTRAINT `insurance_claim_attachments_hash_idx` UNIQUE(`claimId`,`sha256`)
);
--> statement-breakpoint
CREATE INDEX `insurance_claim_attachments_scope_idx` ON `insurance_claim_attachments` (`organizationId`,`jurisdictionId`,`branchId`,`claimId`);
--> statement-breakpoint
CREATE TABLE `insurance_payer_messages` (
  `id` int AUTO_INCREMENT NOT NULL,
  `organizationId` int NOT NULL,
  `jurisdictionId` int NOT NULL,
  `branchId` int NOT NULL,
  `payerCode` varchar(80) NOT NULL,
  `direction` enum('outbound','inbound') NOT NULL,
  `messageType` varchar(80) NOT NULL,
  `claimId` int,
  `preauthorizationId` int,
  `externalReference` varchar(160),
  `payloadHash` varchar(64) NOT NULL,
  `status` enum('queued','blocked','sent','acknowledged','rejected','failed') NOT NULL DEFAULT 'blocked',
  `createdByUserId` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `insurance_payer_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `insurance_payer_messages_scope_idx` ON `insurance_payer_messages` (`organizationId`,`jurisdictionId`,`branchId`,`payerCode`,`createdAt`);
--> statement-breakpoint
CREATE TRIGGER `insurance_claims_status_audit_ai` AFTER INSERT ON `insurance_claims` FOR EACH ROW
INSERT INTO `insurance_claim_events` (`organizationId`,`jurisdictionId`,`branchId`,`claimId`,`fromStatus`,`toStatus`,`eventType`,`externalReference`,`message`,`payloadHash`,`previousHash`,`recordHash`,`createdByUserId`)
VALUES (NEW.`organizationId`,NEW.`jurisdictionId`,NEW.`branchId`,NEW.`id`,NULL,NEW.`status`,'claim_created',NEW.`externalReference`,NULL,SHA2(CONCAT(NEW.`id`,'|',NEW.`status`,'|',COALESCE(NEW.`externalReference`,'')),256),NULL,SHA2(CONCAT(NEW.`id`,'|',NEW.`status`,'|',COALESCE(NEW.`externalReference`,''),'|claim_created'),256),NEW.`createdByUserId`);
--> statement-breakpoint
CREATE TRIGGER `insurance_claims_status_audit_au` AFTER UPDATE ON `insurance_claims` FOR EACH ROW
INSERT INTO `insurance_claim_events` (`organizationId`,`jurisdictionId`,`branchId`,`claimId`,`fromStatus`,`toStatus`,`eventType`,`externalReference`,`message`,`payloadHash`,`previousHash`,`recordHash`,`createdByUserId`)
SELECT NEW.`organizationId`,NEW.`jurisdictionId`,NEW.`branchId`,NEW.`id`,OLD.`status`,NEW.`status`,CASE WHEN OLD.`status` <> NEW.`status` THEN 'claim_status_changed' ELSE 'claim_updated' END,NEW.`externalReference`,NULL,SHA2(CONCAT(NEW.`id`,'|',OLD.`status`,'|',NEW.`status`,'|',COALESCE(NEW.`externalReference`,'')),256),NULL,SHA2(CONCAT(NEW.`id`,'|',OLD.`status`,'|',NEW.`status`,'|',COALESCE(NEW.`externalReference`,''),'|',UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6))),256),NEW.`createdByUserId`;

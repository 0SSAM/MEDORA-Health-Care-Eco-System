CREATE TABLE `healthcare_admissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`branchId` int NOT NULL,
	`patientId` int NOT NULL,
	`encounterId` int NOT NULL,
	`bedId` int,
	`admissionType` enum('planned','emergency','observation','transfer') NOT NULL,
	`status` enum('requested','admitted','on_leave','discharged','cancelled') NOT NULL DEFAULT 'requested',
	`admittedAt` timestamp,
	`dischargedAt` timestamp,
	`dischargeSummaryEncrypted` text,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthcare_admissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `healthcare_beds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`branchId` int NOT NULL,
	`facilityId` int NOT NULL,
	`wardCode` varchar(80) NOT NULL,
	`bedCode` varchar(80) NOT NULL,
	`status` enum('available','occupied','reserved','blocked','maintenance') NOT NULL DEFAULT 'available',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthcare_beds_id` PRIMARY KEY(`id`),
	CONSTRAINT `healthcare_beds_facility_bed_idx` UNIQUE(`facilityId`,`bedCode`)
);
--> statement-breakpoint
CREATE TABLE `healthcare_clinical_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`branchId` int NOT NULL,
	`patientId` int NOT NULL,
	`encounterId` int NOT NULL,
	`orderType` enum('lab','radiology','medication','procedure','referral') NOT NULL,
	`serviceCode` varchar(120) NOT NULL,
	`status` enum('requested','scheduled','in_progress','resulted','cancelled') NOT NULL DEFAULT 'requested',
	`resultEncrypted` text,
	`orderedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthcare_clinical_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insurance_appeals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`branchId` int NOT NULL,
	`claimId` int NOT NULL,
	`status` enum('draft','submitted','under_review','accepted','rejected','withdrawn') NOT NULL DEFAULT 'draft',
	`reasonEncrypted` text,
	`externalReference` varchar(160),
	`credentialGate` enum('not_configured','test_ready','production_ready') NOT NULL DEFAULT 'not_configured',
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `insurance_appeals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insurance_payer_contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`payerCode` varchar(80) NOT NULL,
	`contractReference` varchar(120) NOT NULL,
	`status` enum('draft','pending_review','active','suspended','expired') NOT NULL DEFAULT 'draft',
	`credentialGate` enum('not_configured','test_ready','production_ready') NOT NULL DEFAULT 'not_configured',
	`effectiveFrom` timestamp,
	`effectiveTo` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `insurance_payer_contracts_id` PRIMARY KEY(`id`),
	CONSTRAINT `insurance_payer_contracts_ref_idx` UNIQUE(`organizationId`,`contractReference`)
);
--> statement-breakpoint
CREATE TABLE `insurance_preauthorizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`branchId` int NOT NULL,
	`patientId` int NOT NULL,
	`encounterId` int,
	`payerCode` varchar(80) NOT NULL,
	`requestNumber` varchar(120) NOT NULL,
	`status` enum('draft','ready','submitted','received','approved','partially_approved','rejected','expired','cancelled') NOT NULL DEFAULT 'draft',
	`credentialGate` enum('not_configured','test_ready','production_ready') NOT NULL DEFAULT 'not_configured',
	`requestedAmount` decimal(14,2) NOT NULL DEFAULT '0',
	`approvedAmount` decimal(14,2),
	`externalReference` varchar(160),
	`idempotencyKey` varchar(180) NOT NULL,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `insurance_preauthorizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `insurance_preauth_request_idx` UNIQUE(`organizationId`,`requestNumber`),
	CONSTRAINT `insurance_preauth_idempotency_idx` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE TABLE `insurance_remittances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`branchId` int NOT NULL,
	`payerCode` varchar(80) NOT NULL,
	`remittanceReference` varchar(120) NOT NULL,
	`status` enum('draft','received','under_reconciliation','partially_reconciled','reconciled','disputed') NOT NULL DEFAULT 'draft',
	`credentialGate` enum('not_configured','test_ready','production_ready') NOT NULL DEFAULT 'not_configured',
	`amount` decimal(14,2) NOT NULL DEFAULT '0',
	`reconciliationJson` text,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `insurance_remittances_id` PRIMARY KEY(`id`),
	CONSTRAINT `insurance_remittances_ref_idx` UNIQUE(`organizationId`,`remittanceReference`)
);
--> statement-breakpoint
CREATE INDEX `healthcare_admissions_scope_status_idx` ON `healthcare_admissions` (`organizationId`,`jurisdictionId`,`branchId`,`status`);--> statement-breakpoint
CREATE INDEX `healthcare_admissions_patient_idx` ON `healthcare_admissions` (`organizationId`,`patientId`);--> statement-breakpoint
CREATE INDEX `healthcare_beds_scope_status_idx` ON `healthcare_beds` (`organizationId`,`jurisdictionId`,`branchId`,`status`);--> statement-breakpoint
CREATE INDEX `healthcare_orders_scope_status_idx` ON `healthcare_clinical_orders` (`organizationId`,`jurisdictionId`,`branchId`,`status`);--> statement-breakpoint
CREATE INDEX `healthcare_orders_encounter_idx` ON `healthcare_clinical_orders` (`encounterId`);--> statement-breakpoint
CREATE INDEX `insurance_appeals_scope_status_idx` ON `insurance_appeals` (`organizationId`,`jurisdictionId`,`branchId`,`status`);--> statement-breakpoint
CREATE INDEX `insurance_appeals_claim_idx` ON `insurance_appeals` (`claimId`);--> statement-breakpoint
CREATE INDEX `insurance_payer_contracts_scope_status_idx` ON `insurance_payer_contracts` (`organizationId`,`jurisdictionId`,`status`);--> statement-breakpoint
CREATE INDEX `insurance_preauth_scope_status_idx` ON `insurance_preauthorizations` (`organizationId`,`jurisdictionId`,`branchId`,`status`);--> statement-breakpoint
CREATE INDEX `insurance_remittances_scope_status_idx` ON `insurance_remittances` (`organizationId`,`jurisdictionId`,`branchId`,`status`);
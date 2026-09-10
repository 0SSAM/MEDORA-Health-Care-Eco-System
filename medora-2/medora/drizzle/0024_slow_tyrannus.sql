CREATE TABLE `healthcare_appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`branchId` int NOT NULL,
	`patientId` int NOT NULL,
	`facilityId` int NOT NULL,
	`clinicianUserId` int,
	`specialty` varchar(120) NOT NULL,
	`status` enum('requested','confirmed','checked_in','completed','cancelled','no_show') NOT NULL DEFAULT 'requested',
	`scheduledAt` timestamp NOT NULL,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `healthcare_appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `healthcare_encounters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`branchId` int NOT NULL,
	`patientId` int NOT NULL,
	`facilityId` int NOT NULL,
	`encounterType` enum('primary_care','outpatient','emergency','inpatient','day_surgery','telehealth','follow_up') NOT NULL,
	`status` enum('scheduled','arrived','in_progress','referred','admitted','discharged','cancelled') NOT NULL DEFAULT 'scheduled',
	`attendingUserId` int,
	`chiefComplaintEncrypted` text,
	`clinicalSummaryEncrypted` text,
	`startedAt` timestamp,
	`endedAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthcare_encounters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `healthcare_facilities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`branchId` int NOT NULL,
	`facilityType` enum('government_hospital','private_hospital','primary_care','laboratory','radiology','rehabilitation') NOT NULL,
	`licensingStatus` enum('unverified','pending','licensed','suspended','expired') NOT NULL DEFAULT 'unverified',
	`accreditationStatus` enum('not_ready','readiness','submitted','accredited','expired') NOT NULL DEFAULT 'not_ready',
	`licenseReference` varchar(160),
	`accreditationReference` varchar(160),
	`readinessEvidenceJson` text,
	`active` int NOT NULL DEFAULT 1,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthcare_facilities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `healthcare_patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`branchId` int NOT NULL,
	`nationalIdHash` varchar(128),
	`localMedicalRecordNumber` varchar(80) NOT NULL,
	`fullNameEncrypted` text NOT NULL,
	`dateOfBirthEncrypted` text,
	`sex` enum('female','male','intersex','unknown') NOT NULL DEFAULT 'unknown',
	`phoneHash` varchar(128),
	`consentStatus` enum('pending','granted','withdrawn') NOT NULL DEFAULT 'pending',
	`active` int NOT NULL DEFAULT 1,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthcare_patients_id` PRIMARY KEY(`id`),
	CONSTRAINT `healthcare_patients_scope_mrn_idx` UNIQUE(`organizationId`,`branchId`,`localMedicalRecordNumber`)
);
--> statement-breakpoint
CREATE TABLE `healthcare_referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`fromBranchId` int NOT NULL,
	`toBranchId` int,
	`patientId` int NOT NULL,
	`encounterId` int,
	`specialty` varchar(120) NOT NULL,
	`reasonEncrypted` text,
	`status` enum('requested','accepted','scheduled','completed','declined','cancelled') NOT NULL DEFAULT 'requested',
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthcare_referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insurance_claim_lines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`claimId` int NOT NULL,
	`serviceCode` varchar(120) NOT NULL,
	`description` varchar(240) NOT NULL,
	`quantity` decimal(12,3) NOT NULL DEFAULT '1',
	`requestedAmount` decimal(14,2) NOT NULL,
	`approvedAmount` decimal(14,2),
	`adjudicationStatus` enum('pending','approved','partially_approved','rejected') NOT NULL DEFAULT 'pending',
	`denialCode` varchar(80),
	CONSTRAINT `insurance_claim_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insurance_claims` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`branchId` int NOT NULL,
	`patientId` int NOT NULL,
	`memberId` int,
	`encounterId` int,
	`payerCode` varchar(80) NOT NULL,
	`claimNumber` varchar(120) NOT NULL,
	`status` enum('draft','ready','submitted','received','under_review','approved','partially_approved','rejected','appealed','paid','reconciled','cancelled') NOT NULL DEFAULT 'draft',
	`credentialGate` enum('not_configured','test_ready','production_ready') NOT NULL DEFAULT 'not_configured',
	`totalAmount` decimal(14,2) NOT NULL DEFAULT '0',
	`approvedAmount` decimal(14,2),
	`externalReference` varchar(160),
	`claimJson` text,
	`responseJson` text,
	`idempotencyKey` varchar(180) NOT NULL,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `insurance_claims_id` PRIMARY KEY(`id`),
	CONSTRAINT `insurance_claims_scope_number_idx` UNIQUE(`organizationId`,`claimNumber`),
	CONSTRAINT `insurance_claims_idempotency_idx` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE TABLE `insurance_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`patientId` int NOT NULL,
	`payerCode` varchar(80) NOT NULL,
	`memberReferenceHash` varchar(128) NOT NULL,
	`eligibilityStatus` enum('unknown','pending','active','inactive','expired','blocked') NOT NULL DEFAULT 'unknown',
	`coverageStart` timestamp,
	`coverageEnd` timestamp,
	`sourceStatus` enum('internal','verified_external','unverified_external') NOT NULL DEFAULT 'internal',
	`lastVerifiedAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `insurance_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `insurance_members_payer_member_idx` UNIQUE(`organizationId`,`payerCode`,`memberReferenceHash`)
);
--> statement-breakpoint
CREATE INDEX `healthcare_appointments_schedule_idx` ON `healthcare_appointments` (`organizationId`,`branchId`,`scheduledAt`,`status`);--> statement-breakpoint
CREATE INDEX `healthcare_encounters_patient_time_idx` ON `healthcare_encounters` (`organizationId`,`branchId`,`patientId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `healthcare_encounters_status_idx` ON `healthcare_encounters` (`organizationId`,`branchId`,`status`);--> statement-breakpoint
CREATE INDEX `healthcare_facilities_scope_idx` ON `healthcare_facilities` (`organizationId`,`jurisdictionId`,`branchId`,`facilityType`);--> statement-breakpoint
CREATE INDEX `healthcare_patients_national_hash_idx` ON `healthcare_patients` (`organizationId`,`nationalIdHash`);--> statement-breakpoint
CREATE INDEX `healthcare_referrals_scope_status_idx` ON `healthcare_referrals` (`organizationId`,`jurisdictionId`,`fromBranchId`,`status`);--> statement-breakpoint
CREATE INDEX `insurance_claims_scope_status_idx` ON `insurance_claims` (`organizationId`,`jurisdictionId`,`branchId`,`status`);--> statement-breakpoint
CREATE INDEX `insurance_members_patient_idx` ON `insurance_members` (`organizationId`,`patientId`);
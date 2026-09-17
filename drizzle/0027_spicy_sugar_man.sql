CREATE TABLE `gahar_corrective_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`criterionId` int NOT NULL,
	`title` varchar(240) NOT NULL,
	`riskLevel` enum('low','moderate','high','critical') NOT NULL,
	`status` enum('open','assigned','in_progress','pending_verification','closed','overdue') NOT NULL DEFAULT 'open',
	`ownerUserId` int NOT NULL,
	`dueAt` timestamp,
	`resolutionEncrypted` text,
	`verifiedByUserId` int,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gahar_corrective_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gahar_criteria` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`orientation` enum('patient_centered','organization_centered') NOT NULL,
	`domainCode` varchar(80) NOT NULL,
	`criterionCode` varchar(120) NOT NULL,
	`title` varchar(240) NOT NULL,
	`requirementSummary` text NOT NULL,
	`ownerUserId` int,
	`reviewCycleDays` int NOT NULL DEFAULT 365,
	`status` enum('not_started','in_progress','partially_met','met','not_applicable','blocked') NOT NULL DEFAULT 'not_started',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gahar_criteria_id` PRIMARY KEY(`id`),
	CONSTRAINT `gahar_criteria_profile_code_idx` UNIQUE(`profileId`,`criterionCode`)
);
--> statement-breakpoint
CREATE TABLE `gahar_evidence` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`criterionId` int NOT NULL,
	`evidenceType` enum('policy','procedure','training','audit','indicator','incident','record','attachment') NOT NULL,
	`title` varchar(240) NOT NULL,
	`referenceKey` varchar(180),
	`contentHash` varchar(128),
	`verificationStatus` enum('unverified','verified_internal','rejected','expired') NOT NULL DEFAULT 'unverified',
	`verifiedByUserId` int,
	`validFrom` timestamp,
	`validUntil` timestamp,
	`notesEncrypted` text,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gahar_evidence_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gahar_quality_indicators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` int NOT NULL,
	`code` varchar(100) NOT NULL,
	`name` varchar(240) NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`numerator` decimal(14,4) NOT NULL DEFAULT '0',
	`denominator` decimal(14,4) NOT NULL DEFAULT '0',
	`value` decimal(14,4),
	`sourceStatus` enum('internal_verified','internal_pending','external_blocked') NOT NULL DEFAULT 'internal_pending',
	`reviewedByUserId` int,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gahar_quality_indicators_id` PRIMARY KEY(`id`),
	CONSTRAINT `gahar_indicators_profile_code_period_idx` UNIQUE(`profileId`,`code`,`periodStart`,`periodEnd`)
);
--> statement-breakpoint
CREATE TABLE `gahar_readiness_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`branchId` int NOT NULL,
	`facilityId` int NOT NULL,
	`facilityType` enum('government_hospital','private_hospital','primary_care','laboratory','radiology','rehabilitation','mental_health','extended_care') NOT NULL,
	`standardFamily` varchar(160) NOT NULL,
	`standardVersion` varchar(80) NOT NULL,
	`effectiveFrom` timestamp,
	`status` enum('draft','self_assessment','action_required','ready_for_review','submitted_blocked','archived') NOT NULL DEFAULT 'draft',
	`officialSubmissionGate` enum('not_authorized','test_ready','production_authorized') NOT NULL DEFAULT 'not_authorized',
	`ownerUserId` int NOT NULL,
	`reviewDueAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gahar_readiness_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `gahar_actions_profile_status_idx` ON `gahar_corrective_actions` (`profileId`,`status`);--> statement-breakpoint
CREATE INDEX `gahar_criteria_profile_status_idx` ON `gahar_criteria` (`profileId`,`status`);--> statement-breakpoint
CREATE INDEX `gahar_evidence_criterion_status_idx` ON `gahar_evidence` (`criterionId`,`verificationStatus`);--> statement-breakpoint
CREATE INDEX `gahar_evidence_profile_idx` ON `gahar_evidence` (`profileId`);--> statement-breakpoint
CREATE INDEX `gahar_indicators_profile_period_idx` ON `gahar_quality_indicators` (`profileId`,`periodStart`,`periodEnd`);--> statement-breakpoint
CREATE INDEX `gahar_profiles_scope_status_idx` ON `gahar_readiness_profiles` (`organizationId`,`jurisdictionId`,`branchId`,`status`);--> statement-breakpoint
CREATE INDEX `gahar_profiles_facility_idx` ON `gahar_readiness_profiles` (`facilityId`);
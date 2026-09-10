CREATE TABLE `branch_jurisdictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`branchId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`locationSource` enum('admin_confirmed','manual_override','device') NOT NULL,
	`confirmedByUserId` int NOT NULL,
	`confirmedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `branch_jurisdictions_id` PRIMARY KEY(`id`),
	CONSTRAINT `branch_jurisdictions_branch_idx` UNIQUE(`branchId`)
);
--> statement-breakpoint
CREATE TABLE `compliance_packs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jurisdictionId` int NOT NULL,
	`packVersion` varchar(40) NOT NULL,
	`authorityName` varchar(160) NOT NULL,
	`sourceUrl` varchar(500) NOT NULL,
	`effectiveFrom` timestamp NOT NULL,
	`reviewDueAt` timestamp,
	`status` enum('draft','review','approved','expired','rolled_back') NOT NULL DEFAULT 'draft',
	`rulesJson` text NOT NULL,
	`createdByUserId` int NOT NULL,
	`approvedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `compliance_packs_id` PRIMARY KEY(`id`),
	CONSTRAINT `compliance_packs_version_idx` UNIQUE(`jurisdictionId`,`packVersion`)
);
--> statement-breakpoint
CREATE TABLE `compliance_rule_audits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`packId` int NOT NULL,
	`action` enum('created','approved','activated','expired','rolled_back') NOT NULL,
	`actorUserId` int NOT NULL,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `compliance_rule_audits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jurisdiction_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`countryCode` varchar(2) NOT NULL,
	`countryNameAr` varchar(120) NOT NULL,
	`defaultLocale` varchar(16) NOT NULL,
	`currencyCode` varchar(3) NOT NULL,
	`timezone` varchar(64) NOT NULL,
	`taxProfile` varchar(80) NOT NULL,
	`dateFormat` varchar(32) NOT NULL,
	`numberSystem` varchar(16) NOT NULL DEFAULT 'latn',
	`active` int NOT NULL DEFAULT 0,
	`approvedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jurisdiction_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `jurisdiction_profiles_country_idx` UNIQUE(`countryCode`)
);

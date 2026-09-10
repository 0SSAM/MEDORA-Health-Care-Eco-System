CREATE TABLE `organization_memberships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`userId` int NOT NULL,
	`organizationRole` enum('owner','org_admin','compliance_officer','clinical_lead','operations_manager','staff','auditor') NOT NULL,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `organization_memberships_id` PRIMARY KEY(`id`),
	CONSTRAINT `organization_memberships_unique_idx` UNIQUE(`organizationId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationType` enum('government','pharmacy','pharmacy_chain','distributor','insurer','rehabilitation','hospital','laboratory','radiology') NOT NULL,
	`legalName` varchar(240) NOT NULL,
	`displayName` varchar(240) NOT NULL,
	`countryCode` varchar(3) NOT NULL,
	`status` enum('pending','active','suspended','archived') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `branches` ADD `organizationId` int;--> statement-breakpoint
CREATE INDEX `organization_memberships_user_idx` ON `organization_memberships` (`userId`,`active`);--> statement-breakpoint
CREATE INDEX `organizations_name_idx` ON `organizations` (`displayName`);--> statement-breakpoint
CREATE INDEX `organizations_country_idx` ON `organizations` (`countryCode`);
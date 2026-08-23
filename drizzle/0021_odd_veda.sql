CREATE TABLE `promotions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`branchId` int,
	`code` varchar(48) NOT NULL,
	`name` varchar(180) NOT NULL,
	`description` text,
	`discountType` enum('percent','fixed') NOT NULL,
	`discountValue` decimal(12,2) NOT NULL,
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp NOT NULL,
	`usageLimit` int,
	`usageCount` int NOT NULL DEFAULT 0,
	`status` enum('draft','active','paused','expired','archived') NOT NULL DEFAULT 'draft',
	`approvedByUserId` int,
	`approvedAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promotions_id` PRIMARY KEY(`id`),
	CONSTRAINT `promotions_scope_code_idx` UNIQUE(`organizationId`,`jurisdictionId`,`code`)
);
--> statement-breakpoint
CREATE INDEX `promotions_active_idx` ON `promotions` (`organizationId`,`jurisdictionId`,`status`,`startsAt`,`endsAt`);
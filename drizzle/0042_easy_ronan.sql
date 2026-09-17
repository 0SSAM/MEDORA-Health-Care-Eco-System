CREATE TABLE `report_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`reportKey` varchar(100) NOT NULL,
	`name` varchar(180) NOT NULL,
	`title` varchar(180) NOT NULL,
	`subtitle` varchar(240),
	`columnsJson` text NOT NULL,
	`footer` varchar(300),
	`active` int NOT NULL DEFAULT 1,
	`updatedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `report_templates_id` PRIMARY KEY(`id`),
	CONSTRAINT `report_templates_scope_report_idx` UNIQUE(`organizationId`,`branchId`,`jurisdictionId`,`reportKey`)
);
--> statement-breakpoint
CREATE INDEX `report_templates_scope_idx` ON `report_templates` (`organizationId`,`branchId`,`jurisdictionId`);
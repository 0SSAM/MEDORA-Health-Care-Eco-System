CREATE TABLE `report_definitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int,
	`reportKey` varchar(100) NOT NULL,
	`name` varchar(180) NOT NULL,
	`description` text,
	`schedule_cron_task_uid` varchar(65),
	`cronExpression` varchar(40),
	`status` enum('draft','active','paused','archived') NOT NULL DEFAULT 'draft',
	`queryKey` varchar(120) NOT NULL,
	`recipientUserId` int,
	`recipientRole` enum('owner','org_admin','compliance_officer','clinical_lead','operations_manager','staff','auditor'),
	`deliveryChannel` enum('in_app','email','webhook') NOT NULL DEFAULT 'in_app',
	`deliveryEnabled` int NOT NULL DEFAULT 0,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `report_definitions_id` PRIMARY KEY(`id`),
	CONSTRAINT `report_definitions_scope_key_idx` UNIQUE(`organizationId`,`jurisdictionId`,`reportKey`),
	CONSTRAINT `report_definitions_task_uid_idx` UNIQUE(`schedule_cron_task_uid`)
);
--> statement-breakpoint
CREATE TABLE `report_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`definitionId` int NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int,
	`idempotencyKey` varchar(180) NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`status` enum('queued','running','succeeded','failed','skipped') NOT NULL DEFAULT 'queued',
	`outputRef` varchar(500),
	`errorCode` varchar(100),
	`startedAt` timestamp,
	`finishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `report_runs_id` PRIMARY KEY(`id`),
	CONSTRAINT `report_runs_idempotency_idx` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE INDEX `report_definitions_status_idx` ON `report_definitions` (`organizationId`,`status`);--> statement-breakpoint
CREATE INDEX `report_runs_scope_time_idx` ON `report_runs` (`organizationId`,`jurisdictionId`,`createdAt`);
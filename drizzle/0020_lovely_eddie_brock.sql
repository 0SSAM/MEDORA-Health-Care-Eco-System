CREATE TABLE `report_delivery_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportRunId` int NOT NULL,
	`definitionId` int NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int,
	`recipientRole` enum('owner','org_admin','compliance_officer','clinical_lead','operations_manager','staff','auditor'),
	`recipientUserId` int,
	`channel` enum('in_app','email','sms','webhook') NOT NULL DEFAULT 'in_app',
	`status` enum('queued','delivered','skipped','failed') NOT NULL DEFAULT 'queued',
	`notificationId` int,
	`errorCode` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `report_delivery_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `report_delivery_scope_time_idx` ON `report_delivery_attempts` (`organizationId`,`jurisdictionId`,`createdAt`);
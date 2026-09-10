CREATE TABLE `backup_policies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`name` varchar(160) NOT NULL,
	`destinationType` enum('online','offline_export') NOT NULL,
	`storagePrefix` varchar(320),
	`cronExpression` varchar(40) NOT NULL,
	`retentionDays` int NOT NULL DEFAULT 30,
	`encryptionMode` enum('platform_managed','customer_key_required') NOT NULL DEFAULT 'platform_managed',
	`active` int NOT NULL DEFAULT 1,
	`scheduleCronTaskUid` varchar(65),
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `backup_policies_id` PRIMARY KEY(`id`),
	CONSTRAINT `backup_policies_task_uid_idx` UNIQUE(`scheduleCronTaskUid`)
);
--> statement-breakpoint
CREATE TABLE `backup_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`policyId` int NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`taskUid` varchar(65),
	`idempotencyKey` varchar(160) NOT NULL,
	`status` enum('queued','running','succeeded','failed','verified') NOT NULL DEFAULT 'queued',
	`manifestKey` varchar(500),
	`manifestSha256` varchar(64),
	`recordCount` int NOT NULL DEFAULT 0,
	`errorCode` varchar(80),
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `backup_runs_id` PRIMARY KEY(`id`),
	CONSTRAINT `backup_runs_idempotency_idx` UNIQUE(`policyId`,`idempotencyKey`)
);
--> statement-breakpoint
CREATE INDEX `backup_policies_scope_idx` ON `backup_policies` (`organizationId`,`branchId`,`active`);--> statement-breakpoint
CREATE INDEX `backup_runs_policy_time_idx` ON `backup_runs` (`policyId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `backup_runs_scope_idx` ON `backup_runs` (`organizationId`,`branchId`,`status`);
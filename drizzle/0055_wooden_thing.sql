CREATE TABLE `assistant_failure_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`failureKey` varchar(80) NOT NULL,
	`failureCount` int NOT NULL DEFAULT 0,
	`windowStartedAt` timestamp NOT NULL,
	`lastFailedAt` timestamp NOT NULL,
	`lastAlertedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assistant_failure_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `assistant_failure_scope_key_idx` UNIQUE(`organizationId`,`branchId`,`failureKey`)
);
--> statement-breakpoint
CREATE INDEX `assistant_failure_recent_idx` ON `assistant_failure_events` (`organizationId`,`branchId`,`lastFailedAt`);
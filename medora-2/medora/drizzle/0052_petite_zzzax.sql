CREATE TABLE `automation_outbound_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduledJobId` int NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`eventId` varchar(180) NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`status` enum('succeeded','failed','disabled') NOT NULL,
	`attempts` int NOT NULL DEFAULT 1,
	`occurredAt` timestamp NOT NULL,
	`deliveredAt` timestamp,
	`safeErrorCode` varchar(80),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `automation_outbound_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `automation_outbound_events_event_idx` UNIQUE(`eventId`)
);
--> statement-breakpoint
ALTER TABLE `scheduled_jobs` ADD `outboundEventsEnabled` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `scheduled_jobs` ADD `automationFailureNotificationThreshold` int DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE `scheduled_jobs` ADD `consecutiveFailureCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `scheduled_jobs` ADD `lastFailureNotificationCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `scheduled_jobs` ADD `lastOutboundEventAt` timestamp;--> statement-breakpoint
ALTER TABLE `scheduled_jobs` ADD `lastOutboundDeliveryStatus` enum('never','succeeded','failed','disabled') DEFAULT 'never' NOT NULL;--> statement-breakpoint
CREATE INDEX `automation_outbound_events_scope_status_idx` ON `automation_outbound_events` (`organizationId`,`branchId`,`jurisdictionId`,`status`,`createdAt`);
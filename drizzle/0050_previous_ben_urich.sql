ALTER TABLE `scheduled_jobs` ADD `workflowKey` varchar(80) DEFAULT 'legacy' NOT NULL;--> statement-breakpoint
ALTER TABLE `scheduled_jobs` ADD `organizationId` int;--> statement-breakpoint
ALTER TABLE `scheduled_jobs` ADD `branchId` int;--> statement-breakpoint
ALTER TABLE `scheduled_jobs` ADD `jurisdictionId` int;--> statement-breakpoint
ALTER TABLE `scheduled_jobs` ADD `lastRunStatus` enum('never','succeeded','failed','skipped') DEFAULT 'never' NOT NULL;--> statement-breakpoint
ALTER TABLE `scheduled_jobs` ADD `lastRunEvaluatedCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `scheduled_jobs` ADD `lastRunQueuedCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `scheduled_jobs` ADD `lastErrorCode` varchar(80);--> statement-breakpoint
ALTER TABLE `scheduled_jobs` ADD `createdByUserId` int;--> statement-breakpoint
ALTER TABLE `scheduled_jobs` ADD `createdAt` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `scheduled_jobs` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `scheduled_jobs` ADD CONSTRAINT `scheduled_jobs_scope_workflow_idx` UNIQUE(`organizationId`,`branchId`,`jurisdictionId`,`workflowKey`);--> statement-breakpoint
CREATE INDEX `scheduled_jobs_scope_status_idx` ON `scheduled_jobs` (`organizationId`,`branchId`,`jurisdictionId`,`active`);
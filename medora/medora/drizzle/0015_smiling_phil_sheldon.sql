CREATE TABLE `notification_reads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notificationId` int NOT NULL,
	`userId` int NOT NULL,
	`readAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notification_reads_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_reads_unique_idx` UNIQUE(`notificationId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int,
	`branchId` int,
	`audienceRole` enum('all','admin','manager','pharmacist','cashier','org_admin','clinical_lead','operations_manager','staff','auditor') NOT NULL DEFAULT 'all',
	`severity` enum('info','success','warning','critical') NOT NULL DEFAULT 'info',
	`title` varchar(160) NOT NULL,
	`body` varchar(1000) NOT NULL,
	`expiresAt` timestamp,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`active` int NOT NULL DEFAULT 1,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `notification_reads_user_idx` ON `notification_reads` (`userId`,`readAt`);--> statement-breakpoint
CREATE INDEX `notifications_scope_idx` ON `notifications` (`organizationId`,`branchId`,`active`,`createdAt`);
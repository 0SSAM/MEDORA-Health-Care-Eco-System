CREATE TABLE `fraud_cases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`jurisdictionId` int,
	`category` enum('cash','inventory','procurement','prescription','access','identity','data','other') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'low',
	`status` enum('new','under_review','contained','resolved','dismissed') NOT NULL DEFAULT 'new',
	`signalCode` varchar(100) NOT NULL,
	`subjectType` varchar(40),
	`subjectId` varchar(80),
	`summary` varchar(1000) NOT NULL,
	`evidenceJson` text NOT NULL,
	`assignedToUserId` int,
	`resolutionCode` varchar(100),
	`resolutionNote` varchar(1000),
	`createdByUserId` int NOT NULL,
	`resolvedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fraud_cases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `fraud_cases_scope_status_idx` ON `fraud_cases` (`organizationId`,`branchId`,`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `fraud_cases_signal_idx` ON `fraud_cases` (`organizationId`,`signalCode`,`createdAt`);
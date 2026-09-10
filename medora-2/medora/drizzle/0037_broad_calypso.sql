CREATE TABLE `ai_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`jurisdictionId` int,
	`insightType` enum('purchasing_analysis','decision_support','improvement_proposal') NOT NULL,
	`status` enum('generated','under_review','accepted','rejected','dismissed') NOT NULL DEFAULT 'generated',
	`title` varchar(240) NOT NULL,
	`summary` text NOT NULL,
	`evidenceJson` text NOT NULL,
	`recommendationJson` text NOT NULL,
	`confidence` decimal(5,4) NOT NULL,
	`requiresHumanReview` int NOT NULL DEFAULT 1,
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	`reviewNote` varchar(1000),
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `ai_insights_scope_type_idx` ON `ai_insights` (`organizationId`,`branchId`,`jurisdictionId`,`insightType`,`createdAt`);--> statement-breakpoint
CREATE INDEX `ai_insights_status_idx` ON `ai_insights` (`organizationId`,`status`,`createdAt`);
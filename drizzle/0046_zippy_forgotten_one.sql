CREATE TABLE `policy_knowledge_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`jurisdictionId` int,
	`title` varchar(220) NOT NULL,
	`category` varchar(100) NOT NULL,
	`content` text NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`status` enum('draft','pending_review','approved','archived') NOT NULL DEFAULT 'draft',
	`effectiveFrom` timestamp,
	`effectiveTo` timestamp,
	`supersedesId` int,
	`sourceReference` varchar(500),
	`createdByUserId` int NOT NULL,
	`reviewedByUserId` int,
	`reviewedAt` timestamp,
	`reviewNote` varchar(1000),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `policy_knowledge_articles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `policy_knowledge_scope_status_idx` ON `policy_knowledge_articles` (`organizationId`,`branchId`,`status`);--> statement-breakpoint
CREATE INDEX `policy_knowledge_category_idx` ON `policy_knowledge_articles` (`organizationId`,`category`,`status`);--> statement-breakpoint
CREATE INDEX `policy_knowledge_version_idx` ON `policy_knowledge_articles` (`organizationId`,`supersedesId`,`version`);
CREATE TABLE `call_interactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`ticketId` int NOT NULL,
	`userId` int NOT NULL,
	`interactionType` enum('note','message','status_change','assignment','escalation','callback') NOT NULL,
	`summary` text NOT NULL,
	`metadataHash` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `call_interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `call_queue_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int NOT NULL,
	`queueId` int NOT NULL,
	`userId` int NOT NULL,
	`skill` varchar(100),
	`active` int NOT NULL DEFAULT 1,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `call_queue_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `call_queue_members_unique_idx` UNIQUE(`queueId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `call_queues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`name` varchar(160) NOT NULL,
	`skill` varchar(100),
	`slaMinutes` int NOT NULL DEFAULT 60,
	`active` int NOT NULL DEFAULT 1,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `call_queues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`jurisdictionId` int,
	`contactId` int,
	`opportunityId` int,
	`activityType` enum('call','meeting','message','task','note') NOT NULL,
	`subject` varchar(220) NOT NULL,
	`dueAt` timestamp,
	`completedAt` timestamp,
	`assignedToUserId` int,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crm_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`jurisdictionId` int,
	`leadId` int,
	`displayLabel` varchar(180) NOT NULL,
	`contactReferenceHash` varchar(128),
	`consentStatus` enum('unknown','granted','withdrawn','not_required') NOT NULL DEFAULT 'unknown',
	`lifecycle` enum('prospect','active','dormant','archived') NOT NULL DEFAULT 'prospect',
	`ownerUserId` int,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_opportunities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`jurisdictionId` int,
	`contactId` int,
	`title` varchar(220) NOT NULL,
	`stage` enum('discovery','qualified','proposal','negotiation','won','lost') NOT NULL DEFAULT 'discovery',
	`amount` decimal(14,2),
	`currencyCode` varchar(3) NOT NULL DEFAULT 'EGP',
	`probability` int NOT NULL DEFAULT 0,
	`expectedCloseAt` timestamp,
	`ownerUserId` int,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_opportunities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_care_cases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`jurisdictionId` int,
	`customerId` int NOT NULL,
	`caseNumber` varchar(80) NOT NULL,
	`category` enum('question','complaint','follow_up','chronic_care','service_request') NOT NULL,
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`status` enum('new','in_progress','waiting_customer','resolved','closed') NOT NULL DEFAULT 'new',
	`subject` varchar(220) NOT NULL,
	`summary` text NOT NULL,
	`assignedToUserId` int,
	`nextActionAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_care_cases_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_care_cases_number_idx` UNIQUE(`organizationId`,`caseNumber`)
);
--> statement-breakpoint
CREATE TABLE `customer_care_satisfaction` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`caseId` int NOT NULL,
	`score` int NOT NULL,
	`comment` text,
	`capturedAt` timestamp NOT NULL DEFAULT (now()),
	`capturedByUserId` int NOT NULL,
	CONSTRAINT `customer_care_satisfaction_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_care_satisfaction_case_idx` UNIQUE(`organizationId`,`caseId`)
);
--> statement-breakpoint
CREATE TABLE `customer_care_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`caseId` int NOT NULL,
	`assignedToUserId` int,
	`title` varchar(220) NOT NULL,
	`status` enum('open','in_progress','done','cancelled') NOT NULL DEFAULT 'open',
	`dueAt` timestamp,
	`completedAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_care_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hr_contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`jurisdictionId` int,
	`employeeProfileId` int NOT NULL,
	`contractType` enum('permanent','temporary','part_time','consultant') NOT NULL,
	`status` enum('draft','active','expired','terminated') NOT NULL DEFAULT 'draft',
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp,
	`salaryBand` varchar(80),
	`documentRef` varchar(255),
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hr_contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hr_performance_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`employeeProfileId` int NOT NULL,
	`reviewPeriod` varchar(32) NOT NULL,
	`status` enum('draft','submitted','approved') NOT NULL DEFAULT 'draft',
	`score` int,
	`goalsSummary` text,
	`reviewedByUserId` int,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hr_performance_reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `hr_reviews_employee_period_idx` UNIQUE(`organizationId`,`employeeProfileId`,`reviewPeriod`)
);
--> statement-breakpoint
CREATE TABLE `hr_shifts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int NOT NULL,
	`jurisdictionId` int,
	`employeeProfileId` int NOT NULL,
	`shiftDate` timestamp NOT NULL,
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp NOT NULL,
	`status` enum('planned','confirmed','cancelled','completed') NOT NULL DEFAULT 'planned',
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hr_shifts_id` PRIMARY KEY(`id`),
	CONSTRAINT `hr_shifts_employee_date_idx` UNIQUE(`organizationId`,`employeeProfileId`,`shiftDate`)
);
--> statement-breakpoint
CREATE INDEX `call_interactions_ticket_timeline_idx` ON `call_interactions` (`organizationId`,`ticketId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `call_queue_members_scope_idx` ON `call_queue_members` (`organizationId`,`branchId`,`active`);--> statement-breakpoint
CREATE INDEX `call_queues_scope_active_idx` ON `call_queues` (`organizationId`,`branchId`,`active`);--> statement-breakpoint
CREATE INDEX `crm_activities_scope_due_idx` ON `crm_activities` (`organizationId`,`branchId`,`dueAt`);--> statement-breakpoint
CREATE INDEX `crm_contacts_scope_lifecycle_idx` ON `crm_contacts` (`organizationId`,`branchId`,`lifecycle`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `crm_contacts_hash_idx` ON `crm_contacts` (`organizationId`,`contactReferenceHash`);--> statement-breakpoint
CREATE INDEX `crm_opportunities_scope_stage_idx` ON `crm_opportunities` (`organizationId`,`branchId`,`stage`,`expectedCloseAt`);--> statement-breakpoint
CREATE INDEX `customer_care_cases_scope_status_idx` ON `customer_care_cases` (`organizationId`,`branchId`,`status`,`priority`);--> statement-breakpoint
CREATE INDEX `customer_care_tasks_scope_due_idx` ON `customer_care_tasks` (`organizationId`,`branchId`,`status`,`dueAt`);--> statement-breakpoint
CREATE INDEX `hr_contracts_employee_status_idx` ON `hr_contracts` (`organizationId`,`employeeProfileId`,`status`);--> statement-breakpoint
CREATE INDEX `hr_shifts_branch_date_idx` ON `hr_shifts` (`organizationId`,`branchId`,`shiftDate`);
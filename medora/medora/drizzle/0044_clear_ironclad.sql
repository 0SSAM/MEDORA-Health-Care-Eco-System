CREATE TABLE `accounting_fiscal_periods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`name` varchar(120) NOT NULL,
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp NOT NULL,
	`status` enum('open','soft_closed','closed') NOT NULL DEFAULT 'open',
	`closedByUserId` int,
	`closedAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accounting_fiscal_periods_id` PRIMARY KEY(`id`),
	CONSTRAINT `accounting_fiscal_periods_scope_name_idx` UNIQUE(`organizationId`,`branchId`,`name`)
);
--> statement-breakpoint
CREATE TABLE `cost_centers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`parentCostCenterId` int,
	`code` varchar(40) NOT NULL,
	`nameAr` varchar(180) NOT NULL,
	`nameEn` varchar(180),
	`active` int NOT NULL DEFAULT 1,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cost_centers_id` PRIMARY KEY(`id`),
	CONSTRAINT `cost_centers_scope_code_idx` UNIQUE(`organizationId`,`branchId`,`code`)
);
--> statement-breakpoint
CREATE TABLE `expense_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expenseId` int NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` varchar(1000) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`fileSize` int NOT NULL,
	`sha256` varchar(64) NOT NULL,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expense_documents_id` PRIMARY KEY(`id`),
	CONSTRAINT `expense_documents_digest_idx` UNIQUE(`organizationId`,`branchId`,`sha256`)
);
--> statement-breakpoint
CREATE TABLE `inter_branch_transfer_lines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transferId` int NOT NULL,
	`organizationId` int NOT NULL,
	`productId` int,
	`quantity` decimal(14,3),
	`unitValue` decimal(14,2),
	`note` varchar(500),
	CONSTRAINT `inter_branch_transfer_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inter_branch_transfers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`sourceBranchId` int NOT NULL,
	`destinationBranchId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`transferType` enum('financial','inventory','mixed') NOT NULL,
	`amount` decimal(14,2),
	`justification` varchar(1000) NOT NULL,
	`status` enum('draft','pending_review','approved','rejected','completed') NOT NULL DEFAULT 'pending_review',
	`sourceJournalGroupId` varchar(100),
	`destinationJournalGroupId` varchar(100),
	`createdByUserId` int NOT NULL,
	`approvedByUserId` int,
	`completedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inter_branch_transfers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `other_expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`fiscalPeriodId` int,
	`costCenterId` int,
	`expenseAccountId` int NOT NULL,
	`paymentAccountId` int NOT NULL,
	`amount` decimal(14,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'EGP',
	`expenseDate` timestamp NOT NULL,
	`title` varchar(180) NOT NULL,
	`justification` varchar(1200) NOT NULL,
	`status` enum('draft','pending_review','approved','rejected','posted') NOT NULL DEFAULT 'pending_review',
	`journalEntryGroupId` varchar(100),
	`createdByUserId` int NOT NULL,
	`approvedByUserId` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `other_expenses_id` PRIMARY KEY(`id`),
	CONSTRAINT `other_expenses_journal_idx` UNIQUE(`journalEntryGroupId`)
);
--> statement-breakpoint
ALTER TABLE `general_ledger_accounts` ADD `parentAccountId` int;--> statement-breakpoint
ALTER TABLE `general_ledger_accounts` ADD `nameEn` varchar(180);--> statement-breakpoint
ALTER TABLE `general_ledger_accounts` ADD `normalBalance` enum('debit','credit') DEFAULT 'debit' NOT NULL;--> statement-breakpoint
ALTER TABLE `general_ledger_accounts` ADD `level` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `general_ledger_accounts` ADD `isPostingAllowed` int DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX `accounting_fiscal_periods_scope_period_idx` ON `accounting_fiscal_periods` (`organizationId`,`branchId`,`startsAt`,`endsAt`);--> statement-breakpoint
CREATE INDEX `cost_centers_parent_idx` ON `cost_centers` (`organizationId`,`parentCostCenterId`);--> statement-breakpoint
CREATE INDEX `expense_documents_expense_idx` ON `expense_documents` (`organizationId`,`branchId`,`expenseId`);--> statement-breakpoint
CREATE INDEX `inter_branch_transfer_lines_transfer_idx` ON `inter_branch_transfer_lines` (`organizationId`,`transferId`);--> statement-breakpoint
CREATE INDEX `inter_branch_transfers_route_idx` ON `inter_branch_transfers` (`organizationId`,`sourceBranchId`,`destinationBranchId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `inter_branch_transfers_status_idx` ON `inter_branch_transfers` (`organizationId`,`status`);--> statement-breakpoint
CREATE INDEX `other_expenses_scope_date_idx` ON `other_expenses` (`organizationId`,`branchId`,`expenseDate`);--> statement-breakpoint
CREATE INDEX `other_expenses_status_idx` ON `other_expenses` (`organizationId`,`status`);--> statement-breakpoint
CREATE INDEX `general_ledger_accounts_parent_idx` ON `general_ledger_accounts` (`organizationId`,`parentAccountId`);--> statement-breakpoint
CREATE INDEX `general_ledger_entries_source_idx` ON `general_ledger_entries` (`organizationId`,`sourceType`,`sourceId`);
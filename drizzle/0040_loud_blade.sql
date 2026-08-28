CREATE TABLE `cash_closures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shiftId` int NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`countedCash` decimal(14,2) NOT NULL,
	`expectedCash` decimal(14,2) NOT NULL,
	`varianceCash` decimal(14,2) NOT NULL,
	`status` enum('submitted','approved','rejected') NOT NULL DEFAULT 'submitted',
	`submittedByUserId` int NOT NULL,
	`approvedByUserId` int,
	`approvedAt` timestamp,
	`note` varchar(800),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cash_closures_id` PRIMARY KEY(`id`),
	CONSTRAINT `cash_closures_shift_idx` UNIQUE(`shiftId`)
);
--> statement-breakpoint
CREATE TABLE `cashier_shifts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`cashierId` int NOT NULL,
	`status` enum('open','closed','pending_review') NOT NULL DEFAULT 'open',
	`openingAmount` decimal(14,2) NOT NULL DEFAULT '0',
	`openedAt` timestamp NOT NULL DEFAULT (now()),
	`closedAt` timestamp,
	`closedByUserId` int,
	`closingAmount` decimal(14,2),
	`expectedAmount` decimal(14,2),
	`varianceAmount` decimal(14,2),
	`closingNote` varchar(800),
	CONSTRAINT `cashier_shifts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_memberships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`customerId` int NOT NULL,
	`planId` int NOT NULL,
	`status` enum('active','expired','cancelled') NOT NULL DEFAULT 'active',
	`startsAt` timestamp NOT NULL DEFAULT (now()),
	`endsAt` timestamp NOT NULL,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_memberships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `general_ledger_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`code` varchar(40) NOT NULL,
	`nameAr` varchar(180) NOT NULL,
	`accountType` enum('asset','liability','equity','revenue','expense') NOT NULL,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `general_ledger_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `general_ledger_accounts_scope_code_idx` UNIQUE(`organizationId`,`branchId`,`code`)
);
--> statement-breakpoint
CREATE TABLE `general_ledger_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`accountId` int NOT NULL,
	`entryGroupId` varchar(80) NOT NULL,
	`debitAmount` decimal(14,2) NOT NULL DEFAULT '0',
	`creditAmount` decimal(14,2) NOT NULL DEFAULT '0',
	`sourceType` varchar(60) NOT NULL,
	`sourceId` varchar(80) NOT NULL,
	`periodStatus` enum('open','closed') NOT NULL DEFAULT 'open',
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `general_ledger_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loyalty_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`customerId` int NOT NULL,
	`pointsBalance` decimal(14,2) NOT NULL DEFAULT '0',
	`status` enum('active','suspended') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loyalty_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `loyalty_members_customer_idx` UNIQUE(`organizationId`,`customerId`)
);
--> statement-breakpoint
CREATE TABLE `loyalty_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int NOT NULL,
	`memberId` int NOT NULL,
	`saleId` int,
	`pointsDelta` decimal(14,2) NOT NULL,
	`reasonCode` varchar(80) NOT NULL,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loyalty_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `membership_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`nameAr` varchar(180) NOT NULL,
	`price` decimal(14,2) NOT NULL,
	`durationDays` int NOT NULL,
	`pointsMultiplier` decimal(6,2) NOT NULL DEFAULT '1',
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `membership_plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `membership_plans_org_name_idx` UNIQUE(`organizationId`,`nameAr`)
);
--> statement-breakpoint
CREATE INDEX `cash_closures_scope_time_idx` ON `cash_closures` (`organizationId`,`branchId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `cashier_shifts_scope_status_idx` ON `cashier_shifts` (`organizationId`,`branchId`,`status`,`openedAt`);--> statement-breakpoint
CREATE INDEX `cashier_shifts_cashier_status_idx` ON `cashier_shifts` (`cashierId`,`status`);--> statement-breakpoint
CREATE INDEX `customer_memberships_customer_status_idx` ON `customer_memberships` (`organizationId`,`customerId`,`status`,`endsAt`);--> statement-breakpoint
CREATE INDEX `general_ledger_entries_group_idx` ON `general_ledger_entries` (`organizationId`,`entryGroupId`);--> statement-breakpoint
CREATE INDEX `general_ledger_entries_account_time_idx` ON `general_ledger_entries` (`organizationId`,`accountId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `loyalty_transactions_member_time_idx` ON `loyalty_transactions` (`organizationId`,`memberId`,`createdAt`);
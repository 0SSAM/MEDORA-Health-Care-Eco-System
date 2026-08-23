CREATE TABLE `balance_ledger_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`jurisdictionId` int,
	`partyType` enum('supplier','customer') NOT NULL,
	`supplierId` int,
	`customerId` int,
	`direction` enum('debit','credit') NOT NULL,
	`amount` decimal(14,2) NOT NULL,
	`sourceType` varchar(80) NOT NULL,
	`sourceId` varchar(80) NOT NULL,
	`approvalStatus` enum('not_required','pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdByUserId` int NOT NULL,
	`approvedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `balance_ledger_entries_id` PRIMARY KEY(`id`),
	CONSTRAINT `balance_ledger_source_idx` UNIQUE(`organizationId`,`sourceType`,`sourceId`)
);
--> statement-breakpoint
CREATE TABLE `credit_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`jurisdictionId` int,
	`customerId` int NOT NULL,
	`requestedLimit` decimal(14,2) NOT NULL,
	`outstandingAmount` decimal(14,2) NOT NULL DEFAULT '0',
	`status` enum('pending','approved','rejected','expired') NOT NULL DEFAULT 'pending',
	`requestedByUserId` int NOT NULL,
	`approvedByUserId` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `credit_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goods_receipt_lines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`goodsReceiptId` int NOT NULL,
	`purchaseOrderLineId` int NOT NULL,
	`productId` int NOT NULL,
	`batchNumber` varchar(80) NOT NULL,
	`expiryDate` timestamp NOT NULL,
	`quantity` decimal(14,3) NOT NULL,
	`unitCost` decimal(14,2) NOT NULL,
	CONSTRAINT `goods_receipt_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goods_receipts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int NOT NULL,
	`jurisdictionId` int,
	`purchaseOrderId` int NOT NULL,
	`receiptNumber` varchar(80) NOT NULL,
	`idempotencyKey` varchar(180) NOT NULL,
	`status` enum('draft','posted','reversed') NOT NULL DEFAULT 'draft',
	`receivedByUserId` int NOT NULL,
	`postedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `goods_receipts_id` PRIMARY KEY(`id`),
	CONSTRAINT `goods_receipts_scope_number_idx` UNIQUE(`organizationId`,`branchId`,`receiptNumber`),
	CONSTRAINT `goods_receipts_idempotency_idx` UNIQUE(`organizationId`,`branchId`,`idempotencyKey`)
);
--> statement-breakpoint
CREATE TABLE `purchase_order_lines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`purchaseOrderId` int NOT NULL,
	`productId` int NOT NULL,
	`orderedQuantity` decimal(14,3) NOT NULL,
	`receivedQuantity` decimal(14,3) NOT NULL DEFAULT '0',
	`unitCost` decimal(14,2) NOT NULL,
	`batchNumber` varchar(80),
	`expiryDate` timestamp,
	CONSTRAINT `purchase_order_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int NOT NULL,
	`jurisdictionId` int,
	`supplierId` int NOT NULL,
	`orderNumber` varchar(80) NOT NULL,
	`status` enum('draft','submitted','approved','partially_received','received','cancelled') NOT NULL DEFAULT 'draft',
	`currencyCode` varchar(3) NOT NULL DEFAULT 'EGP',
	`totalAmount` decimal(14,2) NOT NULL DEFAULT '0',
	`createdByUserId` int NOT NULL,
	`approvedByUserId` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchase_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `purchase_orders_scope_number_idx` UNIQUE(`organizationId`,`branchId`,`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`jurisdictionId` int,
	`name` varchar(240) NOT NULL,
	`phone` varchar(40),
	`taxRegistrationNumber` varchar(80),
	`active` int NOT NULL DEFAULT 1,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `balance_ledger_party_scope_idx` ON `balance_ledger_entries` (`organizationId`,`branchId`,`partyType`,`createdAt`);--> statement-breakpoint
CREATE INDEX `credit_requests_scope_status_idx` ON `credit_requests` (`organizationId`,`branchId`,`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `purchase_orders_scope_status_idx` ON `purchase_orders` (`organizationId`,`branchId`,`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `suppliers_scope_name_idx` ON `suppliers` (`organizationId`,`branchId`,`name`);
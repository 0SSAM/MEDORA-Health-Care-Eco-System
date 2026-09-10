CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`branchId` int,
	`action` varchar(80) NOT NULL,
	`entityType` varchar(80) NOT NULL,
	`entityId` varchar(80),
	`previousHash` varchar(128),
	`recordHash` varchar(128) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `branch_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`branchId` int NOT NULL,
	`userId` int NOT NULL,
	`active` int NOT NULL DEFAULT 1,
	CONSTRAINT `branch_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `branch_users_membership_idx` UNIQUE(`branchId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `branches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(32) NOT NULL,
	`nameAr` varchar(160) NOT NULL,
	`address` text,
	`active` int NOT NULL DEFAULT 1,
	CONSTRAINT `branches_id` PRIMARY KEY(`id`),
	CONSTRAINT `branches_code_idx` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `inventory_batches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`branchId` int NOT NULL,
	`productId` int NOT NULL,
	`batchNumber` varchar(80) NOT NULL,
	`expiryDate` timestamp NOT NULL,
	`quantityOnHand` decimal(14,3) NOT NULL DEFAULT '0',
	`reorderPoint` decimal(14,3) NOT NULL DEFAULT '0',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_batches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sku` varchar(64) NOT NULL,
	`barcode` varchar(64),
	`nameAr` varchar(220) NOT NULL,
	`nameEn` varchar(220),
	`officialPrice` decimal(12,2) NOT NULL,
	`requiresPrescription` int NOT NULL DEFAULT 0,
	`active` int NOT NULL DEFAULT 1,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_sku_idx` UNIQUE(`sku`),
	CONSTRAINT `products_barcode_idx` UNIQUE(`barcode`)
);
--> statement-breakpoint
CREATE TABLE `sale_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`saleId` int NOT NULL,
	`productId` int NOT NULL,
	`batchId` int NOT NULL,
	`unit` varchar(24) NOT NULL,
	`quantity` decimal(14,3) NOT NULL,
	`unitPrice` decimal(14,2) NOT NULL,
	CONSTRAINT `sale_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`branchId` int NOT NULL,
	`cashierId` int NOT NULL,
	`invoiceNumber` varchar(80) NOT NULL,
	`subtotal` decimal(14,2) NOT NULL,
	`discountAmount` decimal(14,2) NOT NULL DEFAULT '0',
	`totalAmount` decimal(14,2) NOT NULL,
	`discountValidation` varchar(40) NOT NULL,
	`paymentMethod` enum('cash','meeza','instapay','insurance') NOT NULL,
	`etaStatus` enum('pending','submitted','valid','invalid') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sales_id` PRIMARY KEY(`id`),
	CONSTRAINT `sales_invoice_idx` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`schedule_cron_task_uid` varchar(65),
	`cronExpression` varchar(40) NOT NULL,
	`active` int NOT NULL DEFAULT 1,
	`lastRunAt` timestamp,
	CONSTRAINT `scheduled_jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `scheduled_jobs_task_uid_idx` UNIQUE(`schedule_cron_task_uid`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','manager','pharmacist','cashier') NOT NULL DEFAULT 'user';--> statement-breakpoint
CREATE INDEX `audit_logs_time_idx` ON `audit_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `inventory_batches_fefo_idx` ON `inventory_batches` (`branchId`,`productId`,`expiryDate`);--> statement-breakpoint
CREATE INDEX `sales_branch_date_idx` ON `sales` (`branchId`,`createdAt`);
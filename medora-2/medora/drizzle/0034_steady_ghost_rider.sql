CREATE TABLE `sales_returns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`originalSaleId` int NOT NULL,
	`originalSaleItemId` int,
	`quantity` decimal(14,3) NOT NULL,
	`reasonCode` varchar(80) NOT NULL,
	`disposition` enum('refund','exchange','credit_note','rejected','pending_review') NOT NULL DEFAULT 'pending_review',
	`status` enum('preview','approved','completed','rejected','cancelled') NOT NULL DEFAULT 'preview',
	`amount` decimal(14,2) NOT NULL,
	`taxAmount` decimal(14,2) NOT NULL DEFAULT '0',
	`notes` varchar(500),
	`createdByUserId` int NOT NULL,
	`approvedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sales_returns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tax_invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`saleId` int,
	`returnId` int,
	`invoiceNumber` varchar(80) NOT NULL,
	`invoiceType` enum('sales','credit_note','debit_note') NOT NULL,
	`currencyCode` varchar(8) NOT NULL,
	`subtotal` decimal(14,2) NOT NULL,
	`vatAmount` decimal(14,2) NOT NULL,
	`totalAmount` decimal(14,2) NOT NULL,
	`status` enum('draft','issued_local','submitted_blocked','accepted','rejected','cancelled') NOT NULL DEFAULT 'draft',
	`externalSubmissionGate` enum('not_configured','test_ready','production_ready') NOT NULL DEFAULT 'not_configured',
	`correctionOfInvoiceId` int,
	`createdByUserId` int NOT NULL,
	`issuedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tax_invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `tax_invoices_scope_number_idx` UNIQUE(`organizationId`,`branchId`,`jurisdictionId`,`invoiceNumber`)
);
--> statement-breakpoint
CREATE INDEX `sales_returns_scope_status_idx` ON `sales_returns` (`organizationId`,`branchId`,`jurisdictionId`,`status`);--> statement-breakpoint
CREATE INDEX `sales_returns_sale_idx` ON `sales_returns` (`originalSaleId`);--> statement-breakpoint
CREATE INDEX `tax_invoices_scope_status_idx` ON `tax_invoices` (`organizationId`,`branchId`,`jurisdictionId`,`status`);--> statement-breakpoint
CREATE INDEX `tax_invoices_sale_idx` ON `tax_invoices` (`saleId`);
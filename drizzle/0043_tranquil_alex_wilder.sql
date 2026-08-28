ALTER TABLE `suppliers` ADD `supplierCode` varchar(80);--> statement-breakpoint
ALTER TABLE `suppliers` ADD `contactPerson` varchar(180);--> statement-breakpoint
ALTER TABLE `suppliers` ADD `email` varchar(240);--> statement-breakpoint
ALTER TABLE `suppliers` ADD `address` varchar(500);--> statement-breakpoint
ALTER TABLE `suppliers` ADD `city` varchar(120);--> statement-breakpoint
ALTER TABLE `suppliers` ADD `countryCode` varchar(2) DEFAULT 'EG';--> statement-breakpoint
ALTER TABLE `suppliers` ADD `paymentTermsDays` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `suppliers` ADD `creditLimit` decimal(14,2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE `suppliers` ADD `creditCurrencyCode` varchar(3) DEFAULT 'EGP' NOT NULL;--> statement-breakpoint
ALTER TABLE `suppliers` ADD `creditApprovalStatus` enum('not_requested','pending','approved','rejected') DEFAULT 'not_requested' NOT NULL;--> statement-breakpoint
ALTER TABLE `suppliers` ADD `creditApprovedByUserId` int;--> statement-breakpoint
ALTER TABLE `suppliers` ADD `creditApprovedAt` timestamp;--> statement-breakpoint
ALTER TABLE `suppliers` ADD `notes` text;
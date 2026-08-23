CREATE TABLE `held_invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`cashierId` int NOT NULL,
	`invoiceNumber` varchar(80) NOT NULL,
	`paymentMethod` enum('cash','meeza','instapay','insurance') NOT NULL,
	`payloadJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `held_invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `held_invoices_scope_idx` ON `held_invoices` (`organizationId`,`branchId`,`jurisdictionId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `held_invoices_cashier_idx` ON `held_invoices` (`cashierId`,`createdAt`);
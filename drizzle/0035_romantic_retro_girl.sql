CREATE TABLE `tax_invoice_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`jurisdictionId` int NOT NULL,
	`nameAr` varchar(160) NOT NULL DEFAULT 'قالب الفاتورة الضريبية',
	`nameEn` varchar(160) NOT NULL DEFAULT 'Tax Invoice Template',
	`addressAr` varchar(500),
	`addressEn` varchar(500),
	`taxRegistrationNumber` varchar(80),
	`phone` varchar(40),
	`email` varchar(160),
	`logoUrl` varchar(1000),
	`accentColor` varchar(9) NOT NULL DEFAULT '#0f766e',
	`footerAr` varchar(500),
	`footerEn` varchar(500),
	`active` int NOT NULL DEFAULT 1,
	`updatedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tax_invoice_templates_id` PRIMARY KEY(`id`),
	CONSTRAINT `tax_invoice_templates_scope_idx` UNIQUE(`organizationId`,`branchId`,`jurisdictionId`)
);
--> statement-breakpoint
CREATE INDEX `tax_invoice_templates_active_idx` ON `tax_invoice_templates` (`organizationId`,`branchId`,`active`);
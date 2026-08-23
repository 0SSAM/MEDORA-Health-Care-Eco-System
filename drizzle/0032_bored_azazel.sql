CREATE TABLE `e_prescription_lines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`prescriptionId` int NOT NULL,
	`catalogItemId` int,
	`medicationText` varchar(240) NOT NULL,
	`dosage` varchar(160) NOT NULL,
	`route` varchar(80),
	`frequency` varchar(120) NOT NULL,
	`duration` varchar(120) NOT NULL,
	`quantity` decimal(12,3) NOT NULL,
	`instructionsEncrypted` text,
	`status` enum('ACTIVE','PARTIALLY_DISPENSED','DISPENSED','CANCELLED') NOT NULL DEFAULT 'ACTIVE',
	`dispensedQuantity` decimal(12,3) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `e_prescription_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `e_prescriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`branchId` int NOT NULL,
	`patientId` int NOT NULL,
	`encounterId` int,
	`prescriptionCode` varchar(80) NOT NULL,
	`status` enum('DRAFT','PENDING_VERIFICATION','VERIFIED','PARTIALLY_DISPENSED','DISPENSED','CANCELLED','EXPIRED') NOT NULL DEFAULT 'DRAFT',
	`notesEncrypted` text,
	`prescriberUserId` int NOT NULL,
	`verifierUserId` int,
	`verifiedAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `e_prescriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `e_prescriptions_scope_code_idx` UNIQUE(`organizationId`,`prescriptionCode`)
);
--> statement-breakpoint
CREATE INDEX `e_prescription_lines_prescription_idx` ON `e_prescription_lines` (`prescriptionId`,`status`);--> statement-breakpoint
CREATE INDEX `e_prescription_lines_catalog_idx` ON `e_prescription_lines` (`catalogItemId`);--> statement-breakpoint
CREATE INDEX `e_prescriptions_patient_scope_idx` ON `e_prescriptions` (`organizationId`,`branchId`,`patientId`,`status`);--> statement-breakpoint
CREATE INDEX `e_prescriptions_status_idx` ON `e_prescriptions` (`organizationId`,`jurisdictionId`,`status`);
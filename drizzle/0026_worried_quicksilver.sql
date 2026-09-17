CREATE TABLE `hospital_billing_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`branchId` int NOT NULL,
	`facilityId` int NOT NULL,
	`patientId` int NOT NULL,
	`encounterId` int,
	`payerType` enum('self_pay','insurance','government','employer') NOT NULL,
	`packageCode` varchar(120),
	`status` enum('draft','pending_approval','approved','partially_paid','paid','disputed','cancelled') NOT NULL DEFAULT 'draft',
	`approvalStatus` enum('not_required','pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`depositAmount` decimal(14,2) NOT NULL DEFAULT '0',
	`billedAmount` decimal(14,2) NOT NULL DEFAULT '0',
	`paidAmount` decimal(14,2) NOT NULL DEFAULT '0',
	`externalInvoiceGate` enum('not_configured','test_ready','production_ready') NOT NULL DEFAULT 'not_configured',
	`notesEncrypted` text,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hospital_billing_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `hospital_billing_scope_status_idx` ON `hospital_billing_accounts` (`organizationId`,`jurisdictionId`,`branchId`,`status`);--> statement-breakpoint
CREATE INDEX `hospital_billing_patient_idx` ON `hospital_billing_accounts` (`organizationId`,`patientId`);
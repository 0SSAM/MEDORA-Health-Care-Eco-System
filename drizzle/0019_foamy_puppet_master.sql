CREATE TABLE `insurance_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`requestType` enum('ELIGIBILITY','PREAUTHORIZATION') NOT NULL,
	`payerCode` varchar(80) NOT NULL,
	`memberReferenceHash` varchar(128) NOT NULL,
	`serviceCode` varchar(120) NOT NULL,
	`status` enum('DRAFT','READY_FOR_SUBMISSION','SUBMITTED','APPROVED','PARTIALLY_APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
	`externalReference` varchar(160),
	`credentialGate` enum('NOT_CONFIGURED','TEST_READY','PRODUCTION_READY') NOT NULL DEFAULT 'NOT_CONFIGURED',
	`requestJson` text,
	`responseJson` text,
	`idempotencyKey` varchar(180) NOT NULL,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `insurance_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `insurance_requests_idempotency_idx` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE INDEX `insurance_requests_scope_status_idx` ON `insurance_requests` (`organizationId`,`jurisdictionId`,`status`,`updatedAt`);
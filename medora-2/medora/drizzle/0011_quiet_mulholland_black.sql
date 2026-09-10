CREATE TABLE `offline_drafts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`idempotencyKey` varchar(120) NOT NULL,
	`module` enum('customerCare','callCentre') NOT NULL,
	`payloadJson` text NOT NULL,
	`status` enum('queued','replayed','conflict','failed') NOT NULL DEFAULT 'queued',
	`errorCode` varchar(80),
	`createdByUserId` int NOT NULL,
	`replayedEntityId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offline_drafts_id` PRIMARY KEY(`id`),
	CONSTRAINT `offline_drafts_idempotency_idx` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE INDEX `offline_drafts_owner_status_idx` ON `offline_drafts` (`createdByUserId`,`status`);
CREATE TABLE `compliance_evidence` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jurisdictionId` int NOT NULL,
	`packId` int NOT NULL,
	`operation` varchar(40) NOT NULL,
	`authorityName` varchar(160) NOT NULL,
	`sourceUrl` varchar(500) NOT NULL,
	`sourceRecordId` varchar(160),
	`sourceRetrievedAt` timestamp NOT NULL,
	`effectiveFrom` timestamp,
	`reviewDueAt` timestamp,
	`verificationStatus` enum('unverified','review','verified','rejected') NOT NULL DEFAULT 'unverified',
	`verifiedByUserId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `compliance_evidence_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `catalog_items` ADD `jurisdictionId` int;--> statement-breakpoint
ALTER TABLE `catalog_sync_queue` ADD `jurisdictionId` int;--> statement-breakpoint
ALTER TABLE `products` ADD `jurisdictionId` int;--> statement-breakpoint
CREATE INDEX `compliance_evidence_source_idx` ON `compliance_evidence` (`jurisdictionId`,`packId`,`operation`);
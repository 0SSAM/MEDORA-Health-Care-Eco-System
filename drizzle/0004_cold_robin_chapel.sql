CREATE TABLE `call_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int,
	`branchId` int,
	`assignedUserId` int,
	`channel` enum('phone','whatsapp','web','in_person') NOT NULL,
	`direction` enum('inbound','outbound') NOT NULL,
	`subject` varchar(220) NOT NULL,
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`status` enum('open','pending','resolved','closed') NOT NULL DEFAULT 'open',
	`disposition` varchar(120),
	`callbackAt` timestamp,
	`escalationAt` timestamp,
	`recordingRef` varchar(255),
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `call_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `care_interactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`userId` int NOT NULL,
	`interactionType` enum('follow_up','complaint','counseling','chronic_care') NOT NULL,
	`summary` text NOT NULL,
	`nextActionAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `care_interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `catalog_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` enum('medicine','cosmetic','medical_supply') NOT NULL,
	`sku` varchar(80) NOT NULL,
	`barcode` varchar(80),
	`nameAr` varchar(240) NOT NULL,
	`nameEn` varchar(240),
	`genericName` varchar(240),
	`manufacturer` varchar(220),
	`registrationNumber` varchar(120),
	`sourceAuthority` varchar(40) NOT NULL,
	`sourceRecordId` varchar(160),
	`sourceUrl` varchar(500),
	`sourceRetrievedAt` timestamp,
	`verificationStatus` enum('UNVERIFIED','PENDING_REVIEW','VERIFIED','REJECTED') NOT NULL DEFAULT 'UNVERIFIED',
	`createdByUserId` int NOT NULL,
	`approvedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `catalog_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `catalog_items_sku_idx` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `catalog_sync_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('medicine','cosmetic','medical_supply') NOT NULL,
	`operation` enum('create','update','review') NOT NULL,
	`entityId` int,
	`idempotencyKey` varchar(100) NOT NULL,
	`payloadJson` text NOT NULL,
	`status` enum('pending','synced','conflict','failed') NOT NULL DEFAULT 'pending',
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `catalog_sync_queue_id` PRIMARY KEY(`id`),
	CONSTRAINT `catalog_sync_idempotency_idx` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE TABLE `customer_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`branchId` int,
	`fullName` varchar(220) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`nationalIdHash` varchar(128),
	`consentStatus` enum('pending','granted','withdrawn') NOT NULL DEFAULT 'pending',
	`chronicCareEnabled` int NOT NULL DEFAULT 0,
	`notes` text,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `call_tickets_status_idx` ON `call_tickets` (`status`,`priority`);--> statement-breakpoint
CREATE INDEX `catalog_items_barcode_idx` ON `catalog_items` (`barcode`);--> statement-breakpoint
CREATE INDEX `customer_profiles_phone_idx` ON `customer_profiles` (`phone`);
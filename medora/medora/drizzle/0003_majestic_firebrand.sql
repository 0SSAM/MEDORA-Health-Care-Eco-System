CREATE TABLE `prescription_intakes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdByUserId` int NOT NULL,
	`imageKey` varchar(255) NOT NULL,
	`imageMimeType` varchar(80) NOT NULL,
	`status` enum('UPLOADED','PENDING_REVIEW','CONFIRMED','REJECTED') NOT NULL DEFAULT 'UPLOADED',
	`extractionJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prescription_intakes_id` PRIMARY KEY(`id`)
);

CREATE TABLE `branch_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`branchId` int NOT NULL,
	`managerUserId` int NOT NULL,
	`alertType` enum('reorder','expiry') NOT NULL,
	`inventoryBatchId` int NOT NULL,
	`alertDate` timestamp NOT NULL,
	`status` enum('queued','sent','read') NOT NULL DEFAULT 'queued',
	CONSTRAINT `branch_alerts_id` PRIMARY KEY(`id`),
	CONSTRAINT `branch_alerts_dedupe_idx` UNIQUE(`managerUserId`,`inventoryBatchId`,`alertType`,`alertDate`)
);

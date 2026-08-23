CREATE TABLE `decision_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`entityType` varchar(80) NOT NULL,
	`entityId` int NOT NULL,
	`decision` enum('approved','rejected','deferred') NOT NULL,
	`reason` varchar(1000) NOT NULL,
	`decidedByUserId` int NOT NULL,
	`decidedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `decision_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `decision_logs_scope_time_idx` ON `decision_logs` (`organizationId`,`branchId`,`jurisdictionId`,`decidedAt`);--> statement-breakpoint
CREATE INDEX `decision_logs_entity_scope_idx` ON `decision_logs` (`organizationId`,`branchId`,`jurisdictionId`,`entityType`,`entityId`);
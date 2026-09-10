CREATE TABLE `authentication_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`username` varchar(80),
	`organizationId` int,
	`branchId` int,
	`jurisdictionId` int,
	`eventType` enum('login_success','login_failure','logout','lockout','session_revoked') NOT NULL,
	`source` enum('internal','oauth','demo') NOT NULL,
	`requestId` varchar(120),
	`recordHash` varchar(128) NOT NULL,
	`previousHash` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `authentication_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `internal_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`username` varchar(80) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`failedAttempts` int NOT NULL DEFAULT 0,
	`lockedUntil` timestamp,
	`active` int NOT NULL DEFAULT 1,
	`passwordChangedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `internal_credentials_id` PRIMARY KEY(`id`),
	CONSTRAINT `internal_credentials_username_idx` UNIQUE(`username`),
	CONSTRAINT `internal_credentials_user_idx` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `internal_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionHash` varchar(128) NOT NULL,
	`userId` int NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int NOT NULL,
	`jurisdictionId` int NOT NULL,
	`role` varchar(80) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`revokedAt` timestamp,
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `internal_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `internal_sessions_hash_idx` UNIQUE(`sessionHash`)
);
--> statement-breakpoint
CREATE INDEX `authentication_events_time_idx` ON `authentication_events` (`createdAt`);--> statement-breakpoint
CREATE INDEX `authentication_events_scope_idx` ON `authentication_events` (`organizationId`,`branchId`,`jurisdictionId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `internal_sessions_user_scope_idx` ON `internal_sessions` (`userId`,`organizationId`,`branchId`,`revokedAt`);
CREATE TABLE `password_reset_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`credentialId` int NOT NULL,
	`tokenHash` varchar(128) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `password_reset_tokens_hash_idx` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
ALTER TABLE `authentication_events` MODIFY COLUMN `eventType` enum('login_success','login_failure','logout','lockout','session_revoked','password_reset_requested','password_reset_completed') NOT NULL;--> statement-breakpoint
CREATE INDEX `password_reset_tokens_user_idx` ON `password_reset_tokens` (`userId`,`expiresAt`);
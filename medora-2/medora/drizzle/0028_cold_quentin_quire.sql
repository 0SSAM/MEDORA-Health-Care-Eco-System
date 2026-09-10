ALTER TABLE `authentication_events` MODIFY COLUMN `source` enum('internal','oauth') NOT NULL;--> statement-breakpoint
ALTER TABLE `sales` DROP COLUMN `recordMode`;
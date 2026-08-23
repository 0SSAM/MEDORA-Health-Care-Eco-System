ALTER TABLE `scheduled_jobs` ADD `lastInternalEventAt` timestamp;--> statement-breakpoint
ALTER TABLE `scheduled_jobs` ADD `lastInternalEventStatus` enum('never','recorded','failed') DEFAULT 'never' NOT NULL;--> statement-breakpoint
ALTER TABLE `automation_outbound_events` ADD `recordedAt` timestamp;--> statement-breakpoint
ALTER TABLE `automation_outbound_events` ADD `auditPayloadJson` text;--> statement-breakpoint
ALTER TABLE `automation_outbound_events` ADD `signatureHex` varchar(64);

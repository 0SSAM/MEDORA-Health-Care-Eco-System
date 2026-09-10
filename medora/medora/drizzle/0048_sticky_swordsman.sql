ALTER TABLE `call_tickets` ADD `queueId` int;--> statement-breakpoint
ALTER TABLE `call_tickets` ADD `slaDueAt` timestamp;--> statement-breakpoint
ALTER TABLE `call_tickets` ADD `firstRespondedAt` timestamp;--> statement-breakpoint
ALTER TABLE `call_tickets` ADD `resolvedAt` timestamp;--> statement-breakpoint
CREATE INDEX `call_tickets_queue_sla_idx` ON `call_tickets` (`organizationId`,`branchId`,`queueId`,`slaDueAt`);
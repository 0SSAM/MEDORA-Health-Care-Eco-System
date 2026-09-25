ALTER TABLE `audit_logs` ADD COLUMN `organizationId` int;--> statement-breakpoint
ALTER TABLE `call_tickets` ADD COLUMN `organizationId` int;--> statement-breakpoint
ALTER TABLE `catalog_items` ADD COLUMN `organizationId` int;--> statement-breakpoint
ALTER TABLE `catalog_sync_queue` ADD COLUMN `organizationId` int;--> statement-breakpoint
ALTER TABLE `customer_profiles` ADD COLUMN `organizationId` int;--> statement-breakpoint
ALTER TABLE `inventory_batches` ADD COLUMN `organizationId` int;--> statement-breakpoint
ALTER TABLE `prescription_intakes` ADD COLUMN `organizationId` int;--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN `organizationId` int;--> statement-breakpoint
ALTER TABLE `sales` ADD COLUMN `organizationId` int;

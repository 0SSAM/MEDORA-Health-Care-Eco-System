ALTER TABLE `audit_logs` ADD COLUMN IF NOT EXISTS `organizationId` int;--> statement-breakpoint
ALTER TABLE `call_tickets` ADD COLUMN IF NOT EXISTS `organizationId` int;--> statement-breakpoint
ALTER TABLE `catalog_items` ADD COLUMN IF NOT EXISTS `organizationId` int;--> statement-breakpoint
ALTER TABLE `catalog_sync_queue` ADD COLUMN IF NOT EXISTS `organizationId` int;--> statement-breakpoint
ALTER TABLE `customer_profiles` ADD COLUMN IF NOT EXISTS `organizationId` int;--> statement-breakpoint
ALTER TABLE `inventory_batches` ADD COLUMN IF NOT EXISTS `organizationId` int;--> statement-breakpoint
ALTER TABLE `prescription_intakes` ADD COLUMN IF NOT EXISTS `organizationId` int;--> statement-breakpoint
ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `organizationId` int;--> statement-breakpoint
ALTER TABLE `sales` ADD COLUMN IF NOT EXISTS `organizationId` int;

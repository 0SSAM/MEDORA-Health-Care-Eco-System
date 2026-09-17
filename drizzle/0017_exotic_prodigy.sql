ALTER TABLE `branches` MODIFY COLUMN `organizationId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `call_tickets` MODIFY COLUMN `organizationId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `catalog_items` MODIFY COLUMN `organizationId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `customer_profiles` MODIFY COLUMN `organizationId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory_batches` MODIFY COLUMN `organizationId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `prescription_intakes` MODIFY COLUMN `organizationId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `organizationId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `sales` MODIFY COLUMN `organizationId` int NOT NULL;
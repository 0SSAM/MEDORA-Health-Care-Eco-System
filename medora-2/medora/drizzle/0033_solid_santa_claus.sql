ALTER TABLE `catalog_items` ADD `gtin` varchar(80);--> statement-breakpoint
ALTER TABLE `catalog_items` ADD `priceEgp` decimal(12,2);--> statement-breakpoint
ALTER TABLE `catalog_items` ADD `sourceLicense` varchar(500);--> statement-breakpoint
ALTER TABLE `catalog_items` ADD `sourceNotes` text;
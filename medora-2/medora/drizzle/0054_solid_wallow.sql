ALTER TABLE `audit_logs` ADD `jurisdictionId` int;--> statement-breakpoint
CREATE INDEX `audit_logs_scope_time_idx` ON `audit_logs` (`organizationId`,`branchId`,`jurisdictionId`,`createdAt`);
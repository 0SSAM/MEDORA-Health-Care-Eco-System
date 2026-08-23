CREATE TABLE `organization_sla_policies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`procurementTargetHours` int NOT NULL DEFAULT 48,
	`customerCareTargetHours` int NOT NULL DEFAULT 24,
	`escalationGraceHours` int NOT NULL DEFAULT 24,
	`escalationEnabled` int NOT NULL DEFAULT 1,
	`updatedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organization_sla_policies_id` PRIMARY KEY(`id`),
	CONSTRAINT `organization_sla_policies_organization_idx` UNIQUE(`organizationId`)
);

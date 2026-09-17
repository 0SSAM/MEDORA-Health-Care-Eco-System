CREATE TABLE `crm_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`jurisdictionId` int,
	`label` varchar(180) NOT NULL,
	`contactReferenceHash` varchar(128),
	`source` enum('walk_in','referral','campaign','call_centre','other') NOT NULL DEFAULT 'other',
	`stage` enum('new','contacted','qualified','converted','lost','do_not_contact') NOT NULL DEFAULT 'new',
	`consentStatus` enum('unknown','granted','withdrawn','not_required') NOT NULL DEFAULT 'unknown',
	`assignedToUserId` int,
	`nextFollowUpAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employee_attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int NOT NULL,
	`jurisdictionId` int,
	`employeeProfileId` int NOT NULL,
	`workDate` timestamp NOT NULL,
	`checkInAt` timestamp,
	`checkOutAt` timestamp,
	`status` enum('planned','present','late','absent','approved_leave','manual_review') NOT NULL DEFAULT 'planned',
	`source` enum('manual','verified_device','imported') NOT NULL DEFAULT 'manual',
	`reviewedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employee_attendance_id` PRIMARY KEY(`id`),
	CONSTRAINT `employee_attendance_daily_employee_idx` UNIQUE(`organizationId`,`employeeProfileId`,`workDate`)
);
--> statement-breakpoint
CREATE TABLE `employee_leave_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`jurisdictionId` int,
	`employeeProfileId` int NOT NULL,
	`leaveType` enum('annual','sick','emergency','unpaid','other') NOT NULL,
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp NOT NULL,
	`status` enum('draft','submitted','approved','rejected','cancelled') NOT NULL DEFAULT 'draft',
	`reasonEncrypted` text,
	`decidedByUserId` int,
	`decidedAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employee_leave_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employee_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int,
	`jurisdictionId` int,
	`userId` int,
	`employeeNumber` varchar(64) NOT NULL,
	`displayName` varchar(180) NOT NULL,
	`department` varchar(120),
	`jobTitle` varchar(160),
	`employmentStatus` enum('onboarding','active','on_leave','suspended','inactive') NOT NULL DEFAULT 'onboarding',
	`hireDate` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employee_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `employee_profiles_org_number_idx` UNIQUE(`organizationId`,`employeeNumber`)
);
--> statement-breakpoint
CREATE TABLE `procurement_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`branchId` int NOT NULL,
	`jurisdictionId` int,
	`requestNumber` varchar(80) NOT NULL,
	`requestType` enum('stock','service','asset','maintenance','other') NOT NULL,
	`title` varchar(240) NOT NULL,
	`businessJustification` text NOT NULL,
	`estimatedAmount` decimal(14,2),
	`currencyCode` varchar(3) NOT NULL DEFAULT 'EGP',
	`status` enum('draft','submitted','approved','rejected','cancelled','fulfilled') NOT NULL DEFAULT 'draft',
	`createdByUserId` int NOT NULL,
	`approvedByUserId` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `procurement_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `procurement_requests_scope_number_idx` UNIQUE(`organizationId`,`requestNumber`)
);
--> statement-breakpoint
CREATE INDEX `crm_leads_scope_stage_idx` ON `crm_leads` (`organizationId`,`branchId`,`stage`,`nextFollowUpAt`);--> statement-breakpoint
CREATE INDEX `crm_leads_contact_hash_idx` ON `crm_leads` (`organizationId`,`contactReferenceHash`);--> statement-breakpoint
CREATE INDEX `employee_attendance_branch_date_idx` ON `employee_attendance` (`organizationId`,`branchId`,`workDate`,`status`);--> statement-breakpoint
CREATE INDEX `employee_leave_scope_status_idx` ON `employee_leave_requests` (`organizationId`,`branchId`,`status`,`startsAt`);--> statement-breakpoint
CREATE INDEX `employee_leave_employee_dates_idx` ON `employee_leave_requests` (`organizationId`,`employeeProfileId`,`startsAt`,`endsAt`);--> statement-breakpoint
CREATE INDEX `employee_profiles_branch_status_idx` ON `employee_profiles` (`organizationId`,`branchId`,`employmentStatus`);--> statement-breakpoint
CREATE INDEX `employee_profiles_user_idx` ON `employee_profiles` (`organizationId`,`userId`);--> statement-breakpoint
CREATE INDEX `procurement_requests_queue_idx` ON `procurement_requests` (`organizationId`,`branchId`,`status`,`createdAt`);
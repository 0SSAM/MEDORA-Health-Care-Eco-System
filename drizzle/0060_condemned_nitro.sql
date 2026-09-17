CREATE TABLE `delivery_drivers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`name_ar` varchar(150) NOT NULL,
	`phone` varchar(30) NOT NULL,
	`vehicle_type` varchar(40) NOT NULL DEFAULT 'motorcycle',
	`status` varchar(40) NOT NULL DEFAULT 'available',
	`active` int NOT NULL DEFAULT 1,
	CONSTRAINT `delivery_drivers_id` PRIMARY KEY(`id`),
	CONSTRAINT `delivery_drivers_org_phone_idx` UNIQUE(`organization_id`,`phone`)
);
--> statement-breakpoint
CREATE TABLE `delivery_zones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`name_ar` varchar(120) NOT NULL,
	`name_en` varchar(120) NOT NULL,
	`fee_egp` decimal(10,2) NOT NULL DEFAULT '0',
	`min_order_egp` decimal(10,2) NOT NULL DEFAULT '0',
	`delivery_time_min` int NOT NULL DEFAULT 60,
	`active` int NOT NULL DEFAULT 1,
	CONSTRAINT `delivery_zones_id` PRIMARY KEY(`id`),
	CONSTRAINT `delivery_zones_org_name_idx` UNIQUE(`organization_id`,`name_ar`)
);
--> statement-breakpoint
CREATE TABLE `rbac_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(100) NOT NULL,
	`module` varchar(50) NOT NULL,
	`name_ar` varchar(200) NOT NULL,
	`name_en` varchar(200) NOT NULL,
	CONSTRAINT `rbac_permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `rbac_permissions_code_idx` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `rbac_role_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`role_id` int NOT NULL,
	`permission_id` int NOT NULL,
	CONSTRAINT `rbac_role_permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `rbac_role_permissions_uq` UNIQUE(`role_id`,`permission_id`)
);
--> statement-breakpoint
CREATE TABLE `rbac_roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`code` varchar(50) NOT NULL,
	`name_ar` varchar(150) NOT NULL,
	`name_en` varchar(150) NOT NULL,
	`is_system` int NOT NULL DEFAULT 0,
	CONSTRAINT `rbac_roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `rbac_roles_org_code_idx` UNIQUE(`organization_id`,`code`)
);
--> statement-breakpoint
CREATE TABLE `rbac_user_roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organization_id` int NOT NULL,
	`user_id` int NOT NULL,
	`role_id` int NOT NULL,
	CONSTRAINT `rbac_user_roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `rbac_user_roles_uq` UNIQUE(`organization_id`,`user_id`,`role_id`)
);

CREATE TABLE `nda_acceptances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`documentVersion` varchar(32) NOT NULL,
	`documentHash` varchar(64) NOT NULL,
	`locale` enum('ar','en') NOT NULL,
	`declaredSurface` enum('web','mobile_webview','desktop_wrapper','unknown') NOT NULL DEFAULT 'unknown',
	`acceptanceMethod` varchar(64) NOT NULL DEFAULT 'explicit_checkbox',
	`acceptedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nda_acceptances_id` PRIMARY KEY(`id`),
	CONSTRAINT `nda_acceptances_user_document_idx` UNIQUE(`userId`,`documentVersion`)
);
--> statement-breakpoint
CREATE INDEX `nda_acceptances_user_accepted_idx` ON `nda_acceptances` (`userId`,`acceptedAt`);
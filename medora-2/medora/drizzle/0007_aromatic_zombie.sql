ALTER TABLE `compliance_evidence` ADD `ruleKey` varchar(120);--> statement-breakpoint
ALTER TABLE `compliance_evidence` ADD `catalogField` varchar(120);--> statement-breakpoint
ALTER TABLE `jurisdiction_profiles` ADD `legalAuthorityProfile` varchar(240) NOT NULL;--> statement-breakpoint
ALTER TABLE `jurisdiction_profiles` ADD `language` varchar(16) DEFAULT 'ar' NOT NULL;
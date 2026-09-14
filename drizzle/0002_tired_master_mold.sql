CREATE TABLE `admin_access_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day` text NOT NULL,
	`accessed_at` text NOT NULL,
	`account_hash` text NOT NULL,
	`outcome` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `daily_counters` (
	`day` text NOT NULL,
	`metric` text NOT NULL,
	`value` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`day`, `metric`)
);
--> statement-breakpoint
CREATE TABLE `event_facts` (
	`event_hash` text PRIMARY KEY NOT NULL,
	`visitor_hash` text NOT NULL,
	`session_hash` text NOT NULL,
	`day` text NOT NULL,
	`created_at` text NOT NULL,
	`event_type` text NOT NULL,
	`label` text NOT NULL,
	`app_slug` text NOT NULL,
	`path` text NOT NULL,
	`value` real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `event_facts_day_type_idx` ON `event_facts` (`day`,`event_type`);--> statement-breakpoint
CREATE INDEX `event_facts_app_idx` ON `event_facts` (`app_slug`);--> statement-breakpoint
CREATE INDEX `event_facts_session_idx` ON `event_facts` (`session_hash`);--> statement-breakpoint
CREATE TABLE `performance_samples` (
	`session_hash` text PRIMARY KEY NOT NULL,
	`visitor_hash` text NOT NULL,
	`day` text NOT NULL,
	`recorded_at` text NOT NULL,
	`lcp_ms` real DEFAULT 0 NOT NULL,
	`inp_ms` real DEFAULT 0 NOT NULL,
	`cls` real DEFAULT 0 NOT NULL,
	`load_ms` real DEFAULT 0 NOT NULL,
	`connection_type` text NOT NULL,
	`viewport` text NOT NULL,
	`device_type` text NOT NULL,
	`country` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `performance_samples_day_idx` ON `performance_samples` (`day`);--> statement-breakpoint
ALTER TABLE `visit_sessions` ADD `language` text DEFAULT 'Unknown' NOT NULL;--> statement-breakpoint
ALTER TABLE `visit_sessions` ADD `campaign_content` text DEFAULT 'None' NOT NULL;--> statement-breakpoint
ALTER TABLE `visit_sessions` ADD `campaign_term` text DEFAULT 'None' NOT NULL;--> statement-breakpoint
CREATE INDEX `visit_sessions_day_idx` ON `visit_sessions` (`day`);--> statement-breakpoint
CREATE INDEX `visit_sessions_visitor_idx` ON `visit_sessions` (`visitor_hash`);--> statement-breakpoint
CREATE INDEX `visit_sessions_last_seen_idx` ON `visit_sessions` (`last_seen`);
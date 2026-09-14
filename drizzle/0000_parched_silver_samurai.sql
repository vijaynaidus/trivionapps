CREATE TABLE `app_visits` (
	`day` text NOT NULL,
	`app_slug` text NOT NULL,
	`visitor_hash` text NOT NULL,
	`first_seen` text NOT NULL,
	`last_seen` text NOT NULL,
	`visits` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`day`, `app_slug`, `visitor_hash`)
);
--> statement-breakpoint
CREATE TABLE `daily_visitors` (
	`day` text NOT NULL,
	`visitor_hash` text NOT NULL,
	`first_seen` text NOT NULL,
	`last_seen` text NOT NULL,
	`page_views` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`day`, `visitor_hash`)
);

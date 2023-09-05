CREATE TABLE `classifications` (
	`txid` blob NOT NULL,
	`termid` integer NOT NULL,
	`source` text NOT NULL,
	`sourceid` text NOT NULL,
	PRIMARY KEY(`source`, `sourceid`, `termid`, `txid`)
);
--> statement-breakpoint
CREATE TABLE `images` (
	`id` integer PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`description` text,
	`source` text,
	`sourceid` text,
	`format` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`json` blob
);
--> statement-breakpoint
CREATE TABLE `links` (
	`id` integer PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`source` text,
	`sourceid` text
);
--> statement-breakpoint
CREATE TABLE `taxonomies` (
	`txid` blob PRIMARY KEY NOT NULL,
	`slug` text,
	`label` text,
	`private` integer
);
--> statement-breakpoint
CREATE TABLE `terms` (
	`termid` blob PRIMARY KEY NOT NULL,
	`slug` text,
	`label` text,
	`private` integer
);
--> statement-breakpoint
CREATE INDEX `images_url_idx` ON `images` (`url`);--> statement-breakpoint
CREATE INDEX `images_source_idx` ON `images` (`source`,`sourceid`);--> statement-breakpoint
CREATE INDEX `links_url_idx` ON `links` (`url`);--> statement-breakpoint
CREATE INDEX `links_source_idx` ON `links` (`source`,`sourceid`);--> statement-breakpoint
CREATE UNIQUE INDEX `slug_idx` ON `taxonomies` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `label_idx` ON `taxonomies` (`label`);--> statement-breakpoint
CREATE UNIQUE INDEX `terms_slug_idx` ON `terms` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `terms_label_idx` ON `terms` (`label`);
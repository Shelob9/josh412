CREATE TABLE `classifications` (
	`slug` text NOT NULL,
	`termid` text NOT NULL,
	`itemid` text NOT NULL,
	`subtype` text,
	`created` integer NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `links` (
	`id` integer PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`source` text,
	`sourceid` text
);
--> statement-breakpoint
CREATE TABLE `media` (
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
CREATE UNIQUE INDEX `classifications_unique_idx` ON `classifications` (`slug`,`termid`,`itemid`);--> statement-breakpoint
CREATE INDEX `classifications_slug_idx` ON `classifications` (`slug`);--> statement-breakpoint
CREATE INDEX `classifications_itemtype_idx` ON `classifications` (`termid`);--> statement-breakpoint
CREATE INDEX `classifications_itemid_idx` ON `classifications` (`itemid`);--> statement-breakpoint
CREATE INDEX `classifications_itemtype_itemid_idx` ON `classifications` (`termid`,`itemid`);--> statement-breakpoint
CREATE INDEX `classifications_itemtype_subtype_idx` ON `classifications` (`termid`,`subtype`);--> statement-breakpoint
CREATE INDEX `classifications_itemtype_subtype_itemid_idx` ON `classifications` (`termid`,`subtype`,`itemid`);--> statement-breakpoint
CREATE INDEX `links_url_idx` ON `links` (`url`);--> statement-breakpoint
CREATE INDEX `links_source_idx` ON `links` (`source`,`sourceid`);--> statement-breakpoint
CREATE INDEX `media_url_idx` ON `media` (`url`);--> statement-breakpoint
CREATE INDEX `media_source_idx` ON `media` (`source`,`sourceid`);
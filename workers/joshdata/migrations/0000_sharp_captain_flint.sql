CREATE TABLE `classifications` (
	`txid` integer NOT NULL,
	`termid` integer NOT NULL,
	`itemid` text NOT NULL,
	PRIMARY KEY(`itemid`, `termid`, `txid`)
);
--> statement-breakpoint
CREATE TABLE `mediaitems` (
	`id` integer PRIMARY KEY NOT NULL,
	`remoteid` text NOT NULL,
	`network` text NOT NULL,
	`url` text NOT NULL,
	`format` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`itemid` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sociallinks` (
	`id` integer PRIMARY KEY NOT NULL,
	`remoteid` text NOT NULL,
	`url` text NOT NULL,
	`network` text NOT NULL,
	`author` text NOT NULL,
	`replytoid` text,
	`parentid` text
);

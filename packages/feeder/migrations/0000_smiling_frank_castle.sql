CREATE TABLE `feeder_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text NOT NULL,
	`instanceUrl` text NOT NULL,
	`accountId` text NOT NULL,
	`accountHandle` text NOT NULL,
	`accountAvatarUrl` text,
	`accountKey` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `feeder_scheduled_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text NOT NULL,
	`mediaKeys` text,
	`savedAt` integer NOT NULL,
	`sendAt` integer NOT NULL,
	`hasSent` integer NOT NULL,
	`postKey` text NOT NULL,
	`accountKey` text NOT NULL,
	FOREIGN KEY (`accountKey`) REFERENCES `feeder_accounts`(`accountKey`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_accountKeyIdx` ON `feeder_accounts` (`accountKey`);--> statement-breakpoint
CREATE UNIQUE INDEX `uniqueCombos` ON `feeder_accounts` (`text`,`instanceUrl`);--> statement-breakpoint
CREATE INDEX `accountKey_idx` ON `feeder_accounts` (`accountKey`);--> statement-breakpoint
CREATE INDEX `accountKeyIdx_idx` ON `feeder_scheduled_posts` (`accountKey`);--> statement-breakpoint
CREATE INDEX `postKey_idx` ON `feeder_scheduled_posts` (`postKey`);--> statement-breakpoint
CREATE UNIQUE INDEX `timeUnqiuqe_idx` ON `feeder_scheduled_posts` (`accountKey`,`sendAt`);

ALTER TABLE `events` ADD `startedAtDate` integer;--> statement-breakpoint
ALTER TABLE `events` ADD `startedAtTime` text;--> statement-breakpoint
ALTER TABLE `events` ADD `finishedAtDate` integer;--> statement-breakpoint
ALTER TABLE `events` ADD `finishedAtTime` text;--> statement-breakpoint
ALTER TABLE `events` DROP COLUMN `startedAt`;--> statement-breakpoint
ALTER TABLE `events` DROP COLUMN `finishedAt`;--> statement-breakpoint
ALTER TABLE `stores` ADD `startedAtDate` integer;--> statement-breakpoint
ALTER TABLE `stores` ADD `startedAtTime` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `finishedAtDate` integer;--> statement-breakpoint
ALTER TABLE `stores` ADD `finishedAtTime` text;--> statement-breakpoint
ALTER TABLE `stores` DROP COLUMN `startedAt`;--> statement-breakpoint
ALTER TABLE `stores` DROP COLUMN `finishedAt`;
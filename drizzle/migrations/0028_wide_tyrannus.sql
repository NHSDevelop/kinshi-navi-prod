PRAGMA defer_foreign_keys=on;
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_register_lanes` (
	`id` text PRIMARY KEY NOT NULL,
	`eventId` text NOT NULL,
	`foodId` text,
	`laneNumber` integer,
	`name` text,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`foodId`) REFERENCES `foods`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_register_lanes`("id", "eventId", "foodId", "laneNumber", "name", "isActive", "createdAt", "updatedAt") SELECT "id", "eventId", "foodId", "laneNumber", "name", "isActive", "createdAt", "updatedAt" FROM `register_lanes`;--> statement-breakpoint
DROP TABLE `register_lanes`;--> statement-breakpoint
ALTER TABLE `__new_register_lanes` RENAME TO `register_lanes`;--> statement-breakpoint
PRAGMA defer_foreign_keys=off;
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `register_lanes_event_id_lane_number_unique` ON `register_lanes` (`eventId`,`laneNumber`);
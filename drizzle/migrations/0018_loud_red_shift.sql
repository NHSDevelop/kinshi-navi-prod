PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_register_lanes` (
	`id` text PRIMARY KEY NOT NULL,
	`foodId` text NOT NULL,
	`laneNumber` integer NOT NULL,
	`name` text,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`foodId`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_register_lanes`("id", "foodId", "laneNumber", "name", "isActive", "createdAt", "updatedAt") SELECT "id", "foodId", "laneNumber", "name", "isActive", "createdAt", "updatedAt" FROM `register_lanes`;--> statement-breakpoint
DROP TABLE `register_lanes`;--> statement-breakpoint
ALTER TABLE `__new_register_lanes` RENAME TO `register_lanes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `register_lanes_food_id_lane_number_unique` ON `register_lanes` (`foodId`,`laneNumber`);
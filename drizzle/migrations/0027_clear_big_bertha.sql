CREATE TABLE `register_lane_foods` (
	`id` text PRIMARY KEY NOT NULL,
	`laneId` text NOT NULL,
	`foodId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`laneId`) REFERENCES `register_lanes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`foodId`) REFERENCES `foods`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `register_lane_foods_lane_id_food_id_unique` ON `register_lane_foods` (`laneId`,`foodId`);
CREATE TABLE `register_lanes` (
	`id` text PRIMARY KEY NOT NULL,
	`storeId` text NOT NULL,
	`laneNumber` integer NOT NULL,
	`name` text,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `register_lanes_store_id_lane_number_unique` ON `register_lanes` (`storeId`,`laneNumber`);--> statement-breakpoint
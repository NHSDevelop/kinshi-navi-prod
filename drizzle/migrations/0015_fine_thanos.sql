CREATE TABLE `attractions` (
	`id` text PRIMARY KEY NOT NULL,
	`playTime` integer DEFAULT 5,
	`peopleCapacity` integer DEFAULT 5 NOT NULL,
	`storeId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);

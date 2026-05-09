CREATE TABLE `store_votes` (
	`id` text PRIMARY KEY NOT NULL,
	`storeId` text NOT NULL,
	`storeType` text NOT NULL,
	`userId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `store_votes_user_id_store_type_unique` ON `store_votes` (`userId`,`storeType`);
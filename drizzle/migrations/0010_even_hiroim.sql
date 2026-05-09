PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_store_votes` (
	`id` text PRIMARY KEY NOT NULL,
	`storeId` text NOT NULL,
	`storeType` text NOT NULL,
	`eventId` text NOT NULL,
	`userId` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_store_votes`("id", "storeId", "storeType", "eventId", "userId", "createdAt", "updatedAt") SELECT "id", "storeId", "storeType", "eventId", "userId", "createdAt", "updatedAt" FROM `store_votes`;--> statement-breakpoint
DROP TABLE `store_votes`;--> statement-breakpoint
ALTER TABLE `__new_store_votes` RENAME TO `store_votes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `store_votes_user_id_store_type_unique` ON `store_votes` (`userId`,`storeType`,`eventId`);
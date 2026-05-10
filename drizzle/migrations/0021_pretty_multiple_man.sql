DROP TABLE `food_tags`;--> statement-breakpoint
PRAGMA defer_foreign_keys=on;
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_foods` (
	`id` text PRIMARY KEY NOT NULL,
	`storeId` text NOT NULL,
	`tag` text DEFAULT 'OTHER',
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_foods`("id", "storeId", "tag", "createdAt", "updatedAt") SELECT "id", "storeId", "tag", "createdAt", "updatedAt" FROM `foods`;--> statement-breakpoint
DROP TABLE `foods`;--> statement-breakpoint
ALTER TABLE `__new_foods` RENAME TO `foods`;--> statement-breakpoint
PRAGMA defer_foreign_keys=off;
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `foods_storeId_unique` ON `foods` (`storeId`);
PRAGMA foreign_keys=OFF;--> statement-breakpoint
DROP TABLE IF EXISTS `__new_tickets`;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `attractions_storeId_unique` ON `attractions` (`storeId`);--> statement-breakpoint
CREATE TABLE `__new_tickets` (
  `id` text PRIMARY KEY NOT NULL,
  `index` integer NOT NULL,
  `numberOfPeople` integer NOT NULL,
  `status` text DEFAULT 'ISSUED' NOT NULL,
  `isPaper` integer DEFAULT false NOT NULL,
  `attractionId` text NOT NULL,
  `userId` text NOT NULL,
  `createdAt` integer NOT NULL,
  `updatedAt` integer NOT NULL,
  FOREIGN KEY (`attractionId`) REFERENCES `attractions`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_tickets`("id", "index", "numberOfPeople", "status", "isPaper", "attractionId", "userId", "createdAt", "updatedAt")
SELECT "id", "index", "numberOfPeople", "status", "isPaper", "attractionId", "userId", "createdAt", "updatedAt" FROM `tickets`;--> statement-breakpoint
DROP TABLE `tickets`;--> statement-breakpoint
ALTER TABLE `__new_tickets` RENAME TO `tickets`;--> statement-breakpoint
DROP TABLE IF EXISTS `attracion`;--> statement-breakpoint
DROP TABLE IF EXISTS `attracions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=on;
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_register_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`laneId` text,
	`foodId` text NOT NULL,
	`total_amount` integer NOT NULL,
	`amount_paid` integer NOT NULL,
	`meta` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`laneId`) REFERENCES `register_lanes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`foodId`) REFERENCES `foods`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_register_logs`("id", "laneId", "foodId", "total_amount", "amount_paid", "meta", "createdAt", "updatedAt") SELECT "id", "laneId", "foodId", "total_amount", "amount_paid", "meta", "createdAt", "updatedAt" FROM `register_logs`;--> statement-breakpoint
DROP TABLE `register_logs`;--> statement-breakpoint
ALTER TABLE `__new_register_logs` RENAME TO `register_logs`;--> statement-breakpoint
PRAGMA defer_foreign_keys=off;
PRAGMA foreign_keys=ON;
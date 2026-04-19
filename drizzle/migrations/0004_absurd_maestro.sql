PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_invites` (
	`id` text PRIMARY KEY NOT NULL,
	`tokenHash` text NOT NULL,
	`issuerAdminId` text,
	`issuerScope` text NOT NULL,
	`targetScope` text NOT NULL,
	`organizationId` text,
	`eventId` text,
	`storeId` text,
	`maxUses` integer DEFAULT 1 NOT NULL,
	`usedCount` integer DEFAULT 0 NOT NULL,
	`expiresAt` integer NOT NULL,
	`usedAt` integer,
	`revokedAt` integer,
	`acceptedByUserId` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`issuerAdminId`) REFERENCES `admins`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`acceptedByUserId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_invites`("id", "tokenHash", "issuerAdminId", "issuerScope", "targetScope", "organizationId", "eventId", "storeId", "maxUses", "usedCount", "expiresAt", "usedAt", "revokedAt", "acceptedByUserId", "createdAt", "updatedAt") SELECT "id", "tokenHash", "issuerAdminId", "issuerScope", "targetScope", "organizationId", "eventId", "storeId", "maxUses", "usedCount", "expiresAt", "usedAt", "revokedAt", "acceptedByUserId", "createdAt", "updatedAt" FROM `invites`;--> statement-breakpoint
DROP TABLE `invites`;--> statement-breakpoint
ALTER TABLE `__new_invites` RENAME TO `invites`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `invites_tokenHash_unique` ON `invites` (`tokenHash`);--> statement-breakpoint
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
	FOREIGN KEY (`attractionId`) REFERENCES `attracions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_tickets`("id", "index", "numberOfPeople", "status", "isPaper", "attractionId", "userId", "createdAt", "updatedAt") SELECT "id", "index", "numberOfPeople", "status", "isPaper", "attractionId", "userId", "createdAt", "updatedAt" FROM `tickets`;--> statement-breakpoint
DROP TABLE `tickets`;--> statement-breakpoint
ALTER TABLE `__new_tickets` RENAME TO `tickets`;
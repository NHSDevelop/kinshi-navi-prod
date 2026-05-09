PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text,
	`name` text,
	`description` text,
	`createdAt` integer,
	`updatedAt` integer,
	`plan` text DEFAULT 'FREE'
);--> statement-breakpoint
CREATE TABLE `__new_admins` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`role` text NOT NULL,
	`eventId` text,
	`storeId` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_admins`("id", "userId", "role", "eventId", "storeId", "createdAt", "updatedAt") SELECT "id", "userId", "role", "eventId", "storeId", "createdAt", "updatedAt" FROM `admins`;--> statement-breakpoint
DROP TABLE `admins`;--> statement-breakpoint
ALTER TABLE `__new_admins` RENAME TO `admins`;--> statement-breakpoint
CREATE UNIQUE INDEX `admins_userId_unique` ON `admins` (`userId`);--> statement-breakpoint
CREATE TABLE `__new_events` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`isActive` integer DEFAULT false NOT NULL,
	`startedAtDate` integer,
	`startedAtTime` text,
	`finishedAtDate` integer,
	`finishedAtTime` text,
	`description` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_events`("id", "slug", "name", "isActive", "startedAtDate", "startedAtTime", "finishedAtDate", "finishedAtTime", "description", "createdAt", "updatedAt") SELECT "id", "slug", "name", "isActive", "startedAtDate", "startedAtTime", "finishedAtDate", "finishedAtTime", "description", "createdAt", "updatedAt" FROM `events`;--> statement-breakpoint
DROP TABLE `events`;--> statement-breakpoint
ALTER TABLE `__new_events` RENAME TO `events`;--> statement-breakpoint
CREATE TABLE `__new_invites` (
	`id` text PRIMARY KEY NOT NULL,
	`tokenHash` text NOT NULL,
	`issuerAdminId` text,
	`issuerScope` text NOT NULL,
	`targetScope` text NOT NULL,
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
	FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`acceptedByUserId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_invites`("id", "tokenHash", "issuerAdminId", "issuerScope", "targetScope", "eventId", "storeId", "maxUses", "usedCount", "expiresAt", "usedAt", "revokedAt", "acceptedByUserId", "createdAt", "updatedAt") SELECT "id", "tokenHash", "issuerAdminId", "issuerScope", "targetScope", "eventId", "storeId", "maxUses", "usedCount", "expiresAt", "usedAt", "revokedAt", "acceptedByUserId", "createdAt", "updatedAt" FROM `invites`;--> statement-breakpoint
DROP TABLE `invites`;--> statement-breakpoint
ALTER TABLE `__new_invites` RENAME TO `invites`;--> statement-breakpoint
CREATE UNIQUE INDEX `invites_tokenHash_unique` ON `invites` (`tokenHash`);--> statement-breakpoint
DROP INDEX IF EXISTS `stores_slug_unique`;
DROP TABLE IF EXISTS `organizations`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX `store_votes_user_id_store_type_unique`;--> statement-breakpoint
ALTER TABLE `store_votes` ADD `eventId` text NOT NULL REFERENCES events(id);--> statement-breakpoint
CREATE UNIQUE INDEX `store_votes_user_id_store_type_unique` ON `store_votes` (`userId`,`storeType`,`eventId`);
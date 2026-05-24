CREATE TABLE `pdf_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`fileUrl` text NOT NULL,
	`fileKey` text NOT NULL,
	`fileName` text NOT NULL,
	`mimeType` text NOT NULL,
	`fileSize` integer NOT NULL,
	`isPublished` integer DEFAULT true NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pdf_documents_fileKey_unique` ON `pdf_documents` (`fileKey`);
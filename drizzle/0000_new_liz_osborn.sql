CREATE TABLE `artworks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`artist` text NOT NULL,
	`medium` text NOT NULL,
	`year` integer NOT NULL,
	`dimensions` text NOT NULL,
	`price_cents` integer NOT NULL,
	`description` text NOT NULL,
	`image_url` text,
	`image_key` text,
	`owner_email` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `artworks_slug_unique` ON `artworks` (`slug`);
CREATE TABLE `chat` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`providerId` text NOT NULL,
	`modelId` text NOT NULL,
	`isStarred` integer DEFAULT false NOT NULL,
	`system` text,
	`temperature` real,
	`personaId` integer,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`personaId`) REFERENCES `persona`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `message` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text NOT NULL,
	`error` text,
	`isGenerating` integer DEFAULT false NOT NULL,
	`sender` text NOT NULL,
	`senderName` text NOT NULL,
	`providerId` text,
	`chatId` integer NOT NULL,
	`parentId` integer,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`chatId`) REFERENCES `chat`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parentId`) REFERENCES `message`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `persona` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`isStarred` integer DEFAULT false NOT NULL,
	`name` text NOT NULL,
	`avatar` text NOT NULL,
	`providerId` text,
	`modelId` text,
	`system` text,
	`temperature` real,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `setting` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text
);
--> statement-breakpoint
CREATE TABLE `snippet` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`shortcut` text NOT NULL,
	`text` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL
);

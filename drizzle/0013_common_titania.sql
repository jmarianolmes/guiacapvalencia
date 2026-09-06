ALTER TABLE `simulator_questions` ADD `internalCode` varchar(24);--> statement-breakpoint
ALTER TABLE `simulator_questions` ADD `equivalenceKey` text;--> statement-breakpoint
ALTER TABLE `simulator_questions` ADD `chapterId` varchar(50);--> statement-breakpoint
ALTER TABLE `simulator_questions` ADD `chapterCode` varchar(12);--> statement-breakpoint
ALTER TABLE `simulator_questions` ADD `origin` varchar(20) DEFAULT 'official' NOT NULL;--> statement-breakpoint
ALTER TABLE `simulator_questions` ADD `reviewStatus` varchar(20) DEFAULT 'pending_review' NOT NULL;--> statement-breakpoint
ALTER TABLE `simulator_questions` ADD `isVariant` boolean DEFAULT false NOT NULL;
CREATE TABLE `user_error_notebook_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`questionId` int NOT NULL,
	`chapterId` varchar(50),
	`wrongCount` int NOT NULL DEFAULT 1,
	`reviewLevel` int NOT NULL DEFAULT 0,
	`lastAnswer` varchar(1),
	`nextReviewAt` timestamp,
	`lastReviewedAt` timestamp,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_error_notebook_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_error_notebook_user_question_unique` UNIQUE(`userId`,`questionId`)
);
--> statement-breakpoint
CREATE INDEX `user_error_notebook_user_due_idx` ON `user_error_notebook_items` (`userId`,`nextReviewAt`);

ALTER TABLE `user_simulator_results` ADD `mode` varchar(20) DEFAULT 'statistical' NOT NULL;--> statement-breakpoint
ALTER TABLE `user_simulator_results` ADD `mode` varchar(20) NOT NULL DEFAULT 'statistical';--> statement-breakpoint
ALTER TABLE `user_simulator_results` ADD `chapterId` varchar(50);--> statement-breakpoint
ALTER TABLE `user_simulator_results` ADD `attemptNumber` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `user_simulator_results` ADD `questionCount` int DEFAULT 100 NOT NULL;--> statement-breakpoint
CREATE INDEX `user_simulator_results_user_created_idx` ON `user_simulator_results` (`userId`,`createdAt`);

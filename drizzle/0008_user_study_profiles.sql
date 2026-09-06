CREATE TABLE `user_study_profiles` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `track` enum('goods','passengers') NOT NULL DEFAULT 'goods',
  `targetExamDate` varchar(10),
  `dailyStudyMinutes` int NOT NULL DEFAULT 60,
  `planEnabled` boolean NOT NULL DEFAULT true,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `user_study_profiles_id` PRIMARY KEY(`id`),
  CONSTRAINT `user_study_profiles_user_unique` UNIQUE(`userId`)
);

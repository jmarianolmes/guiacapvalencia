CREATE TABLE `verified_official_questions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `sourceId` varchar(64) NOT NULL,
  `examDate` varchar(10) NOT NULL,
  `model` varchar(20) NOT NULL DEFAULT 'VERIFIED_OFFICIAL',
  `questionNumber` int NOT NULL,
  `subject` varchar(50) NOT NULL DEFAULT 'Mercancias',
  `question` text NOT NULL,
  `stem` text NOT NULL,
  `optionA` text NOT NULL,
  `optionB` text NOT NULL,
  `optionC` text NOT NULL,
  `optionD` text NOT NULL,
  `correctAnswer` varchar(1) NOT NULL,
  `isReserve` boolean NOT NULL DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `verified_official_questions_id` PRIMARY KEY(`id`),
  CONSTRAINT `verified_official_questions_sourceId_unique` UNIQUE(`sourceId`),
  CONSTRAINT `verified_official_questions_exam_number_unique` UNIQUE(`examDate`, `questionNumber`)
);
--> statement-breakpoint
CREATE INDEX `verified_official_questions_exam_order_idx` ON `verified_official_questions` (`examDate`, `questionNumber`);

CREATE TABLE IF NOT EXISTS `user_simulator_answers` (
  `id` int AUTO_INCREMENT NOT NULL,
  `resultId` int NOT NULL,
  `userId` int NOT NULL,
  `questionId` int NOT NULL,
  `questionIndex` int NOT NULL,
  `selectedAnswer` varchar(1),
  `correctAnswerAtAttempt` varchar(1) NOT NULL,
  `isCorrect` boolean NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `user_simulator_answers_id` PRIMARY KEY(`id`),
  KEY `user_simulator_answers_result_idx` (`resultId`),
  KEY `user_simulator_answers_question_idx` (`questionId`)
);

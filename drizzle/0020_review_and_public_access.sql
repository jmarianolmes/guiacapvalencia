CREATE TABLE IF NOT EXISTS `question_review_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `questionId` int NOT NULL,
  `userId` int NOT NULL,
  `status` enum('open','resolved') NOT NULL DEFAULT 'open',
  `note` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolvedAt` timestamp NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `question_review_reports_user_question_unique` (`userId`,`questionId`),
  KEY `question_review_reports_status_created_idx` (`status`,`createdAt`)
);
CREATE TABLE IF NOT EXISTS `site_settings` (
  `key` varchar(64) NOT NULL,
  `value` varchar(255) NOT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
);

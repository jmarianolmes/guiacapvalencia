CREATE TABLE `verified_official_corrections` (
  `id` int AUTO_INCREMENT NOT NULL,
  `sourceId` varchar(64) NOT NULL,
  `correctAnswer` varchar(1) NOT NULL,
  `note` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `verified_official_corrections_id` PRIMARY KEY(`id`),
  CONSTRAINT `verified_official_corrections_sourceId_unique` UNIQUE(`sourceId`)
);

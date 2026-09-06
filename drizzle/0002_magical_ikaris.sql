CREATE TABLE `repeated_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`percentage` varchar(10) NOT NULL,
	`question` text NOT NULL,
	`optionA` text NOT NULL,
	`optionB` text NOT NULL,
	`optionC` text NOT NULL,
	`optionD` text NOT NULL,
	`correctAnswer` text NOT NULL,
	`exams` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `repeated_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `siglas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`acronym` varchar(20) NOT NULL,
	`fullName` text NOT NULL,
	`descriptionPt` text NOT NULL,
	`descriptionEs` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `siglas_id` PRIMARY KEY(`id`),
	CONSTRAINT `siglas_acronym_unique` UNIQUE(`acronym`)
);
--> statement-breakpoint
CREATE TABLE `simulator_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`model` varchar(10) NOT NULL,
	`provaDate` varchar(20) NOT NULL,
	`questionNumber` int NOT NULL,
	`subject` varchar(100) NOT NULL,
	`question` text NOT NULL,
	`stem` text NOT NULL,
	`optionA` text NOT NULL,
	`optionB` text NOT NULL,
	`optionC` text NOT NULL,
	`optionD` text NOT NULL,
	`correctAnswer` varchar(1) NOT NULL,
	`normalized` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `simulator_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tricks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`percentage` varchar(10) NOT NULL,
	`descriptionPt` text NOT NULL,
	`descriptionEs` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tricks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_simulator_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`model` varchar(10) NOT NULL,
	`correctAnswers` int NOT NULL,
	`wrongAnswers` int NOT NULL,
	`blankAnswers` int NOT NULL,
	`score` int NOT NULL,
	`timeTaken` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now())
);

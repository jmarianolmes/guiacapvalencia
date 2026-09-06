ALTER TABLE `users` ADD `paymentReference` varchar(8);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_paymentReference_unique` UNIQUE(`paymentReference`);
ALTER TABLE `user_simulator_results`
  ADD COLUMN `studyMode` enum('exam','learning') NOT NULL DEFAULT 'exam' AFTER `mode`;

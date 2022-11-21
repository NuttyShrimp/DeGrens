DROP TABLE IF EXISTS `weed_plants`;

-- Drop old table
DROP TABLE IF EXISTS `weedplants`;

CREATE TABLE `weed_plants`
(
	`id` INT NOT NULL AUTO_INCREMENT,
	`stage` SMALLINT DEFAULT 1,
	`coords` TEXT DEFAULT NULL,
	`gender` ENUM('male', 'female') NOT NULL,
	`food` INT DEFAULT 100,
  `grow_time` BIGINT(20) DEFAULT NULL,
  `cut_time` BIGINT(20) DEFAULT NULL,
	PRIMARY KEY (`id`)
);

ALTER TABLE `character_reputations` ADD `cornersell` INT NOT NULL DEFAULT 0;
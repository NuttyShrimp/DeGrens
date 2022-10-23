DROP TABLE IF EXISTS `gang_info`;
DROP TABLE IF EXISTS `gang_members`;

-- Remove unused column character_info.backstory
ALTER TABLE `character_data` DROP COLUMN IF EXISTS `gang`;

-- Edit view all_character_data to account for previous changes ^
CREATE OR REPLACE VIEW all_character_data AS
SELECT c.*,
       ci.firstname,
       ci.lastname,
       ci.birthdate,
       ci.gender,
       ci.nationality,
       ci.phone,
       ci.cash,
       cd.position,
       cd.metadata
FROM characters AS c
       LEFT JOIN character_info AS ci ON ci.citizenid = c.citizenid
       LEFT JOIN character_data AS cd ON cd.citizenid = c.citizenid;

CREATE TABLE `gang_info`
(
	`name` VARCHAR(255) NOT NULL,
	`label` VARCHAR(255) NOT NULL,
	`owner` INT NOT NULL,
  PRIMARY KEY (`name`)
);

CREATE TABLE `gang_members`
(
	`id` INT NOT NULL AUTO_INCREMENT,
	`gang` VARCHAR(255) NOT NULL,
	`citizenid` INT NOT NULL,
	`hasPerms` TINYINT(1) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`gang`) REFERENCES gang_info (`name`) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (`citizenid`) REFERENCES characters (`citizenid`) ON UPDATE CASCADE ON DELETE CASCADE
);
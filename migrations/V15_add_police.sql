DROP TABLE IF EXISTS `plate_flags`;

/* 
Plate is not foreign key becuase it would need referenced in either plate or fakeplate.
Ensuring the value exists in player_vehicles gets done in backend.
*/
CREATE TABLE `plate_flags`
(
  `id` VARCHAR(36) NOT NULL,
  `plate` VARCHAR(8) NOT NULL,
  `reason` LONGTEXT NOT NULL,
  `issued_by` INT NOT NULL,
  `issued_date` INT NOT NULL,
  `expiration_date` INT NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`issued_by`) REFERENCES `characters` (`citizenid`) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE `inventory_items`
MODIFY `inventory` VARCHAR(100) NOT NULL;
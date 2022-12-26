DROP TABLE IF EXISTS `lockers`;

CREATE TABLE `lockers` (
  `id` VARCHAR(50) NOT NULL,
  `x` FLOAT NOT NULL,
  `y` FLOAT NOT NULL,
  `z` FLOAT NOT NULL,
  `radius` FLOAT NOT NULL,
  `owner` INT NULL,
  `password` VARCHAR(255) NULL,
  `price` INT NOT NULL,
  `payment_day` INT NOT NULL, 
  PRIMARY KEY (`id`),
  FOREIGN KEY (`owner`) REFERENCES `characters`(`citizenid`) ON UPDATE CASCADE ON DELETE SET NULL
)

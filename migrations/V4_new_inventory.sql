-- Remove old inventoryitems table
DROP TABLE inventoryitems;

-- Add new table
CREATE TABLE IF NOT EXISTS `inventory_items`
(
  `id` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `inventory` varchar(50) NOT NULL,
  `position` varchar(50) NOT NULL,
  `quality` float NOT NULL,
  `hotkey` int(11) DEFAULT NULL,
  `metadata` longtext NOT NULL,
  `lastDecayTime` int(11) NOT NULL,
  PRIMARY KEY (`id`)
);
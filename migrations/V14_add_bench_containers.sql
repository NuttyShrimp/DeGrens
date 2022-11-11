DROP TABLE IF EXISTS `character_reputations`;
DROP TABLE IF EXISTS `bench_levels`;
DROP TABLE IF EXISTS `container_benches`;

CREATE TABLE `character_reputations`
(
  `citizenid` INT NOT NULL,
  `crafting` INT NOT NULL DEFAULT 0,
	`ammo_crafting` INT NOT NULL DEFAULT 0,
	`mechanic_crafting` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`citizenid`),
  FOREIGN KEY (`citizenid`) REFERENCES `characters` (`citizenid`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE `bench_levels`
(
  `benchId` VARCHAR(50) NOT NULL,
  `level` INT NOT NULL,
  PRIMARY KEY (`benchId`)
);

CREATE TABLE `container_benches`
(
  `containerId` VARCHAR(50) NOT NULL,
  `keyItemId` VARCHAR(36),
  PRIMARY KEY (`containerId`),
  FOREIGN KEY (`keyItemId`) REFERENCES `inventory_items` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
);
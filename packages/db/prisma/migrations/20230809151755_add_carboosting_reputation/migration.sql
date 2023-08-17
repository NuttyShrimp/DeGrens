-- AlterTable
ALTER TABLE `character_reputations` ADD COLUMN `carboost_crafting` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `carboosting` INTEGER NOT NULL DEFAULT 0;

-- RedefineIndex
CREATE UNIQUE INDEX `realestate_locations_name_key` ON `realestate_locations`(`name`);
DROP INDEX `realestate_locations_name` ON `realestate_locations`;

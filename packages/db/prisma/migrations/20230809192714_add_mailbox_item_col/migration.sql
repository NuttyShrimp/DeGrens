-- AlterTable
ALTER TABLE `realestate_locations` ADD COLUMN `has_mailbox` VARCHAR(191) NULL;

-- RedefineIndex
CREATE UNIQUE INDEX `realestate_locations_name_key` ON `realestate_locations`(`name`);
DROP INDEX `realestate_locations_name` ON `realestate_locations`;

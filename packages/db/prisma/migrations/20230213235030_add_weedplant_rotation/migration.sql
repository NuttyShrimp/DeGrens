-- AlterTable
ALTER TABLE `weed_plants` ADD COLUMN `rotation` TEXT NULL,
    MODIFY `stage` SMALLINT NULL DEFAULT 0;

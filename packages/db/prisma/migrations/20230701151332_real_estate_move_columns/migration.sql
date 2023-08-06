/*
  Warnings:

  - You are about to drop the column `coords` on the `realestate_locations` table. All the data in the column will be lost.
  - You are about to drop the column `garage` on the `realestate_locations` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `realestate_locations` table. All the data in the column will be lost.
  - You are about to drop the `realestate_location_data` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `realestate_location_data` DROP FOREIGN KEY `fk_realestate_location_data_id`;

-- AlterTable
ALTER TABLE `realestate_locations` DROP COLUMN `coords`,
    DROP COLUMN `type`,
    ADD COLUMN `clothing` VARCHAR(191) NULL,
    ADD COLUMN `logout` VARCHAR(191) NULL,
    ADD COLUMN `stash` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `realestate_location_data`;
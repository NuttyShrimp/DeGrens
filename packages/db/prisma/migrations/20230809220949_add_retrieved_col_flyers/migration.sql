/*
  Warnings:

  - Made the column `has_mailbox` on table `realestate_locations` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `flyer_request` ADD COLUMN `retrieved` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `realestate_locations` MODIFY `has_mailbox` VARCHAR(191) NOT NULL;

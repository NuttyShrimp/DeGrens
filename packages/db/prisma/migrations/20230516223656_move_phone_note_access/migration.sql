/*
  Warnings:

  - You are about to drop the column `cid` on the `phone_notes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `phone_notes` DROP FOREIGN KEY `fk_phone_notes_cid`;

-- CreateTable
CREATE TABLE `phone_notes_access` (
    `note_id` INTEGER NOT NULL,
    `cid` INTEGER NOT NULL,
    `owner` BOOLEAN NOT NULL DEFAULT false,

    INDEX `fk_phone_notes_access_cid`(`cid`),
    PRIMARY KEY (`note_id`, `cid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `phone_notes_access` ADD CONSTRAINT `fk_phone_notes_access_cid` FOREIGN KEY (`cid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO `phone_notes_access` (`note_id`, `cid`, `owner`) SELECT `id`, `cid`, true FROM `phone_notes`;

-- AlterTable
ALTER TABLE `phone_notes` DROP COLUMN `cid`;
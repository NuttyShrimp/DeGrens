/*
  Warnings:

  - You are about to drop the column `coords` on the `cornerselling_sales` table. All the data in the column will be lost.
  - You are about to drop the `dealers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `houselocations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lapraces` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `occasion_vehicles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `player_boats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `player_houses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `player_mails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `player_warns` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `zone` to the `cornerselling_sales` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `lapraces` DROP FOREIGN KEY `fk_lapraces_license`;

-- DropForeignKey
ALTER TABLE `occasion_vehicles` DROP FOREIGN KEY `fk_occasion_vehicles_cid`;

-- DropForeignKey
ALTER TABLE `player_boats` DROP FOREIGN KEY `fk_player_boats_cid`;

-- DropForeignKey
ALTER TABLE `player_houses` DROP FOREIGN KEY `fk_player_houses_cid`;

-- DropForeignKey
ALTER TABLE `player_mails` DROP FOREIGN KEY `fk_player_mails_cid`;

-- AlterTable
ALTER TABLE `cornerselling_sales` DROP COLUMN `coords`,
    ADD COLUMN `zone` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `dealers`;

-- DropTable
DROP TABLE `houselocations`;

-- DropTable
DROP TABLE `lapraces`;

-- DropTable
DROP TABLE `occasion_vehicles`;

-- DropTable
DROP TABLE `player_boats`;

-- DropTable
DROP TABLE `player_houses`;

-- DropTable
DROP TABLE `player_mails`;

-- DropTable
DROP TABLE `player_warns`;

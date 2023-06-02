/*
  Warnings:

  - You are about to drop the column `cut_time` on the `weed_plants` table. All the data in the column will be lost.
  - You are about to drop the column `food` on the `weed_plants` table. All the data in the column will be lost.
  - You are about to drop the column `grow_time` on the `weed_plants` table. All the data in the column will be lost.
  - You are about to drop the column `stage` on the `weed_plants` table. All the data in the column will be lost.
  - You are about to drop the column `times_cut` on the `weed_plants` table. All the data in the column will be lost.
  - Made the column `coords` on table `weed_plants` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rotation` on table `weed_plants` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `weed_plants` DROP COLUMN `cut_time`,
    DROP COLUMN `food`,
    DROP COLUMN `grow_time`,
    DROP COLUMN `stage`,
    DROP COLUMN `times_cut`,
    ADD COLUMN `food_type` ENUM('none', 'normal', 'deluxe') NULL DEFAULT 'none',
    ADD COLUMN `plant_time` BIGINT NULL DEFAULT 0,
    ADD COLUMN `water_time` BIGINT NULL DEFAULT 0,
    MODIFY `coords` TEXT NOT NULL,
    MODIFY `rotation` TEXT NOT NULL;

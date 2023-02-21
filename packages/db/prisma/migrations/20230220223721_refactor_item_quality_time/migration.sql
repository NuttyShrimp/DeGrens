/*
  Warnings:

  - You are about to drop the column `lastDecayTime` on the `inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `quality` on the `inventory_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `inventory_items` DROP COLUMN `lastDecayTime`,
    DROP COLUMN `quality`;

UPDATE inventory_items SET destroyDate = (
  SELECT destroyDate
  FROM inventory_items as II
  WHERE II.id = inventory_items.id
) * 60;
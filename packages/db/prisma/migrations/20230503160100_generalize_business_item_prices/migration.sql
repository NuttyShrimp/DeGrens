/*
  Warnings:

  - You are about to drop the `restaurant_prices` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `restaurant_prices`;

-- CreateTable
CREATE TABLE `business_item_prices` (
    `business_id` INTEGER NOT NULL,
    `item` VARCHAR(255) NOT NULL,
    `price` INTEGER NOT NULL DEFAULT 0,

    INDEX `fk_business_item_prices_business`(`business_id`),
    PRIMARY KEY (`business_id`, `item`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `business_item_prices` ADD CONSTRAINT `fk_business_item_prices_business` FOREIGN KEY (`business_id`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

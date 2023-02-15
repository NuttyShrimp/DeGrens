-- CreateTable
CREATE TABLE `restaurant_prices` (
    `restaurant` VARCHAR(255) NOT NULL,
    `item` VARCHAR(255) NOT NULL,
    `price` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`restaurant`, `item`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

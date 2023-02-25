-- CreateTable
CREATE TABLE `active_labs` (
    `type` ENUM('weed', 'coke', 'meth') NOT NULL,
    `id` INTEGER NOT NULL,
    `refreshTime` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`type`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

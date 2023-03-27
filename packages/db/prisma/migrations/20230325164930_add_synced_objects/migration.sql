-- DropForeignKey
ALTER TABLE `admin_unannounced_warns` DROP FOREIGN KEY `admin_unannounced_warns_penaltyId_fkey`;

-- CreateTable
CREATE TABLE `synced_objects` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `model` VARCHAR(191) NOT NULL,
    `coords` VARCHAR(191) NOT NULL,
    `vectors` TEXT NOT NULL,
    `flags` VARCHAR(191) NOT NULL,
    `placer` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admin_unannounced_warns` ADD CONSTRAINT `admin_unannounced_warns_penaltyid_fkey` FOREIGN KEY (`penaltyid`) REFERENCES `penalties`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

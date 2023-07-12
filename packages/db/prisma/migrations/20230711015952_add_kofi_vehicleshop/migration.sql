-- CreateTable
CREATE TABLE `kofi_vehicleshop` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cid` INTEGER NOT NULL,
    `model` VARCHAR(255) NOT NULL,

    INDEX `fk_kofi_vehicleshop_cid`(`cid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `kofi_vehicleshop` ADD CONSTRAINT `fk_kofi_vehicleshop_cid` FOREIGN KEY (`cid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

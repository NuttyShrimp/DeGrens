-- CreateTable
CREATE TABLE `flyer_request` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cid` INTEGER NOT NULL,
    `link` LONGTEXT NOT NULL,
    `approved` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `flyer_request` ADD CONSTRAINT `fk_flyer_request_cid` FOREIGN KEY (`cid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

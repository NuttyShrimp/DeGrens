-- CreateTable
CREATE TABLE `admin_unannounced_warns` (
    `steamid` VARCHAR(255) NOT NULL,
    `penaltyid` INTEGER NOT NULL,

    PRIMARY KEY (`steamid`, `penaltyid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admin_unannounced_warns` ADD CONSTRAINT `admin_unannounced_warns_steamid_fkey` FOREIGN KEY (`steamid`) REFERENCES `users`(`steamid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_unannounced_warns` ADD CONSTRAINT `admin_unannounced_warns_penaltyId_fkey` FOREIGN KEY (`penaltyid`) REFERENCES `penalties`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

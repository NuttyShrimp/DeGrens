-- CreateTable
CREATE TABLE `gang_app_messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cid` INTEGER NOT NULL,
    `message` LONGTEXT NOT NULL,
    `date` BIGINT NOT NULL,
    `gang` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `gang_app_messages` ADD CONSTRAINT `gang_app_msgs_gang_fk` FOREIGN KEY (`gang`) REFERENCES `gang_info`(`name`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gang_app_messages` ADD CONSTRAINT `fk_gang_app_messages_cid` FOREIGN KEY (`cid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE `gang_feed_messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gang` VARCHAR(255) NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `date` BIGINT NULL DEFAULT 0,

    INDEX `gang`(`gang`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `gang_feed_messages` ADD CONSTRAINT `gang_feed_messages_ibfk_1` FOREIGN KEY (`gang`) REFERENCES `gang_info`(`name`) ON DELETE CASCADE ON UPDATE CASCADE;

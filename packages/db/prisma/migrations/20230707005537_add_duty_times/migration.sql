-- CreateTable
CREATE TABLE `duty_times` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cid` INTEGER NOT NULL,
    `context` VARCHAR(255) NOT NULL,
    `action` ENUM('start', 'stop') NOT NULL,
    `time` BIGINT NOT NULL,

    INDEX `fk_playerskins_cid`(`cid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `duty_times` ADD CONSTRAINT `fk_duty_times_cid` FOREIGN KEY (`cid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE `race_tracks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `creator` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('sprint', 'lap') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `race_checkpoints` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `trackId` INTEGER NOT NULL,
    `center` VARCHAR(191) NOT NULL,
    `spread` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `race_leaderboard` (
    `cid` INTEGER NOT NULL,
    `trackId` INTEGER NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `carName` VARCHAR(191) NOT NULL,
    `time` INTEGER NOT NULL,

    PRIMARY KEY (`cid`, `trackId`, `model`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `race_tracks` ADD CONSTRAINT `fk_races_creator` FOREIGN KEY (`creator`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `race_checkpoints` ADD CONSTRAINT `fk_race_checkpoint` FOREIGN KEY (`trackId`) REFERENCES `race_tracks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `race_leaderboard` ADD CONSTRAINT `fk_race_leaderboard_race` FOREIGN KEY (`trackId`) REFERENCES `race_tracks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `race_leaderboard` ADD CONSTRAINT `fk_race_leaderboard_character` FOREIGN KEY (`cid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

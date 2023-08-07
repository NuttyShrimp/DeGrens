-- CreateTable
CREATE TABLE `realestate_locations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `coords` VARCHAR(191) NOT NULL,
    `garage` VARCHAR(191) NULL,

    PRIMARY KEY (`id`),
    UNIQUE INDEX `realestate_locations_name`(`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `realestate_location_data` (
    `location_id` INTEGER NOT NULL,
    `stash` VARCHAR(191) NULL,
    `logout` VARCHAR(191) NULL,
    `clothing` VARCHAR(191) NULL,

    PRIMARY KEY (`location_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `realestate_location_access` (
    `location_id` INTEGER NOT NULL,
    `cid` INTEGER NOT NULL,
    `owner` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`location_id`, `cid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `realestate_location_data` ADD CONSTRAINT `fk_realestate_location_data_id` FOREIGN KEY (`location_id`) REFERENCES `realestate_locations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `realestate_location_access` ADD CONSTRAINT `fk_realestate_location_access_id` FOREIGN KEY (`location_id`) REFERENCES `realestate_locations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `realestate_location_access` ADD CONSTRAINT `fk_realestate_location_access_access_cid` FOREIGN KEY (`cid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

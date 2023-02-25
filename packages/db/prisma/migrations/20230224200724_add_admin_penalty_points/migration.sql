-- CreateTable
CREATE TABLE `admin_points` (
    `steamid` VARCHAR(255) NOT NULL,
    `points` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`steamid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admin_points` ADD CONSTRAINT `admin_points_steamid_fkey` FOREIGN KEY (`steamid`) REFERENCES `users`(`steamid`) ON DELETE CASCADE ON UPDATE CASCADE;

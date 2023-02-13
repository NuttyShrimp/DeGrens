-- CreateTable
CREATE TABLE `apartments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `citizenid` INTEGER NOT NULL,

    INDEX `fk_apartments_cid`(`citizenid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api_bans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ip` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api_tokens` (
    `token` VARCHAR(255) NOT NULL DEFAULT '',
    `comment` LONGTEXT NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_accounts` (
    `account_id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NULL DEFAULT 'Name',
    `type` ENUM('standard', 'savings', 'business') NOT NULL,
    `balance` FLOAT NULL,
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`account_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_accounts_access` (
    `account_id` VARCHAR(255) NOT NULL,
    `cid` INTEGER NOT NULL,
    `access_level` INTEGER NOT NULL DEFAULT 1,

    INDEX `fk_bank_accounts_access_cid`(`cid`),
    PRIMARY KEY (`account_id`, `cid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NULL,
    `steamid` VARCHAR(50) NULL,
    `license` VARCHAR(50) NULL,
    `discord` VARCHAR(50) NULL,
    `ip` VARCHAR(50) NULL,
    `reason` TEXT NULL,
    `expire` INTEGER NULL,
    `bannedby` VARCHAR(255) NOT NULL DEFAULT 'LeBanhammer',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bench_levels` (
    `benchId` VARCHAR(50) NOT NULL,
    `level` INTEGER NOT NULL,

    PRIMARY KEY (`benchId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(255) NOT NULL,
    `business_type` INTEGER NOT NULL,
    `bank_account_id` VARCHAR(255) NULL,
    `name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `name`(`name`),
    INDEX `fk_business_bank_account`(`bank_account_id`),
    INDEX `fk_business_business_type`(`business_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_employee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `is_owner` BOOLEAN NOT NULL DEFAULT false,
    `citizenid` INTEGER NOT NULL,
    `role_id` INTEGER NOT NULL,
    `business_id` INTEGER NOT NULL,

    INDEX `fk_business_employee_business`(`business_id`),
    INDEX `fk_business_employee_business_role`(`role_id`),
    INDEX `fk_business_employee_character`(`citizenid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `citizenid` INTEGER NOT NULL,
    `business_id` INTEGER NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    `action` TEXT NOT NULL,

    INDEX `fk_business_log_employee_business`(`business_id`),
    INDEX `fk_business_log_employee_character`(`citizenid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `permissions` INTEGER NOT NULL,
    `business_id` INTEGER NOT NULL,

    INDEX `fk_business_role_business`(`business_id`),
    UNIQUE INDEX `name`(`name`, `business_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_type` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `character_data` (
    `citizenid` INTEGER NOT NULL,
    `position` TEXT NOT NULL,
    `metadata` TEXT NOT NULL,
    `last_updated` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`citizenid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `character_info` (
    `citizenid` INTEGER NOT NULL,
    `firstname` TEXT NOT NULL,
    `lastname` TEXT NOT NULL,
    `birthdate` VARCHAR(11) NOT NULL,
    `gender` INTEGER NOT NULL,
    `nationality` TEXT NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `cash` BIGINT NULL DEFAULT 0,
    `last_updated` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`citizenid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `character_reputations` (
    `citizenid` INTEGER NOT NULL,
    `crafting` INTEGER NOT NULL DEFAULT 0,
    `ammo_crafting` INTEGER NOT NULL DEFAULT 0,
    `mechanic_crafting` INTEGER NOT NULL DEFAULT 0,
    `cornersell` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`citizenid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `characters` (
    `citizenid` INTEGER NOT NULL AUTO_INCREMENT,
    `steamid` VARCHAR(255) NOT NULL,
    `last_updated` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `steamid`(`steamid`),
    PRIMARY KEY (`citizenid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `container_benches` (
    `containerId` VARCHAR(50) NOT NULL,
    `keyItemId` VARCHAR(36) NULL,

    INDEX `keyItemId`(`keyItemId`),
    PRIMARY KEY (`containerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cornerselling_sales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `coords` TEXT NULL,
    `date` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `crypto` (
    `crypto_name` VARCHAR(255) NOT NULL,
    `value` INTEGER NOT NULL DEFAULT 100,

    PRIMARY KEY (`crypto_name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `crypto_wallets` (
    `cid` INTEGER NOT NULL,
    `crypto_name` VARCHAR(255) NOT NULL,
    `amount` INTEGER NOT NULL DEFAULT 0,

    INDEX `fk_crypto_wallets_name`(`crypto_name`),
    PRIMARY KEY (`cid`, `crypto_name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dealers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL DEFAULT '0',
    `coords` LONGTEXT NULL,
    `time` LONGTEXT NULL,
    `createdby` VARCHAR(50) NOT NULL DEFAULT '0',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `debts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cid` INTEGER NOT NULL,
    `target_account` VARCHAR(255) NOT NULL,
    `debt` FLOAT NULL,
    `payed` BIGINT NOT NULL DEFAULT 0,
    `type` ENUM('debt', 'maintenance') NOT NULL DEFAULT 'debt',
    `given_by` INTEGER NULL,
    `origin_name` TEXT NOT NULL,
    `date` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `reason` LONGTEXT NOT NULL,
    `event` VARCHAR(255) NULL,
    `pay_term` FLOAT NULL,

    INDEX `fk_debts_acc_id`(`target_account`),
    INDEX `fk_debts_cid`(`cid`),
    INDEX `fk_debts_origin_cid`(`given_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gang_info` (
    `name` VARCHAR(255) NOT NULL,
    `label` VARCHAR(255) NOT NULL,
    `owner` INTEGER NOT NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gang_members` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gang` VARCHAR(255) NOT NULL,
    `citizenid` INTEGER NOT NULL,
    `hasPerms` BOOLEAN NOT NULL,

    INDEX `citizenid`(`citizenid`),
    INDEX `gang`(`gang`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `houselocations` (
    `name` VARCHAR(255) NOT NULL,
    `label` VARCHAR(255) NULL,
    `coords` TEXT NULL,
    `owned` BOOLEAN NULL,
    `price` INTEGER NULL,
    `tier` TINYINT NULL,
    `garage` TEXT NULL,

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_items` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `inventory` VARCHAR(100) NOT NULL,
    `position` VARCHAR(50) NOT NULL,
    `quality` FLOAT NOT NULL,
    `hotkey` INTEGER NULL,
    `metadata` LONGTEXT NOT NULL,
    `lastDecayTime` INTEGER NOT NULL,
    `destroyDate` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lapraces` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NULL,
    `checkpoints` TEXT NULL,
    `records` TEXT NULL,
    `creator` VARCHAR(50) NULL,
    `distance` INTEGER NULL,
    `raceid` VARCHAR(50) NULL,

    INDEX `fk_lapraces_license`(`creator`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lockers` (
    `id` VARCHAR(50) NOT NULL,
    `x` FLOAT NOT NULL,
    `y` FLOAT NOT NULL,
    `z` FLOAT NOT NULL,
    `radius` FLOAT NOT NULL,
    `owner` INTEGER NULL,
    `password` VARCHAR(255) NULL,
    `price` INTEGER NOT NULL,
    `payment_day` INTEGER NOT NULL,

    INDEX `owner`(`owner`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `maintenance_fee_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `migrations_tracker` (
    `version` INTEGER NOT NULL DEFAULT 1
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `occasion_vehicles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `seller` INTEGER NULL,
    `price` INTEGER NULL,
    `description` LONGTEXT NULL,
    `plate` VARCHAR(50) NULL,
    `model` VARCHAR(50) NULL,
    `mods` TEXT NULL,
    `occasionid` VARCHAR(50) NULL,

    INDEX `fk_occasion_vehicles_cid`(`seller`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `penalties` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `steamId` VARCHAR(255) NOT NULL,
    `penalty` ENUM('ban', 'kick', 'warn') NOT NULL,
    `reason` LONGTEXT NOT NULL,
    `points` INTEGER NOT NULL DEFAULT 0,
    `length` INTEGER NULL,
    `date` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `automated` BOOLEAN NOT NULL DEFAULT false,

    INDEX `steamId`(`steamId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `steamid` VARCHAR(255) NOT NULL,
    `role` VARCHAR(255) NOT NULL,

    INDEX `name`(`name`),
    INDEX `steamid`(`steamid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `phone_contacts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cid` INTEGER NOT NULL,
    `label` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,

    INDEX `fk_phone_contacts_cid`(`cid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `phone_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cid` INTEGER NOT NULL,
    `link` VARCHAR(255) NOT NULL,

    INDEX `fk_phone_images_cid`(`cid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `phone_mails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cid` INTEGER NOT NULL,
    `sender` VARCHAR(255) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `message` LONGTEXT NOT NULL,

    INDEX `fk_phone_mails_cid`(`cid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `phone_messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sender` VARCHAR(255) NOT NULL,
    `receiver` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `isread` BOOLEAN NOT NULL,
    `date` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `phone_notes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cid` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `note` LONGTEXT NOT NULL,
    `date` BIGINT NOT NULL,

    INDEX `fk_phone_notes_cid`(`cid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `phone_tweets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cid` INTEGER NOT NULL,
    `tweet` LONGTEXT NOT NULL,
    `date` BIGINT NOT NULL,

    INDEX `fk_phone_tweets_cid`(`cid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `phone_tweets_likes` (
    `tweetid` INTEGER NOT NULL,
    `cid` INTEGER NOT NULL,

    INDEX `fk_phone_tweets_likes_cid`(`cid`),
    PRIMARY KEY (`tweetid`, `cid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `phone_tweets_retweets` (
    `tweetid` INTEGER NOT NULL,
    `cid` INTEGER NOT NULL,

    INDEX `fk_phone_tweets_retweets_cid`(`cid`),
    PRIMARY KEY (`tweetid`, `cid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plate_flags` (
    `id` VARCHAR(36) NOT NULL,
    `plate` VARCHAR(8) NOT NULL,
    `reason` LONGTEXT NOT NULL,
    `issued_by` INTEGER NOT NULL,
    `issued_date` INTEGER NOT NULL,
    `expiration_date` INTEGER NOT NULL,

    INDEX `issued_by`(`issued_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `player_boats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `citizenid` INTEGER NULL,
    `model` VARCHAR(50) NULL,
    `plate` VARCHAR(50) NULL,
    `boathouse` VARCHAR(50) NULL,
    `fuel` INTEGER NOT NULL DEFAULT 100,
    `state` INTEGER NOT NULL DEFAULT 0,

    INDEX `fk_player_boats_cid`(`citizenid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `player_houses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `house` VARCHAR(50) NOT NULL,
    `identifier` VARCHAR(50) NULL,
    `citizenid` INTEGER NULL,
    `keyholders` TEXT NULL,
    `decorations` TEXT NULL,
    `stash` TEXT NULL,
    `outfit` TEXT NULL,
    `logout` TEXT NULL,

    INDEX `fk_player_houses_cid`(`citizenid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `player_mails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `citizenid` INTEGER NULL,
    `sender` VARCHAR(50) NULL,
    `subject` VARCHAR(50) NULL,
    `message` TEXT NULL,
    `read` TINYINT NULL DEFAULT 0,
    `mailid` INTEGER NULL,
    `date` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `button` TEXT NULL,

    INDEX `fk_player_mails_cid`(`citizenid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `player_outfits` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `citizenid` INTEGER NULL,
    `outfitname` VARCHAR(50) NOT NULL,
    `model` VARCHAR(50) NULL,
    `skin` TEXT NULL,
    `outfitId` VARCHAR(50) NOT NULL,

    INDEX `fk_player_outfits_cid`(`citizenid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `player_paycheck` (
    `cid` INTEGER NOT NULL,
    `amount` BIGINT NOT NULL,

    PRIMARY KEY (`cid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `player_vehicles` (
    `vin` VARCHAR(255) NOT NULL,
    `cid` INTEGER NOT NULL,
    `model` VARCHAR(255) NOT NULL,
    `plate` VARCHAR(8) NOT NULL,
    `fakeplate` VARCHAR(8) NULL,
    `state` ENUM('parked', 'out', 'impounded') NOT NULL DEFAULT 'parked',
    `garageId` VARCHAR(255) NOT NULL DEFAULT 'alta_apartments',
    `harness` SMALLINT NOT NULL DEFAULT 0,
    `stance` LONGTEXT NULL,
    `wax` INTEGER NULL,
    `nos` SMALLINT NOT NULL DEFAULT 0,

    INDEX `cid`(`cid`),
    PRIMARY KEY (`vin`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `player_warns` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `senderIdentifier` VARCHAR(50) NULL,
    `targetIdentifier` VARCHAR(50) NULL,
    `reason` TEXT NULL,
    `warnId` VARCHAR(50) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `playerskins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `citizenid` INTEGER NOT NULL,
    `model` VARCHAR(255) NOT NULL,
    `skin` TEXT NOT NULL,
    `active` TINYINT NOT NULL DEFAULT 1,

    INDEX `fk_playerskins_cid`(`citizenid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `queue_priority` (
    `steamid` VARCHAR(255) NOT NULL,
    `priority` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`steamid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tax_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `taxes` (
    `tax_id` INTEGER NOT NULL AUTO_INCREMENT,
    `tax_name` VARCHAR(255) NOT NULL,
    `tax_rate` INTEGER NOT NULL DEFAULT 0,
    `set_date` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`tax_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_log` (
    `transaction_id` VARCHAR(255) NOT NULL,
    `origin_account_id` VARCHAR(255) NOT NULL,
    `origin_account_name` VARCHAR(255) NOT NULL,
    `origin_change` FLOAT NOT NULL,
    `target_account_id` VARCHAR(255) NOT NULL,
    `target_account_name` VARCHAR(255) NOT NULL,
    `target_change` FLOAT NOT NULL,
    `comment` LONGTEXT NOT NULL DEFAULT '',
    `triggered_by` VARCHAR(255) NOT NULL,
    `accepted_by` VARCHAR(255) NULL,
    `date` BIGINT NOT NULL,
    `type` ENUM('transfer', 'deposit', 'withdraw', 'purchase', 'paycheck', 'mobile_transaction') NOT NULL,

    PRIMARY KEY (`transaction_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_kill_stats` (
    `steamid` VARCHAR(255) NOT NULL,
    `shots` INTEGER NULL DEFAULT 0,
    `kills` INTEGER NULL DEFAULT 0,
    `headshots` INTEGER NULL DEFAULT 0,

    PRIMARY KEY (`steamid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `name` VARCHAR(255) NOT NULL,
    `steamid` VARCHAR(255) NOT NULL,
    `license` VARCHAR(255) NOT NULL,
    `discord` VARCHAR(255) NOT NULL,
    `last_updated` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `license`(`license`),
    INDEX `name`(`name`),
    PRIMARY KEY (`steamid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_depot_info` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vin` VARCHAR(255) NOT NULL,
    `price` INTEGER NOT NULL,
    `created_at` INTEGER NOT NULL DEFAULT (unix_timestamp(current_timestamp())),
    `until` INTEGER NOT NULL,

    INDEX `vin`(`vin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_garage_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vin` VARCHAR(255) NOT NULL,
    `cid` INTEGER NOT NULL,
    `logDate` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `action` ENUM('parked', 'retrieved') NULL,
    `state` TEXT NOT NULL,

    INDEX `vin`(`vin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_resale` (
    `vin` VARCHAR(255) NOT NULL,
    `model` VARCHAR(255) NULL,
    `plate` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`vin`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_restocks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `model` VARCHAR(255) NOT NULL,
    `restockDate` DATE NOT NULL,

    INDEX `model`(`model`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_service_status` (
    `vin` VARCHAR(255) NOT NULL,
    `axle` FLOAT NOT NULL DEFAULT 1000,
    `brakes` FLOAT NOT NULL DEFAULT 1000,
    `engine` FLOAT NOT NULL DEFAULT 1000,
    `suspension` FLOAT NOT NULL DEFAULT 1000,

    PRIMARY KEY (`vin`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_status` (
    `vin` VARCHAR(255) NOT NULL,
    `body` VARCHAR(255) NOT NULL DEFAULT '1000',
    `engine` VARCHAR(255) NOT NULL DEFAULT '1000',
    `fuel` VARCHAR(255) NOT NULL DEFAULT '100',
    `wheels` LONGTEXT NOT NULL DEFAULT '[1000,1000,1000,1000,1000,1000,1000,1000,1000,1000]',
    `windows` LONGTEXT NOT NULL DEFAULT '[1,1,1,1,1,1,1,1]',
    `doors` LONGTEXT NOT NULL DEFAULT '[0,0,0,0,0,0,0,0]',

    PRIMARY KEY (`vin`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_stock` (
    `model` VARCHAR(255) NOT NULL,
    `stock` INTEGER NOT NULL,

    PRIMARY KEY (`model`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_strikes` (
    `vin` VARCHAR(255) NOT NULL,
    `strikes` INTEGER NOT NULL DEFAULT 0,
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`vin`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_transfer_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vin` VARCHAR(255) NOT NULL,
    `origin` INTEGER NOT NULL,
    `target` INTEGER NOT NULL,
    `logDate` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `target`(`target`),
    INDEX `vin`(`vin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_upgrades` (
    `vin` VARCHAR(255) NOT NULL,
    `cosmetic` LONGTEXT NOT NULL DEFAULT '{}',
    `items` LONGTEXT NOT NULL DEFAULT '[]',

    PRIMARY KEY (`vin`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `weed_plants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stage` SMALLINT NULL DEFAULT 1,
    `coords` TEXT NULL,
    `gender` ENUM('male', 'female') NOT NULL,
    `food` INTEGER NULL DEFAULT 100,
    `grow_time` BIGINT NULL,
    `cut_time` BIGINT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `whitelist` (
    `name` VARCHAR(255) NOT NULL,
    `steam_id` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `whitelist_jobs` (
    `cid` INTEGER NOT NULL,
    `job` VARCHAR(255) NOT NULL,
    `rank` INTEGER NOT NULL DEFAULT 0,
    `specialty` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`cid`, `job`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `apartments` ADD CONSTRAINT `fk_apartments_cid` FOREIGN KEY (`citizenid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bank_accounts_access` ADD CONSTRAINT `fk_bank_accounts_access_account_id` FOREIGN KEY (`account_id`) REFERENCES `bank_accounts`(`account_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bank_accounts_access` ADD CONSTRAINT `fk_bank_accounts_access_cid` FOREIGN KEY (`cid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business` ADD CONSTRAINT `fk_business_bank_account` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts`(`account_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business` ADD CONSTRAINT `fk_business_business_type` FOREIGN KEY (`business_type`) REFERENCES `business_type`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_employee` ADD CONSTRAINT `fk_business_employee_business` FOREIGN KEY (`business_id`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_employee` ADD CONSTRAINT `fk_business_employee_business_role` FOREIGN KEY (`role_id`) REFERENCES `business_role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_employee` ADD CONSTRAINT `fk_business_employee_character` FOREIGN KEY (`citizenid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_log` ADD CONSTRAINT `fk_business_log_employee_business` FOREIGN KEY (`business_id`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_log` ADD CONSTRAINT `fk_business_log_employee_character` FOREIGN KEY (`citizenid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_role` ADD CONSTRAINT `fk_business_role_business` FOREIGN KEY (`business_id`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `character_data` ADD CONSTRAINT `character_data_ibfk_1` FOREIGN KEY (`citizenid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `character_info` ADD CONSTRAINT `character_info_ibfk_1` FOREIGN KEY (`citizenid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `character_reputations` ADD CONSTRAINT `character_reputations_ibfk_1` FOREIGN KEY (`citizenid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `characters` ADD CONSTRAINT `characters_ibfk_1` FOREIGN KEY (`steamid`) REFERENCES `users`(`steamid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `container_benches` ADD CONSTRAINT `container_benches_ibfk_1` FOREIGN KEY (`keyItemId`) REFERENCES `inventory_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `crypto_wallets` ADD CONSTRAINT `fk_crypto_wallets_cid` FOREIGN KEY (`cid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `crypto_wallets` ADD CONSTRAINT `fk_crypto_wallets_name` FOREIGN KEY (`crypto_name`) REFERENCES `crypto`(`crypto_name`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `debts` ADD CONSTRAINT `fk_debts_acc_id` FOREIGN KEY (`target_account`) REFERENCES `bank_accounts`(`account_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `debts` ADD CONSTRAINT `fk_debts_cid` FOREIGN KEY (`cid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `debts` ADD CONSTRAINT `fk_debts_origin_cid` FOREIGN KEY (`given_by`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gang_members` ADD CONSTRAINT `gang_members_ibfk_1` FOREIGN KEY (`gang`) REFERENCES `gang_info`(`name`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gang_members` ADD CONSTRAINT `gang_members_ibfk_2` FOREIGN KEY (`citizenid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lapraces` ADD CONSTRAINT `fk_lapraces_license` FOREIGN KEY (`creator`) REFERENCES `users`(`steamid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lockers` ADD CONSTRAINT `lockers_ibfk_1` FOREIGN KEY (`owner`) REFERENCES `characters`(`citizenid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `occasion_vehicles` ADD CONSTRAINT `fk_occasion_vehicles_cid` FOREIGN KEY (`seller`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_ibfk_1` FOREIGN KEY (`steamid`) REFERENCES `users`(`steamid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phone_contacts` ADD CONSTRAINT `fk_phone_contacts_cid` FOREIGN KEY (`cid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phone_images` ADD CONSTRAINT `fk_phone_images_cid` FOREIGN KEY (`cid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phone_mails` ADD CONSTRAINT `fk_phone_mails_cid` FOREIGN KEY (`cid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phone_notes` ADD CONSTRAINT `fk_phone_notes_cid` FOREIGN KEY (`cid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phone_tweets` ADD CONSTRAINT `fk_phone_tweets_cid` FOREIGN KEY (`cid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phone_tweets_likes` ADD CONSTRAINT `fk_phone_tweets_likes_cid` FOREIGN KEY (`cid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phone_tweets_likes` ADD CONSTRAINT `fk_phone_tweets_likes_tweetid` FOREIGN KEY (`tweetid`) REFERENCES `phone_tweets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phone_tweets_retweets` ADD CONSTRAINT `fk_phone_tweets_retweets_cid` FOREIGN KEY (`cid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phone_tweets_retweets` ADD CONSTRAINT `fk_phone_tweets_retweets_tweetid` FOREIGN KEY (`tweetid`) REFERENCES `phone_tweets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plate_flags` ADD CONSTRAINT `plate_flags_ibfk_1` FOREIGN KEY (`issued_by`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `player_boats` ADD CONSTRAINT `fk_player_boats_cid` FOREIGN KEY (`citizenid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `player_houses` ADD CONSTRAINT `fk_player_houses_cid` FOREIGN KEY (`citizenid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `player_mails` ADD CONSTRAINT `fk_player_mails_cid` FOREIGN KEY (`citizenid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `player_outfits` ADD CONSTRAINT `fk_player_outfits_cid` FOREIGN KEY (`citizenid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `player_paycheck` ADD CONSTRAINT `fk_player_paycheck_cid` FOREIGN KEY (`cid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `player_vehicles` ADD CONSTRAINT `player_vehicles_ibfk_1` FOREIGN KEY (`cid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `playerskins` ADD CONSTRAINT `fk_playerskins_cid` FOREIGN KEY (`citizenid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_kill_stats` ADD CONSTRAINT `user_kill_stats_ibfk_1` FOREIGN KEY (`steamid`) REFERENCES `users`(`steamid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_depot_info` ADD CONSTRAINT `vehicle_depot_info_ibfk_1` FOREIGN KEY (`vin`) REFERENCES `player_vehicles`(`vin`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_garage_logs` ADD CONSTRAINT `vehicle_garage_logs_ibfk_1` FOREIGN KEY (`vin`) REFERENCES `player_vehicles`(`vin`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_restocks` ADD CONSTRAINT `vehicle_restocks_ibfk_1` FOREIGN KEY (`model`) REFERENCES `vehicle_stock`(`model`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_service_status` ADD CONSTRAINT `vehicle_service_status_ibfk_1` FOREIGN KEY (`vin`) REFERENCES `player_vehicles`(`vin`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_status` ADD CONSTRAINT `vehicle_status_ibfk_1` FOREIGN KEY (`vin`) REFERENCES `player_vehicles`(`vin`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_strikes` ADD CONSTRAINT `vehicle_strikes_ibfk_1` FOREIGN KEY (`vin`) REFERENCES `player_vehicles`(`vin`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_transfer_logs` ADD CONSTRAINT `vehicle_transfer_logs_ibfk_1` FOREIGN KEY (`vin`) REFERENCES `player_vehicles`(`vin`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_transfer_logs` ADD CONSTRAINT `vehicle_transfer_logs_ibfk_2` FOREIGN KEY (`target`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicle_upgrades` ADD CONSTRAINT `vehicle_upgrades_ibfk_1` FOREIGN KEY (`vin`) REFERENCES `player_vehicles`(`vin`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `whitelist_jobs` ADD CONSTRAINT `fk_whitelist_jobs_cid` FOREIGN KEY (`cid`) REFERENCES `characters`(`citizenid`) ON DELETE CASCADE ON UPDATE CASCADE;


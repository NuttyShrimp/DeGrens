DELETE FROM `cornerselling_sales`;

ALTER TABLE `cornerselling_sales` DROP COLUMN `coords`;
ALTER TABLE `cornerselling_sales` ADD COLUMN `zone` VARCHAR(50) NOT NULL;
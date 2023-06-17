-- AlterTable
ALTER TABLE `container_benches` ADD COLUMN `gang` VARCHAR(255) NULL;

-- CreateIndex
CREATE INDEX `gang` ON `container_benches`(`gang`);

-- AddForeignKey
ALTER TABLE `container_benches` ADD CONSTRAINT `container_benches_ibfk_2` FOREIGN KEY (`gang`) REFERENCES `gang_info`(`name`) ON DELETE SET NULL ON UPDATE CASCADE;

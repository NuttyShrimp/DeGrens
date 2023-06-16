-- CreateIndex
CREATE INDEX `fk_phone_notes_access_note_id` ON `phone_notes_access`(`note_id`);

-- AddForeignKey
ALTER TABLE `phone_notes_access` ADD CONSTRAINT `fk_phone_notes_access_note_id` FOREIGN KEY (`note_id`) REFERENCES `phone_notes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

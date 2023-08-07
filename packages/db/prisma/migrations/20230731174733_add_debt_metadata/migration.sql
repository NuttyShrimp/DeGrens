/*
  Warnings:

  - Added the required column `metadata` to the `debts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `debts` ADD COLUMN `metadata` LONGTEXT NOT NULL DEFAULT '{}';

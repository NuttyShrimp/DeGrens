/*
  Warnings:

  - You are about to drop the column `specialty` on the `whitelist_jobs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `whitelist_jobs` RENAME COLUMN `specialty` TO `speciality`;

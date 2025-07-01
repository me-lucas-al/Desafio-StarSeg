/*
  Warnings:

  - Added the required column `cep` to the `contacts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `contacts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `district` to the `contacts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `contacts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `contacts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `contacts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `contacts` ADD COLUMN `cep` VARCHAR(191) NOT NULL,
    ADD COLUMN `city` VARCHAR(191) NOT NULL,
    ADD COLUMN `complement` VARCHAR(191) NULL,
    ADD COLUMN `district` VARCHAR(191) NOT NULL,
    ADD COLUMN `number` VARCHAR(191) NOT NULL,
    ADD COLUMN `state` VARCHAR(191) NOT NULL,
    ADD COLUMN `street` VARCHAR(191) NOT NULL;

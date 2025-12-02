/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Admin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "updatedAt",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'admin';

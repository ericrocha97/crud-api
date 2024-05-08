/*
  Warnings:

  - Added the required column `createdBy` to the `board` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `board` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "board" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedBy" TEXT;

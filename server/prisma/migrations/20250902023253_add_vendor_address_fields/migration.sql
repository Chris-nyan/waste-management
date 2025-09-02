/*
  Warnings:

  - You are about to drop the column `address` on the `VendorProfile` table. All the data in the column will be lost.
  - Added the required column `city` to the `VendorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `VendorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `district` to the `VendorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `VendorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `VendorProfile` table without a default value. This is not possible if the table is not empty.
  - Made the column `operatingHours` on table `VendorProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."VendorProfile" DROP COLUMN "address",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "district" TEXT NOT NULL,
ADD COLUMN     "street" TEXT NOT NULL,
ADD COLUMN     "zipCode" TEXT NOT NULL,
ALTER COLUMN "operatingHours" SET NOT NULL;

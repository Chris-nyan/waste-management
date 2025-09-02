/*
  Warnings:

  - You are about to drop the column `paymentStatus` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `stripePaymentId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `VendorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `serviceArea` on the `VendorProfile` table. All the data in the column will be lost.
  - Added the required column `bookingId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `address` to the `VendorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `VendorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `VendorProfile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."VendorProfile" DROP CONSTRAINT "VendorProfile_userId_fkey";

-- DropIndex
DROP INDEX "public"."Booking_stripePaymentId_key";

-- AlterTable
ALTER TABLE "public"."Booking" DROP COLUMN "paymentStatus",
DROP COLUMN "stripePaymentId";

-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "bookingId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."VendorProfile" DROP COLUMN "description",
DROP COLUMN "serviceArea",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "operatingHours" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "public"."UserProfile"("userId");

-- AddForeignKey
ALTER TABLE "public"."UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorProfile" ADD CONSTRAINT "VendorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

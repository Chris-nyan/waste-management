-- CreateEnum
CREATE TYPE "public"."WasteType" AS ENUM ('PLASTIC', 'PAPER', 'GLASS', 'ORGANIC', 'ELECTRONIC', 'METAL', 'OTHER');

-- CreateTable
CREATE TABLE "public"."WasteEntry" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "wasteType" "public"."WasteType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WasteEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."WasteEntry" ADD CONSTRAINT "WasteEntry_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

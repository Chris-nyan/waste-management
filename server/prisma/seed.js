const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // --- CLEANUP (in correct order to avoid constraint errors) ---
  await prisma.wasteEntry.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Cleaned up existing data.');

  // --- CREATE USERS ---
  const admin = await prisma.user.create({ data: { email: 'admin@wastemanagement.com', name: 'Admin User', password: await bcrypt.hash('password123', 10), role: 'ADMIN' } });
  const vendorUser = await prisma.user.create({ data: { email: 'vendor@wastemanagement.com', name: 'Eco Warriors', password: await bcrypt.hash('password123', 10), role: 'VENDOR' } });
  const user1 = await prisma.user.create({ data: { email: 'john.doe@email.com', name: 'John Doe', password: await bcrypt.hash('password123', 10), role: 'USER' } });
  console.log('✅ Created users (admin, vendor, user1).');

  // --- CREATE PROFILES ---
  await prisma.userProfile.create({ data: { userId: user1.id } });
  const vendorProfile = await prisma.vendorProfile.create({
    data: {
      userId: vendorUser.id,
      businessName: 'Eco Warriors Inc.',
      phone: '555-0101',
      street: '100 Recycling Rd',
      district: 'Khlong Toei',
      city: 'Bangkok',
      zipCode: '10110',
      country: 'Thailand',
      operatingHours: JSON.stringify({
          "Monday": { "start": "09:00", "end": "17:00" },
          "Tuesday": { "start": "09:00", "end": "17:00" },
          "Wednesday": { "start": "09:00", "end": "17:00" },
          "Thursday": { "start": "09:00", "end": "17:00" },
          "Friday": { "start": "09:00", "end": "17:00" }
      }),
    },
  });
  console.log('✅ Created profiles.');

  // --- CREATE BOOKINGS ---
  const completedBooking1 = await prisma.booking.create({ data: { userId: user1.id, vendorId: vendorProfile.id, pickupLocation: "123 Green St, Metropolis", pickupTime: new Date(new Date().setDate(new Date().getDate() - 7)), status: 'COMPLETED' } });
  const completedBooking2 = await prisma.booking.create({ data: { userId: user1.id, vendorId: vendorProfile.id, pickupLocation: "456 Park Ave, Metropolis", pickupTime: new Date(new Date().setDate(new Date().getDate() - 14)), status: 'COMPLETED' } });
  const pendingBooking = await prisma.booking.create({ data: { userId: user1.id, vendorId: vendorProfile.id, pickupLocation: "789 Main Blvd, Metropolis", pickupTime: new Date(new Date().setDate(new Date().getDate() + 3)), status: 'PENDING' } });
  console.log('✅ Created sample bookings.');

  // --- CREATE WASTE ENTRIES ---
  await prisma.wasteEntry.createMany({
      data: [
          { bookingId: completedBooking1.id, wasteType: 'PLASTIC', quantity: 5.5, unit: 'kg' },
          { bookingId: completedBooking1.id, wasteType: 'PAPER', quantity: 10.2, unit: 'kg' },
          { bookingId: completedBooking2.id, wasteType: 'PLASTIC', quantity: 8.1, unit: 'kg' },
          { bookingId: completedBooking2.id, wasteType: 'ORGANIC', quantity: 15.0, unit: 'kg' },
      ]
  });
  console.log('✅ Created sample waste entries.');
  console.log('Seeding finished successfully! 🚀');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
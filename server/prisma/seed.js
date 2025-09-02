const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // --- HASHED PASSWORDS ---
  const password = await bcrypt.hash('password123', 10);

  // --- CLEANUP ---
  await prisma.notification.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleaned up existing data.');

  // --- CREATE USERS ---
  const admin = await prisma.user.create({
    data: {
      email: 'admin@wastemanagement.com',
      name: 'Admin User',
      password: password,
      role: 'ADMIN',
    },
  });

  const vendorUser = await prisma.user.create({
    data: {
      email: 'vendor@wastemanagement.com',
      name: 'Eco Warriors',
      password: password,
      role: 'VENDOR',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'john.doe@email.com',
      name: 'John Doe',
      password: password,
      role: 'USER',
    },
  });
  console.log('Created users (admin, vendor, user1).');

  // --- CREATE USER PROFILE ---
  await prisma.userProfile.create({ data: { userId: user1.id } });
  console.log('Created user profile.');

  // --- CREATE VENDOR PROFILE (with new structured address) ---
  const vendorProfile = await prisma.vendorProfile.create({
    data: {
      userId: vendorUser.id,
      businessName: 'Eco Warriors Inc.',
      phone: '555-0101',
      street: '123 Sukhumvit Road',
      district: 'Khlong Toei', // New required field
      city: 'Bangkok',           // Represents Province
      zipCode: '10110',
      country: 'Thailand',
      operatingHours: 'Mon-Fri 9am-5pm',
      isAvailable: true,
    },
  });
  console.log('Created vendor profile with structured address.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


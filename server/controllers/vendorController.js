const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Get all available vendors
 * @route   GET /api/vendors
 * @access  Private
 */
const getVendors = async (req, res) => {
  try {
    // We find all users with the role 'VENDOR'
    // Then we include their associated vendorProfile to get the business details.
    const vendors = await prisma.user.findMany({
      where: {
        role: 'VENDOR',
        vendorProfile: {
          isAvailable: true, // Only fetch vendors who are currently available
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        vendorProfile: {
          select: {
            id: true,
            businessName: true,
            phone: true,
            street: true,
            district: true,
            city: true,
            zipCode: true,
            country: true,
            operatingHours: true,
          },
        },
      },
    });

    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getVendors,
};

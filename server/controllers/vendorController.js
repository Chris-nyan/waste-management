const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Controller to get all vendors, now with enhanced filtering capabilities
const getAllVendors = async (req, res) => {
  // 1. Get all possible geo-location filters from the query parameters
  const { country, city, district } = req.query;

  try {
    // 2. Build a dynamic query based on the filters provided
    const whereClause = {
      role: 'VENDOR',
      vendorProfile: {
        isAvailable: true, // Always ensure we only show available vendors
      },
    };

    // Dynamically add filters to the query if they exist
    if (country) {
      whereClause.vendorProfile.country = country;
    }
    if (city) { // 'city' in our schema represents the province/state
      whereClause.vendorProfile.city = city;
    }
    if (district) {
      whereClause.vendorProfile.district = district;
    }

    const vendors = await prisma.user.findMany({
      where: whereClause, // Use the dynamic where clause
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
            isAvailable: true,
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
  getAllVendors,
};


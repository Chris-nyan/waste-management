const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private
 */
const createBooking = async (req, res) => {
  // The user's ID is available from our `protect` middleware
  const userId = req.user.id;
  const { vendorId, pickupTime, pickupLocation } = req.body;

  // Validate input
  if (!vendorId || !pickupTime || !pickupLocation) {
    return res.status(400).json({ message: "Vendor, pickup time, and location are all required." });
  }

  try {
    // Verify that the chosen vendor actually exists
    const vendorExists = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
    });

    if (!vendorExists) {
      return res.status(404).json({ message: "Selected vendor could not be found." });
    }

    // Create the new booking record in the database
    const newBooking = await prisma.booking.create({
      data: {
        userId,
        vendorId,
        pickupTime: new Date(pickupTime), // Ensure the date is in the correct format
        pickupLocation,
        // Status will default to 'PENDING' as per our schema
      },
    });

    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Internal server error while creating booking." });
  }
};
/**
 * @desc    Get bookings for the logged-in user
 * @route   GET /api/bookings/mybookings
 * @access  Private
 */
const getMyBookings = async (req, res) => {
    const userId = req.user.id;

    try {
        const bookings = await prisma.booking.findMany({
            where: {
                userId: userId,
            },
            // Include related vendor details in the response
            include: {
                vendor: {
                    select: {
                        businessName: true,
                        phone: true,
                        user: { // Include the base user to get the vendor's name
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            // Order by the most recent pickup time first
            orderBy: {
                pickupTime: 'desc',
            }
        });

        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = {
  createBooking,
  getMyBookings,
};

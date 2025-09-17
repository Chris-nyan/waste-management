const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Add waste entries to a completed booking
 * @route   POST /api/waste-entries/:bookingId
 * @access  Private (Vendor only)
 */
const addWasteEntries = async (req, res) => {
    const { bookingId } = req.params;
    const { wasteEntries } = req.body; // Expecting an array of { wasteType, quantity, unit }
    const vendorUserId = req.user.id;

    if (!wasteEntries || !Array.isArray(wasteEntries) || wasteEntries.length === 0) {
        return res.status(400).json({ message: "Waste entries are required." });
    }

    try {
        // Verify the booking belongs to this vendor and is completed
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { vendor: true },
        });

        if (!booking || booking.vendor.userId !== vendorUserId) {
            return res.status(404).json({ message: "Booking not found or not authorized." });
        }
        if (booking.status !== 'COMPLETED') {
            return res.status(400).json({ message: "Waste can only be logged for completed bookings." });
        }

        // Create all waste entries in a single transaction
        const createdEntries = await prisma.wasteEntry.createMany({
            data: wasteEntries.map(entry => ({
                bookingId,
                ...entry
            })),
        });

        res.status(201).json(createdEntries);
    } catch (error) {
        console.error("Error adding waste entries:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = {
    addWasteEntries,
};

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Get waste disposal stats for the logged-in user with optional date filtering
 * @route   GET /api/analytics/my-impact
 * @access  Private
 */
const getMyImpactStats = async (req, res) => {
    const userId = req.user.id;
    // Get optional startDate from query parameters
    const { startDate } = req.query;

    try {
        const whereClause = {
            userId: userId,
            status: 'COMPLETED',
        };

        // If a startDate is provided and is a valid date, add it to the Prisma query
        if (startDate && !isNaN(new Date(startDate))) {
            whereClause.pickupTime = {
                gte: new Date(startDate), // gte = greater than or equal to
            };
        }

        const completedBookings = await prisma.booking.findMany({
            where: whereClause,
            include: {
                wasteEntries: true,
            },
        });

        const stats = {
            totalWeight: 0,
            breakdown: {},
            timeline: [],
        };

        for (const booking of completedBookings) {
            let bookingTotal = 0;
            for (const entry of booking.wasteEntries) {
                stats.totalWeight += entry.quantity;
                bookingTotal += entry.quantity;

                if (stats.breakdown[entry.wasteType]) {
                    stats.breakdown[entry.wasteType] += entry.quantity;
                } else {
                    stats.breakdown[entry.wasteType] = entry.quantity;
                }
            }
            stats.timeline.push({
                date: booking.pickupTime,
                totalWeight: bookingTotal
            });
        }
        
        // Final data formatting
        stats.totalWeight = parseFloat(stats.totalWeight.toFixed(2));
        for(const type in stats.breakdown) {
            stats.breakdown[type] = parseFloat(stats.breakdown[type].toFixed(2));
        }
        stats.timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

        res.status(200).json(stats);

    } catch (error) {
        console.error("Error fetching user impact stats:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
/**
 * @desc    Get waste collection stats for the logged-in vendor
 * @route   GET /api/analytics/vendor-impact
 * @access  Private (Vendor only)
 */
const getVendorImpactStats = async (req, res) => {
    const vendorUserId = req.user.id;
    const { startDate } = req.query;

    try {
        const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId: vendorUserId } });
        if (!vendorProfile) {
            return res.status(404).json({ message: "Vendor profile not found." });
        }

        const whereClause = {
            vendorId: vendorProfile.id,
            status: 'COMPLETED',
        };

        if (startDate && !isNaN(new Date(startDate))) {
            whereClause.pickupTime = { gte: new Date(startDate) };
        }

        const completedBookings = await prisma.booking.findMany({
            where: whereClause,
            include: { wasteEntries: true },
        });

        const stats = {
            totalWeight: 0,
            breakdown: {},
            timeline: [],
        };

        for (const booking of completedBookings) {
            let bookingTotal = 0;
            for (const entry of booking.wasteEntries) {
                stats.totalWeight += entry.quantity;
                bookingTotal += entry.quantity;
                if (stats.breakdown[entry.wasteType]) {
                    stats.breakdown[entry.wasteType] += entry.quantity;
                } else {
                    stats.breakdown[entry.wasteType] = entry.quantity;
                }
            }
            stats.timeline.push({
                date: booking.pickupTime,
                totalWeight: bookingTotal
            });
        }
        
        stats.totalWeight = parseFloat(stats.totalWeight.toFixed(2));
        for(const type in stats.breakdown) {
            stats.breakdown[type] = parseFloat(stats.breakdown[type].toFixed(2));
        }
        stats.timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

        res.status(200).json(stats);

    } catch (error) {
        console.error("Error fetching vendor impact stats:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};


module.exports = {
    getMyImpactStats,
    getVendorImpactStats
};


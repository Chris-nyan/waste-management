const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Create a new booking (for Users)
 * @route   POST /api/bookings
 * @access  Private
 */
const createBooking = async (req, res) => {
    const userId = req.user.id;
    const { vendorId, pickupTime, pickupLocation, wasteTypes, contactPhone } = req.body;

    if (!vendorId || !pickupTime || !pickupLocation || !wasteTypes || wasteTypes.length === 0 || !contactPhone) {
        return res.status(400).json({
            message: "Vendor, pickup time, location, contact phone, and at least one waste type are required."
        });
    }

    try {
        const vendorExists = await prisma.vendorProfile.findUnique({ where: { id: vendorId } });
        if (!vendorExists) {
            return res.status(404).json({ message: "Selected vendor could not be found." });
        }

        const newBooking = await prisma.booking.create({
            data: {
                userId,
                vendorId,
                pickupTime: new Date(pickupTime),
                pickupLocation,
                wasteTypes,
                contactPhone
            },
        });

        res.status(201).json(newBooking);
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

/**
 * @desc    Get bookings for the logged-in user (for Users)
 * @route   GET /api/bookings/mybookings
 * @access  Private
 */
const getMyBookings = async (req, res) => {
    const userId = req.user.id;
    try {
        const bookings = await prisma.booking.findMany({
            where: { userId },
            include: { vendor: { select: { businessName: true, phone: true } } },
            orderBy: { pickupTime: 'desc' }
        });
        res.status(200).json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
};

/**
 * @desc    Get the next upcoming booking for the logged-in user (for Users)
 * @route   GET /api/bookings/upcoming
 * @access  Private
 */
const getUpcomingBooking = async (req, res) => {
    const userId = req.user.id;
    try {
        const upcomingBooking = await prisma.booking.findFirst({
            where: {
                userId,
                status: { in: ['PENDING', 'CONFIRMED'] },
                pickupTime: { gte: new Date() },
            },
            include: { vendor: { select: { businessName: true } } },
            orderBy: { pickupTime: 'asc' },
        });
        res.status(200).json(upcomingBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const getVendorBookings = async (req, res) => {
    const vendorUserId = req.user.id;
    try {
        const vendorProfile = await prisma.vendorProfile.findUnique({
            where: { userId: vendorUserId },
        });

        if (!vendorProfile) {
            return res.status(404).json({ message: "Vendor profile not found." });
        }

        // FIX: use `select` to fetch contactPhone from booking itself
        const bookings = await prisma.booking.findMany({
            where: { vendorId: vendorProfile.id },
            select: {
                id: true,
                pickupTime: true,
                pickupLocation: true,
                wasteTypes: true,
                status: true,
                contactPhone: true, // <- from booking
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { pickupTime: 'asc' },
        });

        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching vendor bookings:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

/**
 * @desc    Update a booking's status (for Vendors)
 * @route   PATCH /api/bookings/:id/status
 * @access  Private (Vendor only)
 */
const updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const vendorUserId = req.user.id;

    try {
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { vendor: true },
        });

        if (!booking || booking.vendor.userId !== vendorUserId) {
            return res.status(404).json({ message: "Booking not found or not authorized." });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: { status },
        });
        res.status(200).json(updatedBooking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getUpcomingBooking,
    getVendorBookings,
    updateBookingStatus,
};
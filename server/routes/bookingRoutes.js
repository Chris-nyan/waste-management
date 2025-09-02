const express = require('express');
// 1. Import BOTH createBooking and getMyBookings from the controller
const { createBooking, getMyBookings } = require('../controllers/bookingController.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Route for creating a booking
router.post('/', protect, createBooking);

// 2. Corrected route path to match the frontend API call
router.get('/mybookings', protect, getMyBookings);

module.exports = router;


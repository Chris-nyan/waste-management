const express = require('express');
// 1. Import all controller functions
const { 
  createBooking, 
  getMyBookings, 
  getUpcomingBooking, 
  getVendorBookings, 
  updateBookingStatus 
} = require('../controllers/bookingController.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

// --- User Facing Routes ---
router.post('/', protect, createBooking);
router.get('/mybookings', protect, getMyBookings);
router.get('/upcoming', protect, getUpcomingBooking);

// --- Vendor Facing Routes ---
router.get('/vendor', protect, getVendorBookings);
router.patch('/:id/status', protect, updateBookingStatus);


module.exports = router;


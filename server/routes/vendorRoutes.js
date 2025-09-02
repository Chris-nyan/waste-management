const express = require('express');
const router = express.Router();
const { getVendors } = require('../controllers/vendorController.js');
const { protect } = require('../middleware/authMiddleware.js');

// @route   GET /api/vendors
// @desc    Get a list of all available vendors
// @access  Private
// The 'protect' middleware runs first. If the user's token is valid,
// it calls the 'getVendors' controller function. Otherwise, it blocks the request.
router.get('/', protect, getVendors);

module.exports = router;

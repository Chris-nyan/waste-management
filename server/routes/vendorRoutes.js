const express = require('express');
// 1. Correctly destructure the 'getAllVendors' function from the controller's exports
const { getAllVendors } = require('../controllers/vendorController.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

// 2. This route now correctly uses the 'getAllVendors' function as its handler
router.get('/', protect, getAllVendors);

module.exports = router;


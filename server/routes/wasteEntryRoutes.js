const express = require('express');
const { addWasteEntries } = require('../controllers/wasteEntryController.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Route for a vendor to add waste entries to a specific booking
router.post('/:bookingId', protect, addWasteEntries);

module.exports = router;

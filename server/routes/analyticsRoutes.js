const express = require('express');
const { getMyImpactStats } = require('../controllers/analyticsController.js');
const { getVendorImpactStats } = require('../controllers/analyticsController.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Define the route for getting the user's impact stats.
// This is protected, so only the logged-in user can access their own data.
router.get('/my-impact', protect, getMyImpactStats);
router.get('/vendor-impact', protect, getVendorImpactStats);

module.exports = router;

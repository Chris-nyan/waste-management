const express = require('express');
const { sendInvitation, verifyInvitation } = require('../controllers/invitationController.js');
// Corrected the path from '..//authMiddleware.js' to '../middleware/authMiddleware.js'
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/', protect, sendInvitation);
router.get('/verify/:token', verifyInvitation);

module.exports = router;


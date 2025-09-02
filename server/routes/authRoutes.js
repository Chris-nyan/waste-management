const express = require('express');
const { register, login } = require('../controllers/authController.js');
const router = express.Router();

// Route for user registration
// When a POST request is made to /api/auth/register, the 'register' controller function is called.
router.post('/register', register);

// Route for user login
// When a POST request is made to /api/auth/login, the 'login' controller function is called.
router.post('/login', login);

module.exports = router;


// backend/routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/register
router.post('/register', authController.register);


router.post('/login', authController.login);
// router.post('/login', authController.login);

module.exports = router; // Export the router instance
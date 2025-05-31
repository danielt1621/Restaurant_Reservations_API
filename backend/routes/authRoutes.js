// Auth Routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.registerUser); // Register a new user
router.post('/login', authController.loginUser); // Login an existing user requires authentication
module.exports = router;
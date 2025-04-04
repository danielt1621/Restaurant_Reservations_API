// backend/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const router = express.Router();

// Apply authentication to all user routes
router.use(authenticateToken);

// GET /api/users/me - Get current user's profile info
router.get('/me', userController.getMyProfile);

// PATCH /api/users/me/password - Update current user's password
router.patch('/me/password', userController.updateMyPassword);

// PATCH /api/users/me/username - Update current user's username
router.patch('/me/username', userController.updateMyUsername);

module.exports = router;
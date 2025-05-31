// Restaurant Routes
const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeMiddleware');

router.get('/restaurants', authenticateToken, restaurantController.getRestaurants); // Get all restaurants using authentication


// Manager-specific Restaurant routes
router.post('/restaurants', authenticateToken, authorizeRoles(['manager']), restaurantController.createRestaurant);
router.put('/restaurants/:restaurant_id', authenticateToken, authorizeRoles(['manager']), restaurantController.updateRestaurant);
router.delete('/restaurants/:restaurant_id', authenticateToken, authorizeRoles(['manager']), restaurantController.deleteRestaurant);

module.exports = router;
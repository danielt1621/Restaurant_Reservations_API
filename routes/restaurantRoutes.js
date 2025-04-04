// backend/routes/restaurantRoutes.js
const express = require('express');
const restaurantController = require('../controllers/restaurantController');
const { authenticateToken } = require('../middlewares/authMiddleware'); // Import the middleware

const router = express.Router();

// --- Public Route ---
// GET /api/restaurants - Get a list of all restaurants
router.get('/', restaurantController.getAllRestaurants);


// --- Protected Route ---
// GET /api/restaurants/:id - Get details of a specific restaurant
// We apply the authenticateToken middleware *before* the controller function.
// Only requests with a valid JWT will reach getRestaurantById.
router.get('/:id', authenticateToken, restaurantController.getRestaurantById);


// --- Admin-Only Routes (Examples for later) ---
// POST /api/restaurants - Create a new restaurant (Admin Only)
// const { authorizeAdmin } = require('../middlewares/authMiddleware');
// router.post('/', authenticateToken, authorizeAdmin, restaurantController.createRestaurant);

// PUT /api/restaurants/:id - Update a restaurant (Admin Only)
// router.put('/:id', authenticateToken, authorizeAdmin, restaurantController.updateRestaurant);

// DELETE /api/restaurants/:id - Delete a restaurant (Admin Only)
// router.delete('/:id', authenticateToken, authorizeAdmin, restaurantController.deleteRestaurant);


module.exports = router;
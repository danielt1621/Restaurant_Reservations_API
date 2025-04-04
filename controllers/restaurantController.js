// backend/controllers/restaurantController.js
const restaurantModel = require('../models/restaurantModel');

const restaurantController = {
    // Handler to get all restaurants (public access)
    async getAllRestaurants(req, res) {
        try {
            const restaurants = await restaurantModel.getAll();
            res.json(restaurants); // Send the list as JSON
        } catch (error) {
            console.error('Error in getAllRestaurants controller:', error);
            res.status(500).json({ message: 'Internal server error fetching restaurants' });
        }
    },

    // Handler to get a single restaurant by ID (protected access example)
    async getRestaurantById(req, res) {
        try {
            const restaurantId = req.params.id; // Get ID from URL parameters (e.g., /api/restaurants/123)

            // Optional: Log the authenticated user making the request (available via middleware)
            // console.log(`User ${req.user.email} (ID: ${req.user.id}) is requesting restaurant ${restaurantId}`);

            const restaurant = await restaurantModel.findById(restaurantId);

            if (!restaurant) {
                return res.status(404).json({ message: 'Restaurant not found' });
            }

            res.json(restaurant); // Send the single restaurant details
        } catch (error) {
            console.error('Error in getRestaurantById controller:', error);
            res.status(500).json({ message: 'Internal server error fetching restaurant details' });
        }
    }

    // Add handlers later for create, update, delete
};

module.exports = restaurantController;
// Restaurant Controller for handling restaurant-related requests
const { getConnection } = require('../db');

const getRestaurants = async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        //  Search by location or name
        const { search } = req.query;
        let query = "SELECT * FROM restaurants";
        let params = [];

        if (search) {
            query += " WHERE name LIKE ? OR location LIKE ?";
            params = [`%${search}%`, `%${search}%`];
        }

        const restaurants = await conn.query(query, params);
        res.json(restaurants);
    } catch (err) {
        console.error('Error fetching restaurants:', err);
        res.status(500).json({ message: 'Server error fetching restaurants.' });
    } finally {
        if (conn) conn.release();
    }
};


const createRestaurant = async (req, res) => {
    const { name, location, description } = req.body;
    if (!name || !location) {
        return res.status(400).json({ message: 'Name and location are required for a restaurant.' });
    }

    let conn;
    try {
        conn = await getConnection();
        const result = await conn.query(
            "INSERT INTO restaurants (name, location, description) VALUES (?, ?, ?)",
            [name, location, description]
        );
        res.status(201).json({ message: 'Restaurant created successfully!', restaurantId: Number(result.insertId) });
    } catch (err) {
        console.error('Error creating restaurant:', err);
        res.status(500).json({ message: 'Server error creating restaurant.' });
    } finally {
        if (conn) conn.release();
    }
};

const updateRestaurant = async (req, res) => {
    const { restaurant_id } = req.params;
    const { name, location, description } = req.body;

    if (!name || !location) {
        return res.status(400).json({ message: 'Name and location are required for updating a restaurant.' });
    }

    let conn;
    try {
        conn = await getConnection();
        const result = await conn.query(
            "UPDATE restaurants SET name = ?, location = ?, description = ? WHERE restaurant_id = ?",
            [name, location, description, restaurant_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Restaurant not found.' });
        }
        res.json({ message: 'Restaurant updated successfully.' });
    } catch (err) {
        console.error('Error updating restaurant:', err);
        res.status(500).json({ message: 'Server error updating restaurant.' });
    } finally {
        if (conn) conn.release();
    }
};

const deleteRestaurant = async (req, res) => {
    const { restaurant_id } = req.params;

    let conn;
    try {
        conn = await getConnection();
        const result = await conn.query("DELETE FROM restaurants WHERE restaurant_id = ?", [restaurant_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Restaurant not found.' });
        }
        res.json({ message: 'Restaurant deleted successfully.' });
    } catch (err) {
        console.error('Error deleting restaurant:', err);
        res.status(500).json({ message: 'Server error deleting restaurant.' });
    } finally {
        if (conn) conn.release();
    }
};

module.exports = {
    getRestaurants,
    createRestaurant, 
    updateRestaurant, 
    deleteRestaurant  
};
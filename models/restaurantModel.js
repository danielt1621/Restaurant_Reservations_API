// backend/models/restaurantModel.js
const pool = require('../config/db');

const restaurantModel = {
    async getAll() {
        let connection;
        try {
            connection = await pool.getConnection();
            const [rows] = await connection.execute(
                'SELECT restaurant_id, name, location, description, total_seats FROM Restaurants ORDER BY name ASC'
            );
            return rows;
        } catch (error) {
            console.error('Error fetching all restaurants:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    async findById(restaurantId) {
        let connection;
        try {
            connection = await pool.getConnection();
            const [rows] = await connection.execute(
                'SELECT restaurant_id, name, location, description, total_seats FROM Restaurants WHERE restaurant_id = ?',
                [restaurantId]
            );
            return rows[0];
        } catch (error) {
            console.error(`Error finding restaurant by ID ${restaurantId}:`, error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    async create(name, location, description, totalSeats) {
        let connection;
        try {
            connection = await pool.getConnection();
            const [result] = await connection.execute(
                'INSERT INTO Restaurants (name, location, description, total_seats) VALUES (?, ?, ?, ?)',
                [name, location, description, totalSeats]
            );
            return {
                restaurant_id: result.insertId,
                name, location, description, total_seats: totalSeats
            };
        } catch (error) {
            console.error('Error creating restaurant:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    async update(restaurantId, updateData) {
        let connection;
        const fields = Object.keys(updateData);
        const values = Object.values(updateData);
        const setClause = fields.map(field => `${field} = ?`).join(', ');

        if (fields.length === 0) {
            throw new Error("No update data provided.");
        }

        const sql = `UPDATE Restaurants SET ${setClause} WHERE restaurant_id = ?`;
        values.push(restaurantId);

        try {
            connection = await pool.getConnection();
            const [result] = await connection.execute(sql, values);
            return result.affectedRows;
        } catch (error) {
            console.error(`Error updating restaurant ID ${restaurantId}:`, error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    async deleteById(restaurantId) {
        let connection;
        try {
            connection = await pool.getConnection();
            const [result] = await connection.execute(
                'DELETE FROM Restaurants WHERE restaurant_id = ?',
                [restaurantId]
            );
            return result.affectedRows;
        } catch (error) {
            console.error(`Error deleting restaurant ID ${restaurantId}:`, error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }
};

module.exports = restaurantModel;
// backend/models/userModel.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const userModel = {
    async findByEmail(email) {
        let connection;
        try {
            connection = await pool.getConnection();
            const [rows] = await connection.execute(
                'SELECT * FROM Users WHERE email = ?',
                [email]
            );
            return rows[0];
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    async findById(userId) {
        let connection;
        try {
            connection = await pool.getConnection();
            const [rows] = await connection.execute(
                'SELECT user_id, name, email, role, password FROM Users WHERE user_id = ?', // Include password hash needed for comparison
                [userId]
            );
            return rows[0];
        } catch (error) {
            console.error(`Error finding user by ID ${userId}:`, error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    async createUser(name, email, password, role = 'user') {
        let connection;
        try {
            connection = await pool.getConnection();
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const [result] = await connection.execute(
                'INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, role]
            );
            return { id: result.insertId, name, email, role };
        } catch (error) {
            console.error('Error creating user:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Email already exists');
            }
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    async comparePassword(plainPassword, hashedPassword) {
        try {
            const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
            return isMatch;
        } catch (error) {
            console.error('Error comparing passwords:', error);
            throw error;
        }
    },

    // Added for password updates
    async updatePassword(userId, newHashedPassword) {
        let connection;
        try {
            connection = await pool.getConnection();
            const [result] = await connection.execute(
                'UPDATE Users SET password = ? WHERE user_id = ?',
                [newHashedPassword, userId]
            );
            return result.affectedRows;
        } catch (error) {
            console.error(`Error updating password for user ID ${userId}:`, error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

  

    // Added for username updates
    async updateUsername(userId, newUsername) {
        let connection;
        try {
            connection = await pool.getConnection();
            const [result] = await connection.execute(
                'UPDATE Users SET name = ? WHERE user_id = ?',
                [newUsername, userId]
            );
            return result.affectedRows;
        } catch (error) {
            console.error(`Error updating username for user ID ${userId}:`, error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    async findByUsername(username) {
        let connection;
        try {
            connection = await pool.getConnection();
            const [rows] = await connection.execute(
                'SELECT * FROM Users WHERE name = ?',
                [username]
            );
            return rows[0];
        } catch (error) {
            console.error('Error finding user by username:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    
};

module.exports = userModel;
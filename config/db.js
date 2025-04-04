// backend/config/db.js

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3308
});

// Async function to test the database connection on startup
async function testConnection() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log(`Successfully connected to the MariaDB database on port ${process.env.DB_PORT || 3306}.`); 
    } catch (error) {
        console.error(`Error connecting to the MariaDB database on port ${process.env.DB_PORT || 3306}:`, error); 
        // process.exit(1);
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

testConnection();

module.exports = pool;
// Connection pool setup
require('dotenv').config();
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

async function getConnection() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log("Connected to MariaDB!");
        return conn;
    } catch (err) {
        console.error("Error connecting to MariaDB:", err);
        throw err;
    }
}

module.exports = { getConnection };
// Server setup
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const { getConnection } = require('./db'); // To test DB connection on startup

const app = express();
const PORT = process.env.PORT || 3000; // Default port if not specified in .env

// Middleware
app.use(cors()); // Enable CORS for all origins (for development)
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api', authRoutes);
app.use('/api', restaurantRoutes);
app.use('/api', reservationRoutes);

// Basic route to check server status
app.get('/', (req, res) => {
    res.send('Restaurant Reservation API is running successfully');
});

// Test database connection on server start
getConnection()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to database, server not starting:', err);
        process.exit(1); // Exit if DB connection fails
    });
// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// --- Import Routes ---
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const userRoutes = require('./routes/userRoutes'); // <-- Import user routes

dotenv.config();
require('./config/db'); // Initialize DB connection pool and test

const app = express();
const PORT = process.env.PORT || 5001;

// --- Core Middlewares ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/users', userRoutes); // <-- Mount user routes

// Simple health check / base API route
app.get('/api', (req, res) => {
  res.json({ message: 'Restaurant Booking API is running!' });
});

// --- Error Handling Middlewares ---
// 404 Not Found Handler (if no route matched)
app.use((req, res, next) => {
    res.status(404).json({ message: 'Resource not found at this path' });
});

// Global Error Handler (catches errors from async routes etc.)
app.use((err, req, res, next) => {
    console.error("Global Error Handler Caught:");
    console.error(err.stack); // Log the full error stack trace
    // Avoid sending stack trace to client in production
    res.status(err.status || 500).json({
        message: err.message || 'An unexpected error occurred',
        // error: process.env.NODE_ENV === 'development' ? err.stack : {} // Optionally include stack in dev
     });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
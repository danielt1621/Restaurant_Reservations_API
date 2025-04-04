// backend/routes/reservationRoutes.js
const express = require('express');
const reservationController = require('../controllers/reservationController');
const { authenticateToken, authorizeAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

// Apply authentication check to ALL routes in this file first
router.use(authenticateToken);

// --- User Routes ---
router.post('/', reservationController.createReservation); // User creates reservation request
router.get('/my', reservationController.getMyReservations); // User gets their own reservations
router.patch('/:id/cancel', reservationController.cancelMyReservation); // User cancels their own reservation

// --- Admin Routes ---
router.get('/admin/all', authorizeAdmin, reservationController.getAllReservations); // Admin gets all reservations
router.patch('/admin/:id/status', authorizeAdmin, reservationController.updateReservationStatus); // Admin updates status

module.exports = router;
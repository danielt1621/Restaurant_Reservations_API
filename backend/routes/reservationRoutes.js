// Reservation Routes
const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeMiddleware'); //  authorize middleware

// User-specific routes 
router.post('/reservations', authenticateToken, reservationController.createReservation);
router.get('/user/reservations', authenticateToken, reservationController.getUserReservations);
router.put('/reservations/:reservation_id', authenticateToken, reservationController.updateReservation);
router.delete('/reservations/:reservation_id', authenticateToken, reservationController.deleteReservation);

// Manager-specific routes ---
router.get('/reservations/all', authenticateToken, authorizeRoles(['manager']), reservationController.getAllReservations);
router.put('/reservations/:reservation_id/status', authenticateToken, authorizeRoles(['manager']), reservationController.updateReservationStatus);

module.exports = router;
// backend/controllers/reservationController.js
const reservationModel = require('../models/reservationModel');

const reservationController = {
    async createReservation(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User ID not found in token' });
        }
        const { restaurantId, date, time, peopleCount } = req.body;

        if (!restaurantId || !date || !time || peopleCount === undefined) {
            return res.status(400).json({ message: 'Missing required fields: restaurantId, date, time, peopleCount' });
        }
        const pCount = parseInt(peopleCount, 10);
        if (isNaN(pCount) || pCount <= 0) {
             return res.status(400).json({ message: 'People count must be a positive number.' });
        }
        // Basic date/time format validation could be added here

        try {
            const availability = await reservationModel.checkAvailability(restaurantId, date, time, pCount);
            if (!availability.available) {
                return res.status(409).json({ message: 'Booking failed: Restaurant does not have enough availability for this time slot.', details: availability.message });
            }
            const newReservation = await reservationModel.create(userId, restaurantId, date, time, pCount);
            res.status(201).json({ message: 'Reservation request received successfully. Pending approval.', reservation: newReservation });
        } catch (error) {
            console.error('Error in createReservation controller:', error);
            res.status(500).json({ message: 'Internal server error processing reservation request' });
        }
    },

    async getMyReservations(req, res) {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User ID not found in token' });
        }
        try {
            const reservations = await reservationModel.findByUserId(userId);
            res.json(reservations);
        } catch (error) {
            console.error('Error in getMyReservations controller:', error);
            res.status(500).json({ message: 'Internal server error fetching user reservations' });
        }
    },

    // --- Admin Handlers ---
    async getAllReservations(req, res) {
        const statusFilter = req.query.status || null;
        try {
            const reservations = await reservationModel.findAll(statusFilter);
            res.json(reservations);
        } catch (error) {
            console.error('Error in getAllReservations controller:', error);
            res.status(500).json({ message: 'Internal server error fetching all reservations' });
        }
    },

    async updateReservationStatus(req, res) {
        const reservationId = req.params.id;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'Missing required field: status' });
        }
        const validStatuses = ['approved', 'rejected', 'cancelled'];
         if (!validStatuses.includes(status)) {
             return res.status(400).json({ message: `Invalid status value. Must be one of: ${validStatuses.join(', ')}` });
         }
        try {
            const affectedRows = await reservationModel.updateStatusById(reservationId, status);
            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Reservation not found' });
            }
            res.json({ message: `Reservation ${reservationId} status updated to ${status}` });
            // TODO: Notify user
        } catch (error) {
            console.error('Error in updateReservationStatus controller:', error);
             // Handle potential "Invalid status update" error from model
             if (error.message.startsWith('Invalid status update')) {
                 return res.status(400).json({ message: error.message });
             }
            res.status(500).json({ message: 'Internal server error updating reservation status' });
        }
    },

    // --- User Action Handler ---
    async cancelMyReservation(req, res) {
        const userId = req.user?.id;
        const reservationId = req.params.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            // 1. Find the reservation
            const reservation = await reservationModel.findById(reservationId);

            // 2. Check if reservation exists
            if (!reservation) {
                return res.status(404).json({ message: 'Reservation not found' });
            }

            // 3. Check if the logged-in user owns this reservation
            if (reservation.user_id !== userId) {
                console.warn(`User ${userId} attempted to cancel reservation ${reservationId} owned by user ${reservation.user_id}`);
                return res.status(403).json({ message: 'Forbidden: You can only cancel your own reservations' });
            }

            // 4. Check if reservation is in a cancellable state ('pending' or 'approved')
            // (Could add date checks here later - e.g., cannot cancel if date is in the past)
            if (reservation.status !== 'pending' && reservation.status !== 'approved') {
                 return res.status(409).json({ // Conflict - current state prevents action
                    message: `Cannot cancel reservation with status: ${reservation.status}`
                 });
            }

            // 5. Update status to 'cancelled'
            const affectedRows = await reservationModel.updateStatusById(reservationId, 'cancelled');

            if (affectedRows === 0) {
                 // Should not happen if findById worked, but safety check
                 return res.status(404).json({ message: 'Reservation not found during update attempt' });
            }

            res.json({ message: `Reservation ${reservationId} has been cancelled successfully.` });

        } catch (error) {
            console.error(`Error cancelling reservation ${reservationId} for user ${userId}:`, error);
            res.status(500).json({ message: 'Internal server error cancelling reservation' });
        }
    }
};
module.exports = reservationController;
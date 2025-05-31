// Reservation Controller
const { getConnection } = require('../db');

const createReservation = async (req, res) => {
    const { restaurant_id, reservation_date, reservation_time, people_count } = req.body;
    const user_id = req.user.userId; // From JWT middleware

    if (!restaurant_id || !reservation_date || !reservation_time || !people_count) {
        return res.status(400).json({ message: 'All reservation fields are required.' });
    }

    let conn;
    try {
        conn = await getConnection();
        const result = await conn.query(
            "INSERT INTO reservations (user_id, restaurant_id, reservation_date, reservation_time, people_count) VALUES (?, ?, ?, ?, ?)",
            [user_id, restaurant_id, reservation_date, reservation_time, people_count]
        );
        // Convert BigInt to Number before sending in JSON (noticed that BigInt lead to errors in JSON responses)
        res.status(201).json({ message: 'Reservation created successfully!', reservationId: Number(result.insertId) });
    } catch (err) {
        console.error('Error creating reservation:', err);
        res.status(500).json({ message: 'Server error creating reservation.' });
    } finally {
        if (conn) conn.release();
    }
};


const getUserReservations = async (req, res) => {
    const user_id = req.user.userId; // From JWT middleware
    let conn;
    try {
        conn = await getConnection();
        // Fetch reservations including their status
        const reservations = await conn.query(
            `SELECT r.*, res.name AS restaurant_name, res.location AS restaurant_location
             FROM reservations r
             JOIN restaurants res ON r.restaurant_id = res.restaurant_id
             WHERE r.user_id = ?
             ORDER BY r.reservation_date DESC, r.reservation_time DESC`,
            [user_id]
        );
        res.json(reservations);
    } catch (err) {
        console.error('Error fetching user reservations:', err);
        res.status(500).json({ message: 'Server error fetching user reservations.' });
    } finally {
        if (conn) conn.release();
    }
};


const getAllReservations = async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        // Fetch all reservations, potentially ordered by date, time, and status
        const reservations = await conn.query(
            `SELECT r.*, u.name AS user_name, u.email AS user_email, res.name AS restaurant_name, res.location AS restaurant_location
             FROM reservations r
             JOIN users u ON r.user_id = u.user_id
             JOIN restaurants res ON r.restaurant_id = res.restaurant_id
             ORDER BY r.reservation_date DESC, r.reservation_time DESC, r.status ASC`
        );
        res.json(reservations);
    } catch (err) {
        console.error('Error fetching all reservations (manager):', err);
        res.status(500).json({ message: 'Server error fetching all reservations.' });
    } finally {
        if (conn) conn.release();
    }
};



const updateReservationStatus = async (req, res) => {
    const { reservation_id } = req.params;
    const { status } = req.body; // 'pending', 'confirmed', 'cancelled', 'completed'

    if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    let conn;
    try {
        conn = await getConnection();
        const result = await conn.query(
            "UPDATE reservations SET status = ? WHERE reservation_id = ?",
            [status, reservation_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Reservation not found or status already updated.' });
        }
        res.json({ message: `Reservation ${reservation_id} status updated to ${status}.` });
    } catch (err) {
        console.error('Error updating reservation status (manager):', err);
        res.status(500).json({ message: 'Server error updating reservation status.' });
    } finally {
        if (conn) conn.release();
    }
};



const updateReservation = async (req, res) => {
    const { reservation_id } = req.params;
    const { reservation_date, reservation_time, people_count } = req.body;
    const user_id = req.user.userId;

    if (!reservation_date || !reservation_time || !people_count) {
        return res.status(400).json({ message: 'All fields required for update.' });
    }

    let conn;
    try {
        conn = await getConnection();
        // Ensure user owns the reservation
        const check = await conn.query("SELECT user_id FROM reservations WHERE reservation_id = ?", [reservation_id]);
        if (check.length === 0 || check[0].user_id !== user_id) {
            return res.status(403).json({ message: 'You do not have permission to update this reservation.' });
        }

        const result = await conn.query(
            "UPDATE reservations SET reservation_date = ?, reservation_time = ?, people_count = ? WHERE reservation_id = ?",
            [reservation_date, reservation_time, people_count, reservation_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Reservation not found.' });
        }
        res.json({ message: 'Reservation updated successfully.' });
    } catch (err) {
        console.error('Error updating reservation:', err);
        res.status(500).json({ message: 'Server error updating reservation.' });
    } finally {
        if (conn) conn.release();
    }
};

const deleteReservation = async (req, res) => {
    const { reservation_id } = req.params;
    const user_id = req.user.userId;

    let conn;
    try {
        conn = await getConnection();
        // Ensure user owns the reservation
        const check = await conn.query("SELECT user_id FROM reservations WHERE reservation_id = ?", [reservation_id]);
        if (check.length === 0 || check[0].user_id !== user_id) {
            return res.status(403).json({ message: 'You do not have permission to delete this reservation.' });
        }

        const result = await conn.query("DELETE FROM reservations WHERE reservation_id = ?", [reservation_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Reservation not found.' });
        }
        res.json({ message: 'Reservation deleted successfully.' });
    } catch (err) {
        console.error('Error deleting reservation:', err);
        res.status(500).json({ message: 'Server error deleting reservation.' });
    } finally {
        if (conn) conn.release();
    }
};

module.exports = { createReservation, getUserReservations, updateReservation, deleteReservation, getAllReservations, updateReservationStatus };



















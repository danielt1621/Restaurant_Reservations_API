// backend/models/reservationModel.js
const pool = require('../config/db');

const reservationModel = {
    async checkAvailability(restaurantId, date, time, peopleCount) {
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            const [restaurantRows] = await connection.execute(
                'SELECT total_seats FROM Restaurants WHERE restaurant_id = ?',
                [restaurantId]
            );

            if (restaurantRows.length === 0) {
                await connection.rollback();
                return { available: false, message: 'Restaurant not found.', currentReserved: 0, capacity: 0 };
            }
            const capacity = restaurantRows[0].total_seats;

            const [reservationRows] = await connection.execute(
                `SELECT SUM(people_count) as currently_reserved
                 FROM Reservations
                 WHERE restaurant_id = ? AND reservation_date = ? AND reservation_time = ? AND status = 'approved'`,
                [restaurantId, date, time]
            );
            const currentReserved = reservationRows[0]?.currently_reserved || 0;

            await connection.commit();

            if (currentReserved + peopleCount > capacity) {
                return { available: false, message: `Not enough seats available. Currently reserved: ${currentReserved}, Capacity: ${capacity}. Requested: ${peopleCount}.`, currentReserved: currentReserved, capacity: capacity };
            }

            return { available: true, message: 'Seats available.', currentReserved: currentReserved, capacity: capacity };

        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error checking reservation availability:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    async create(userId, restaurantId, date, time, peopleCount) {
        let connection;
        try {
            connection = await pool.getConnection();
            const [result] = await connection.execute(
                'INSERT INTO Reservations (user_id, restaurant_id, reservation_date, reservation_time, people_count, status) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, restaurantId, date, time, peopleCount, 'pending']
            );
            return { reservation_id: result.insertId, user_id: userId, restaurant_id: restaurantId, reservation_date: date, reservation_time: time, people_count: peopleCount, status: 'pending' };
        } catch (error) {
            console.error('Error creating reservation:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    async findByUserId(userId) {
        let connection;
        try {
            connection = await pool.getConnection();
            // Note: Removed r.created_at, r.updated_at based on user feedback
            const [rows] = await connection.execute(
                `SELECT
                    r.reservation_id, r.user_id, r.restaurant_id,
                    res.name as restaurant_name, res.location as restaurant_location,
                    r.reservation_date, r.reservation_time, r.people_count, r.status
                 FROM Reservations r
                 JOIN Restaurants res ON r.restaurant_id = res.restaurant_id
                 WHERE r.user_id = ?
                 ORDER BY r.reservation_date DESC, r.reservation_time DESC`,
                [userId]
            );
            return rows;
        } catch (error) {
            console.error(`Error finding reservations for user ID ${userId}:`, error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    async findAll(statusFilter = null) {
        let connection;
        let sql = `
            SELECT
                r.reservation_id, r.user_id, u.name as user_name, u.email as user_email,
                r.restaurant_id, res.name as restaurant_name,
                r.reservation_date, r.reservation_time, r.people_count, r.status
            FROM Reservations r
            JOIN Restaurants res ON r.restaurant_id = res.restaurant_id
            JOIN Users u ON r.user_id = u.user_id
        `;
        const params = [];
        if (statusFilter) {
            sql += ' WHERE r.status = ?';
            params.push(statusFilter);
        }
        sql += ' ORDER BY r.reservation_date DESC, r.reservation_time DESC';

        try {
            connection = await pool.getConnection();
            const [rows] = await connection.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('Error finding all reservations:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    async findById(reservationId) {
         let connection;
         try {
             connection = await pool.getConnection();
             // Note: Removed r.created_at, r.updated_at based on user feedback
             const [rows] = await connection.execute(
                 `SELECT
                    r.reservation_id, r.user_id, r.restaurant_id,
                    r.reservation_date, r.reservation_time, r.people_count, r.status
                  FROM Reservations r
                  WHERE r.reservation_id = ?`,
                 [reservationId]
             );
             return rows[0]; // Return details needed for ownership/status checks
         } catch (error) {
             console.error(`Error finding reservation by ID ${reservationId}:`, error);
             throw error;
         } finally {
             if (connection) connection.release();
         }
     },

    async updateStatusById(reservationId, newStatus) {
        let connection;
        const validStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error(`Invalid status update: ${newStatus}`);
        }
        try {
            connection = await pool.getConnection();
            const [result] = await connection.execute(
                'UPDATE Reservations SET status = ? WHERE reservation_id = ?',
                [newStatus, reservationId]
            );
            return result.affectedRows;
        } catch (error) {
            console.error(`Error updating status for reservation ID ${reservationId}:`, error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }
};

module.exports = reservationModel;
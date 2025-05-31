// JWT Authentication Middleware
require('dotenv').config();
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) return res.sendStatus(401).json({ message: 'Authentication token required.' }); // Unauthorized

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT verification error:', err);
            return res.sendStatus(403).json({ message: 'Invalid or expired token.' }); // Forbidden
        }
        req.user = user; //  user payload to the request
        next();
    });
};

module.exports = authenticateToken;
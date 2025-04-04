// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    // 1. Get token from header (common pattern: "Bearer TOKEN")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Get the part after "Bearer "

    // 2. Check if token exists
    if (token == null) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' }); // No token, unauthorized
    }

    // 3. Verify the token
    jwt.verify(token, JWT_SECRET, (err, decodedPayload) => {
        if (err) {
            console.error("JWT Verification Error:", err.message);
            // Handle specific errors if needed (e.g., TokenExpiredError)
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Unauthorized: Token expired' });
            }
            return res.status(403).json({ message: 'Forbidden: Invalid token' }); // Token is invalid/malformed
        }

        // 4. Token is valid, attach payload to request object
        // The payload typically contains the user info we put in it during login
        req.user = decodedPayload.user; // Attach the 'user' object from the payload

        // 5. Call next() to pass control to the next middleware or route handler
        next();
    });
}

// Optional: Middleware to check for specific roles (e.g., admin)
function authorizeAdmin(req, res, next) {
    // This middleware MUST run *after* authenticateToken
    if (!req.user) {
         // Should not happen if authenticateToken runs first, but good safety check
         return res.status(401).json({ message: 'Unauthorized: Authentication required' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin privileges required' });
    }

    // User is authenticated and is an admin
    next();
}


module.exports = {
    authenticateToken,
    authorizeAdmin
};
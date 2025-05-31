// Authorize Middleware
const authorizeRoles = (roles) => {
    return (req, res, next) => {
        // req.user is set by authenticateToken middleware
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Access denied. No role specified.' });
        }

        if (roles.includes(req.user.role)) {
            next(); // User has the required role
        } else {
            res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }
    };
};

module.exports = authorizeRoles;
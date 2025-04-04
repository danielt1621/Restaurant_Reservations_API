// backend/controllers/authController.js
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken'); 


const JWT_SECRET = process.env.JWT_SECRET;

const authController = {
    async register(req, res) {
        // 1. Get data from request body
        const { name, email, password, role } = req.body; // Role is optional here

        // 2. Basic Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        try {
            // 3. Check if user already exists (using the model function)
            const existingUser = await userModel.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({ message: 'Email already in use' }); // 409 Conflict
            }

            // 4. Create new user (using the model function)
            // Pass role only if provided and valid, otherwise model defaults to 'user'
            const newUser = await userModel.createUser(name, email, password, role);

            // 5. Send success response (don't send password hash back)
            res.status(201).json({ // 201 Created
                message: 'User registered successfully',
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }
            });

        } catch (error) {
            // Handle errors (including the 'Email already exists' error from the model)
            console.error('Registration error:', error);
            if (error.message === 'Email already exists') {
                // This check is slightly redundant as we check above, but good practice
                return res.status(409).json({ message: 'Email already in use' });
            }
            res.status(500).json({ message: 'Internal server error during registration' });
        }
    },

    async login(req, res) {
        // 1. Get email and password from request body
        const { email, password } = req.body;

        // 2. Basic Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        if (!JWT_SECRET) {
             console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
             return res.status(500).json({ message: 'Internal server configuration error.' });
        }

        try {
            // 3. Find user by email
            const user = await userModel.findByEmail(email);
            if (!user) {
                // User not found - send a generic error for security
                return res.status(401).json({ message: 'Invalid credentials' }); // 401 Unauthorized
            }

            // 4. Compare submitted password with stored hash
            const isMatch = await userModel.comparePassword(password, user.password);
            if (!isMatch) {
                // Password doesn't match - send a generic error
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // 5. Passwords match! Generate JWT
            const payload = {
                user: {
                    id: user.user_id, // Match column name from DB schema
                    email: user.email,
                    role: user.role
                    // Add other non-sensitive info if needed
                }
            };

            // Sign the token
            jwt.sign(
                payload,
                JWT_SECRET,
                { expiresIn: '1h' }, // Token expires in 1 hour (adjust as needed)
                (err, token) => {
                    if (err) {
                        console.error("Error signing JWT:", err);
                        // Re-throw error to be caught by outer catch block
                        throw new Error('Error generating authentication token');
                    }
                    // 6. Send token back to client
                    res.json({
                        message: 'Login successful',
                        token: token,
                        user: { // Send back some user info (optional, but often useful)
                           id: user.user_id,
                           name: user.name,
                           email: user.email,
                           role: user.role
                        }
                    });
                }
            );

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Internal server error during login' });
        }
    }
    // --- End of added function ---
};

module.exports = authController;
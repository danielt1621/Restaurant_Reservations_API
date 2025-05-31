// Auth Controller
const { getConnection } = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    let conn;
    try {
        conn = await getConnection();
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await conn.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        );
        // FIX: Convert BigInt to Number before sending in JSON
        res.status(201).json({ message: 'User registered successfully!', userId: Number(result.insertId) });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email already registered.' });
        }
        console.error('Error during registration:', err);
        res.status(500).json({ message: 'Server error during registration.' });
    } finally {
        if (conn) conn.release();
    }
};



const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    let conn;
    try {
        conn = await getConnection();
        const users = await conn.query("SELECT * FROM users WHERE email = ?", [email]);
        const user = users[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        //   JWT payload 
        const token = jwt.sign(
            { userId: user.user_id, email: user.email, role: user.role }, // user rile
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Logged in successfully!',
            token,
            userId: Number(user.user_id),
            userName: user.name,
            role: user.role // role response
        });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Server error during login.' });
    } finally {
        if (conn) conn.release();
    }
};

module.exports = { registerUser, loginUser };
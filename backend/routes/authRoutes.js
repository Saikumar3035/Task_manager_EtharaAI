const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '../.env') });
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

router.post('/signup', async (req, res) => {
    const { name, email, password, role, adminSecret } = req.body;
    try {
        if (role === 'admin' && adminSecret !== process.env.JWT_SECRET) {
            return res.status(401).json({ message: 'Invalid Admin Secret Code.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password, role: role || 'member' });
        res.status(201).json({ 
            _id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            token: generateToken(user._id) 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({ _id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/users', protect, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
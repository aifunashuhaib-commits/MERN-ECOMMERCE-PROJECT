// backend/routes/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

const usersController = require("../controllers/usersController");
router.get("/:id", usersController.getUserById);


const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const TOKEN_EXPIRES = '7d';

// POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    const { name, username, password, phone, address } = req.body;
    if (!name || !username || !password) return res.status(400).json({ message: 'name, username and password required' });

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'username already taken' });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, username, passwordHash: hash, phone, address });
    await user.save();

    // Do NOT return password hash
    return res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register user error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'username & password required' });

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, username: user.username, name: user.name }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
    return res.json({ token, user: { id: user._id, name: user.name, username: user.username, phone: user.phone, address: user.address } });
  } catch (err) {
    console.error('User login error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

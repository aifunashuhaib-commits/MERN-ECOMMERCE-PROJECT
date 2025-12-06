// routes/profile.js
const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const router = express.Router();

// simple auth middleware
function requireAuth(req, res, next) {
  if (!req.session.user || !req.session.user.id) {
    return res.redirect('/login');
  }
  next();
}

// view profile
router.get('/', requireAuth, async (req, res) => {
  const user = await User.findById(req.session.user.id).lean();
  if (!user) {
    req.session.destroy(() => res.redirect('/login'));
    return;
  }
  res.render('profile', { user });
});

// edit form
router.get('/edit', requireAuth, async (req, res) => {
  const user = await User.findById(req.session.user.id).lean();
  res.render('edit', { user, error: null });
});

// handle edit
router.post('/edit', requireAuth, async (req, res) => {
  try {
    const { name, phone, address, password } = req.body;
    const user = await User.findById(req.session.user.id);
    if (!user) return res.redirect('/login');

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    // optional password change
    if (password && password.length >= 6) {
      user.passwordHash = await bcrypt.hash(password, 10);
    } else if (password && password.length < 6) {
      return res.render('edit', { user: user.toObject(), error: 'Password must be >= 6 chars' });
    }

    await user.save();
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.render('edit', { user: req.body, error: 'Server error' });
  }
});

module.exports = router;

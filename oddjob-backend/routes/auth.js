// ═══════════════════════════════════════════
//  routes/auth.js
//  POST /api/auth/register
//  POST /api/auth/login
//  GET  /api/auth/me  (protected)
// ═══════════════════════════════════════════
const express  = require('express');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../config/email');

const router = express.Router();

// Helper: generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ── REGISTER ──
// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, location, primarySkill, bio } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Create user
    const user = await User.create({ firstName, lastName, email, phone, password, role, location, primarySkill, bio });

    // Send welcome email (don't fail if email fails)
    try { await sendWelcomeEmail({ email, firstName }); } catch (e) { console.log('Email error:', e.message); }

    res.status(201).json({
      message: 'Account created successfully!',
      token: generateToken(user._id),
      user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── LOGIN ──
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful!',
      token: generateToken(user._id),
      user
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ── GET CURRENT USER ──
// GET /api/auth/me  (requires token)
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

// ── UPDATE PROFILE ──
// PUT /api/auth/me  (requires token)
router.put('/me', protect, async (req, res) => {
  try {
    const updates = (({ firstName, lastName, phone, role, location, primarySkill, bio }) =>
      ({ firstName, lastName, phone, role, location, primarySkill, bio }))(req.body);

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ message: 'Profile updated!', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

// ═══════════════════════════════════════════
//  OddJob.ng — Main Server
// ═══════════════════════════════════════════
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
require('dotenv').config();

const app = express();

// ── MIDDLEWARE ──
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://127.0.0.1:5500'  // VS Code Live Server
  ],
  credentials: true
}));
app.use(express.json());

// ── DATABASE CONNECTION ──
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ── ROUTES ──
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/jobs',         require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/payments',     require('./routes/payments'));

// ── HEALTH CHECK ──
app.get('/', (req, res) => {
  res.json({
    message: '🚀 OddJob.ng API is running',
    version: '1.0.0',
    status:  'ok'
  });
});

// ── 404 HANDLER ──
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── ERROR HANDLER ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

// ── START SERVER ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 OddJob.ng server running on port ${PORT}`);
});

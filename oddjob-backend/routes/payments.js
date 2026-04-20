// ═══════════════════════════════════════════
//  routes/payments.js  — Paystack Integration
//  POST /api/payments/initialize  — start payment
//  GET  /api/payments/verify/:ref — verify payment
// ═══════════════════════════════════════════
const express = require('express');
const axios   = require('axios');
const { protect } = require('../middleware/auth');

const router = express.Router();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE   = 'https://api.paystack.co';

// ── INITIALIZE PAYMENT (Escrow) ──
// POST /api/payments/initialize
router.post('/initialize', protect, async (req, res) => {
  try {
    const { email, amount, jobId, jobTitle } = req.body;

    if (!email || !amount) {
      return res.status(400).json({ message: 'Email and amount are required' });
    }

    // Amount must be in kobo (multiply Naira by 100)
    const amountInKobo = Number(amount) * 100;

    const response = await axios.post(
      `${PAYSTACK_BASE}/transaction/initialize`,
      {
        email,
        amount: amountInKobo,
        currency: 'NGN',
        reference: `oddjob_${jobId}_${Date.now()}`,
        metadata: {
          job_id:    jobId,
          job_title: jobTitle,
          custom_fields: [
            { display_name: 'Job', variable_name: 'job', value: jobTitle }
          ]
        },
        callback_url: `${process.env.FRONTEND_URL}/payment-success`
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      message: 'Payment initialized',
      authorization_url: response.data.data.authorization_url,
      reference:         response.data.data.reference,
      access_code:       response.data.data.access_code
    });

  } catch (err) {
    console.error('Paystack error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Payment initialization failed', error: err.message });
  }
});

// ── VERIFY PAYMENT ──
// GET /api/payments/verify/:reference
router.get('/verify/:reference', async (req, res) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE}/transaction/verify/${req.params.reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
      }
    );

    const data = response.data.data;

    if (data.status === 'success') {
      res.json({
        message: 'Payment verified successfully!',
        status:    data.status,
        amount:    data.amount / 100,  // convert back from kobo to Naira
        reference: data.reference,
        paidAt:    data.paid_at,
        customer:  data.customer
      });
    } else {
      res.status(400).json({ message: 'Payment not successful', status: data.status });
    }

  } catch (err) {
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
});

module.exports = router;

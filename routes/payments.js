const express = require('express');
const { generateSignature, payfastBase } = require('../payfast');
const db = require('../db');
const router = express.Router();
const querystring = require('querystring');

router.post('/create', async (req, res) => {
  const { amount, item_name, email, company_id } = req.body;
  const payload = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY,
    return_url: `${process.env.APP_URL}/billing/success`,
    cancel_url: `${process.env.APP_URL}/billing/cancel`,
    notify_url: `${process.env.APP_URL}/api/payments/notify`,
    m_payment_id: `cmp_${company_id}_${Date.now()}`,
    amount: parseFloat(amount).toFixed(2),
    item_name,
    email_address: email || ''
  };
  const signature = generateSignature(payload, process.env.PAYFAST_PASSPHRASE);
  const url = `${payfastBase()}?${querystring.stringify({ ...payload, signature })}`;
  res.json({ ok: true, url });
});

router.post('/notify', express.urlencoded({ extended: true }), async (req, res) => {
  const data = req.body;
  try {
    const conn = await db.getConnection();
    await conn.query('INSERT INTO payments (company_id, amount, currency, provider, provider_ref, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())', [null, data.amount || 0, 'ZAR', 'PayFast', data.pf_payment_id || data.pf_payment_id, 'completed']);
    conn.release();
  } catch (err) {
    console.error('notify error', err);
  }
  res.send('OK');
});

module.exports = router;

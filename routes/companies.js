const express = require('express');
const db = require('../db');
const router = express.Router();

router.post('/create', async (req, res) => {
  const { name, address, website, contact_number, notification_email, logoBase64 } = req.body;
  if (!name) return res.status(400).json({ error: 'Company name required' });
  const conn = await db.getConnection();
  try {
    const [r] = await conn.query('INSERT INTO companies (name, address, website, contact_number, notification_email, logo_base64, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())', [name, address, website, contact_number, notification_email, logoBase64]);
    res.json({ ok: true, id: r.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally { conn.release(); }
});

router.get('/:id', async (req, res) => {
  const conn = await db.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM companies WHERE id = ?', [req.params.id]);
    res.json({ ok: true, company: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally { conn.release(); }
});

module.exports = router;

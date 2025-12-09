const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

router.post('/register', async (req, res) => {
  const { email, password, display_name, company_name } = req.body;
  if (!email || !password || !company_name) return res.status(400).json({ error: 'Missing fields' });

  const conn = await db.getConnection();
  try {
    const [ex] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    if (ex.length) return res.status(400).json({ error: 'User exists' });

    const [r1] = await conn.query('INSERT INTO companies (name, created_at) VALUES (?, NOW())', [company_name]);
    const companyId = r1.insertId;

    const hash = await bcrypt.hash(password, 10);
    const [r] = await conn.query('INSERT INTO users (email, password, display_name, role, company_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [email, hash, display_name || null, 'admin', companyId]);

    const token = jwt.sign({ id: r.insertId, email, role: 'admin', companyId }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ ok: true, token, user: { id: r.insertId, email, display_name, companyId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const conn = await db.getConnection();
  try {
    const [rows] = await conn.query('SELECT id, password, display_name, role, company_id FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email, role: user.role, companyId: user.company_id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ ok: true, token, user: { id: user.id, email, display_name: user.display_name, role: user.role, companyId: user.company_id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

module.exports = router;

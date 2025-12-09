const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/companies', async (req, res) => {
  const conn = await db.getConnection();
  try {
    const [rows] = await conn.query('SELECT id, name, created_at, suspended FROM companies ORDER BY created_at DESC');
    res.json({ ok: true, companies: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally { conn.release(); }
});

module.exports = router;

// routes/assets/addAsset.js
const express = require('express');
const router = express.Router();
const pool = require('../../db');
const authenticate = require('../../middleware/authenticate');

// POST /backend/assets/asset
router.post('/asset', authenticate, async (req, res) => {
    const { name, purchase_date, supplier, value, location, assigned_to } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    try {
        const [result] = await pool.query('INSERT INTO assets (company_id, name, purchase_date, supplier, value, location, assigned_to, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
            [req.user.company_id, name, purchase_date || null, supplier || null, value || 0, location || null, assigned_to || null]);
        res.json({ ok: true, id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

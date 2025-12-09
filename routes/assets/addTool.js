// routes/assets/addTool.js
const express = require('express');
const router = express.Router();
const pool = require('../../db');
const authenticate = require('../../middleware/authenticate');

// POST /backend/assets/tool
router.post('/tool', authenticate, async (req, res) => {
    const { name, category, description, serial } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    try {
        const [result] = await pool.query('INSERT INTO tools (company_id, name, category, description, serial, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [req.user.company_id, name, category || null, description || null, serial || null]);
        res.json({ ok: true, id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

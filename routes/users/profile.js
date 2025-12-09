// routes/users/profile.js
const express = require('express');
const router = express.Router();
const pool = require('../../db');
const authenticate = require('../../middleware/authenticate');

// GET /backend/users/me
router.get('/me', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email, company_id FROM users WHERE id = ?', [req.user.id]);
        if (!rows.length) return res.status(404).json({ error: 'User not found' });
        const user = rows[0];

        // get company name
        const [crows] = await pool.query('SELECT id, name FROM companies WHERE id = ?', [user.company_id]);
        const company = crows[0] || null;

        res.json({ user, company });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

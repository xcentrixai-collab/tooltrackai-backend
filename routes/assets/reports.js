// routes/assets/reports.js
const express = require('express');
const router = express.Router();
const pool = require('../../db');
const authenticate = require('../../middleware/authenticate');

// GET /backend/assets/reports -- basic example
router.get('/reports', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT a.id, a.name, a.location, a.assigned_to, al.checked_out_at, al.return_expected FROM assets a LEFT JOIN asset_logs al ON a.id = al.asset_id WHERE a.company_id = ? ORDER BY a.id DESC LIMIT 200', [req.user.company_id]);
        res.json({ rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

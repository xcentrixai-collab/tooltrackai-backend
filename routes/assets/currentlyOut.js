// routes/assets/currentlyOut.js
const express = require('express');
const router = express.Router();
const pool = require('../../db');
const authenticate = require('../../middleware/authenticate');

// GET /backend/assets/currently-out
router.get('/currently-out', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT al.id, al.asset_id, a.name as asset_name, al.staff_name, al.checked_out_at, al.return_expected FROM asset_logs al JOIN assets a ON al.asset_id = a.id WHERE a.company_id = ? AND al.returned = 0 ORDER BY al.checked_out_at DESC',
            [req.user.company_id]
        );
        res.json({ rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

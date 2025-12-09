// routes/auth/reset.js
const express = require('express');
const router = express.Router();
const pool = require('../../db');
const bcrypt = require('bcryptjs');

// POST /backend/auth/reset
router.post('/reset', async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Missing fields' });

    try {
        const [rows] = await pool.query('SELECT user_id, UNIX_TIMESTAMP(expires_at) as exp FROM password_resets WHERE token = ? LIMIT 1', [token]);
        if (!rows.length) return res.status(400).json({ error: 'Invalid token' });
        const pr = rows[0];
        if (Math.floor(Date.now() / 1000) > pr.exp) return res.status(400).json({ error: 'Token expired' });

        const pwHash = await bcrypt.hash(password, 10);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [pwHash, pr.user_id]);
        // remove token
        await pool.query('DELETE FROM password_resets WHERE token = ?', [token]);

        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

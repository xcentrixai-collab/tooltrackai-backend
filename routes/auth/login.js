// routes/auth/login.js
const express = require('express');
const router = express.Router();
const pool = require('../../db');
const bcrypt = require('bcryptjs');
const { signAccess, signRefresh } = require('./_helpers');

// POST /backend/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    try {
        const [rows] = await pool.query('SELECT id, name, password, company_id FROM users WHERE email = ?', [email]);
        if (!rows.length) return res.status(400).json({ error: 'Invalid credentials' });

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: 'Invalid credentials' });

        const payload = { id: user.id, email, company_id: user.company_id };
        const access = signAccess(payload);
        const refresh = signRefresh(payload);

        await pool.query('INSERT INTO refresh_tokens (user_id, token, created_at) VALUES (?, ?, NOW())', [user.id, refresh]);

        res.cookie('refresh_token', refresh, { httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 7 * 24 * 3600 * 1000 });
        res.json({ accessToken: access, user: { id: user.id, name: user.name, email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

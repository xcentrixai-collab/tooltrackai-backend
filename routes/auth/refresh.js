// routes/auth/refresh.js
const express = require('express');
const router = express.Router();
const pool = require('../../db');
const { signAccess, verifyRefresh } = require('./_helpers');

router.post('/refresh', async (req, res) => {
    const token = req.cookies['refresh_token'] || req.body.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    try {
        const payload = verifyRefresh(token);
        // check token exists in DB
        const [rows] = await pool.query('SELECT id FROM refresh_tokens WHERE token = ? AND user_id = ?', [token, payload.id]);
        if (!rows.length) return res.status(401).json({ error: 'Invalid refresh token' });

        const access = signAccess({ id: payload.id, email: payload.email, company_id: payload.company_id });
        res.json({ accessToken: access });
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});

module.exports = router;

// routes/auth/register.js
const express = require('express');
const router = express.Router();
const pool = require('../../db');
const bcrypt = require('bcryptjs');
const { signAccess, signRefresh } = require('./_helpers');
const { v4: uuidv4 } = require('uuid');

// POST /backend/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password, company_name } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    try {
        const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (rows.length) return res.status(400).json({ error: 'Email already registered' });

        const pwHash = await bcrypt.hash(password, 10);
        const companyId = uuidv4();

        // create company record
        await pool.query('INSERT INTO companies (id, name, created_at) VALUES (?, ?, NOW())', [companyId, company_name || name + "'s company"]);

        // create user
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, company_id, created_at) VALUES (?, ?, ?, ?, NOW())',
            [name, email, pwHash, companyId]
        );

        const userId = result.insertId;
        const payload = { id: userId, email, company_id: companyId };
        const access = signAccess(payload);
        const refresh = signRefresh(payload);

        // store refresh token
        await pool.query('INSERT INTO refresh_tokens (user_id, token, created_at) VALUES (?, ?, NOW())', [userId, refresh]);

        // send cookies (httpOnly)
        res.cookie('refresh_token', refresh, { httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 7 * 24 * 3600 * 1000 });
        res.json({ accessToken: access, user: { id: userId, name, email, company_id: companyId } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

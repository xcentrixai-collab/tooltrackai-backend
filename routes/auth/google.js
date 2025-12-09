// routes/auth/google.js
const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const pool = require('../../db');
const { signAccess, signRefresh } = require('./_helpers');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);

/**
 * GET /backend/auth/google?code=...
 * (You can also direct users to Google's OAuth URL, then Google redirects here with code)
 */
router.get('/google', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.redirect(process.env.FRONTEND_URL + '/login.html?error=google_no_code');

    try {
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);
        const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload(); // contains email, name, sub

        const email = payload.email;
        const name = payload.name;

        // find user
        const [rows] = await pool.query('SELECT id, name, company_id FROM users WHERE email = ?', [email]);
        let user;
        if (rows.length === 0) {
            // create a company and user
            const { v4: uuidv4 } = require('uuid');
            const companyId = uuidv4();
            await pool.query('INSERT INTO companies (id, name, created_at) VALUES (?, ?, NOW())', [companyId, name + "'s company"]);
            const [r] = await pool.query('INSERT INTO users (name, email, password, company_id, created_at) VALUES (?, ?, ?, ?, NOW())', [name, email, '', companyId]);
            user = { id: r.insertId, name, company_id: companyId };
        } else {
            user = rows[0];
        }

        const tokenPayload = { id: user.id, email, company_id: user.company_id };
        const access = signAccess(tokenPayload);
        const refresh = signRefresh(tokenPayload);
        await pool.query('INSERT INTO refresh_tokens (user_id, token, created_at) VALUES (?, ?, NOW())', [user.id, refresh]);

        res.cookie('refresh_token', refresh, { httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 7 * 24 * 3600 * 1000 });

        // Redirect to frontend with access token in fragment (or instruct client to call /refresh)
        res.redirect(`${process.env.FRONTEND_URL}/?access=${access}`);
    } catch (err) {
        console.error(err);
        res.redirect(process.env.FRONTEND_URL + '/login.html?error=google_failed');
    }
});

module.exports = router;

// routes/auth/forgot.js
const express = require('express');
const router = express.Router();
const pool = require('../../db');
const { v4: uuidv4 } = require('uuid');
const { sendMail } = require('../../mailer'); // adapt if default export

// POST /backend/auth/forgot
router.post('/forgot', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    try {
        const [rows] = await pool.query('SELECT id, name FROM users WHERE email = ?', [email]);
        if (!rows.length) return res.status(200).json({ ok: true }); // don't reveal

        const user = rows[0];
        const token = uuidv4();
        const expiresAt = Math.floor(Date.now() / 1000) + (60 * 60); // 1hr

        await pool.query('INSERT INTO password_resets (user_id, token, expires_at, created_at) VALUES (?, ?, FROM_UNIXTIME(?), NOW())', [user.id, token, expiresAt]);

        const resetLink = `${process.env.FRONTEND_URL}/reset-password.html?token=${token}`;
        const html = `<p>Hi ${user.name},</p><p>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`;
        await sendMail({ to: email, subject: 'Password reset — ToolTrackAI', html, text: `Reset link: ${resetLink}` });

        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

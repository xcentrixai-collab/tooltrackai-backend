const express = require('express');
const { sendContactEmail } = require('../mailer');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    await sendContactEmail(req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;

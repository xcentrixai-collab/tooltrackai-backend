// index.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://tooltrackai.tech',
    credentials: true
}));

// Routes
app.use('/backend/auth', require('./routes/auth/register'));
app.use('/backend/auth', require('./routes/auth/login'));
app.use('/backend/auth', require('./routes/auth/refresh'));
app.use('/backend/auth', require('./routes/auth/forgot'));
app.use('/backend/auth', require('./routes/auth/reset'));
app.use('/backend/auth', require('./routes/auth/google'));

app.use('/backend/users', require('./routes/users/profile'));
app.use('/backend/assets', require('./routes/assets/addTool'));
app.use('/backend/assets', require('./routes/assets/addAsset'));
app.use('/backend/assets', require('./routes/assets/reports'));
app.use('/backend/assets', require('./routes/assets/currentlyOut'));

app.get('/backend/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
    console.log(`ToolTrackAI backend listening on port ${PORT}`);
});

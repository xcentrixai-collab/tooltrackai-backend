// index.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();

// Railway dynamically injects PORT
const PORT = process.env.PORT || 4000;

// ----- Middleware -----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: [
        process.env.FRONTEND_URL || "https://tooltrackai.tech",
        "http://localhost:3000",
        /\.up\.railway\.app$/    // Allow any Railway frontend
    ],
    credentials: true
}));

// ----- Auth Routes -----
const registerRoute = require('./routes/auth/register');
const loginRoute = require('./routes/auth/login');
const refreshRoute = require('./routes/auth/refresh');
const forgotRoute = require('./routes/auth/forgot');
const resetRoute = require('./routes/auth/reset');
const googleRoute = require('./routes/auth/google');

app.use('/backend/auth', registerRoute);
app.use('/backend/auth', loginRoute);
app.use('/backend/auth', refreshRoute);
app.use('/backend/auth', forgotRoute);
app.use('/backend/auth', resetRoute);
app.use('/backend/auth', googleRoute);

// ----- User Routes -----
const profileRoute = require('./routes/users/profile');
app.use('/backend/users', profileRoute);

// ----- Asset Routes -----
const addToolRoute = require('./routes/assets/addTool');
const addAssetRoute = require('./routes/assets/addAsset');
const reportsRoute = require('./routes/assets/reports');
const currentlyOutRoute = require('./routes/assets/currentlyOut');

app.use('/backend/assets', addToolRoute);
app.use('/backend/assets', addAssetRoute);
app.use('/backend/assets', reportsRoute);
app.use('/backend/assets', currentlyOutRoute);

// ----- Health Check -----
app.get('/backend/health', (req, res) => res.json({ ok: true, status: "running" }));

// ----- Start Server -----
app.listen(PORT, () => {
    console.log(`🚀 ToolTrackAI backend running on port ${PORT}`);
});

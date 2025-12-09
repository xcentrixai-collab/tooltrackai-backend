// routes/auth/_helpers.js
const jwt = require('jsonwebtoken');

function signAccess(payload) {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}
function signRefresh(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

function verifyAccess(token) {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}
function verifyRefresh(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh };


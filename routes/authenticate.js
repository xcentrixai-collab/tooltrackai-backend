const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    try {
        let token = null;

        // Authorization header: Bearer <token>
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        // fallback to cookie (if frontend uses httpOnly cookie)
        if (!token && req.cookies && req.cookies.access_token) {
            token = req.cookies.access_token;
        }

        if (!token) return res.status(401).json({ error: "No token provided" });

        const payload = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );

        // attach user payload to request
        req.user = {
            id: payload.id,
            email: payload.email,
            role: payload.role,
            company_id: payload.company_id
        };

        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};


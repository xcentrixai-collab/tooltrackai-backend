// routes/middleware/authenticate.js

const jwt = require("jsonwebtoken");

module.exports = function authenticate(req, res, next) {
    try {
        const header = req.headers.authorization;

        if (!header) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = header.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Invalid token format" });
        }

        jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Token invalid or expired" });
            }

            req.user = decoded;
            next();
        });

    } catch (error) {
        console.error("AUTH ERROR:", error);
        res.status(500).json({ message: "Auth middleware failed" });
    }
};


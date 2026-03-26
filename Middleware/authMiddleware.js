const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: "No token" });
        }

        if (token.startsWith("Bearer ")) {
            token = token.split(" ")[1];
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();

    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
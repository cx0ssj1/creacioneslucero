const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ error: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded; // << Ahora req.user tiene los datos del usuario
        next();
    } catch (err) {
        return res.status(401).json({ error: "Token inválido" });
    }
}

module.exports = verifyToken;

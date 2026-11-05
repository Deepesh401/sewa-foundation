const jwt  = require("jsonwebtoken");

const protect = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer "))
        return res.status(401).json({ success: false, message: "Not authorised. No token." });

    try {
        const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET || "sewaam_secret_key");
        req.userId = decoded.id;
        next();
    } catch {
        res.status(401).json({ success: false, message: "Token invalid or expired." });
    }
};

module.exports = { protect };

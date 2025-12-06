// backend/middleware/userAuth.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

module.exports = function (req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "Authorization header missing" });

    const parts = auth.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") return res.status(401).json({ message: "Invalid authorization format" });

    const token = parts[1];
    const data = jwt.verify(token, JWT_SECRET);
    // data should contain id, username, name as returned when login
    req.user = data;
    next();
  } catch (err) {
    console.error("userAuth error", err.message || err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// backend/middlewares/auth.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret_for_prod";

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided, authorization denied" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id || decoded._id || decoded.userId };
    if (!req.user.id) return res.status(401).json({ message: "Invalid token payload" });
    return next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Token is not valid" });
  }
};

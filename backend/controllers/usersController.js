// backend/controllers/usersController.js
const User = require("../models/User"); // adjust path/name if your model file differs

// GET /api/users/:id
exports.getUserById = async function (req, res) {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: "Missing user id" });

    const user = await User.findById(id).select("name email phone address username").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user);
  } catch (err) {
    console.error("getUserById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

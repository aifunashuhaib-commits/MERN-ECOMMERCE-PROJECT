// backend/routes/adminOrders.js
// NOTE: This file intentionally does NOT require adminAuth — it exposes order endpoints without login.
// Use only for local/dev testing. Re-enable adminAuth before production.

const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// GET /api/admin/orders
// Public: returns all orders (most recent first)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return res.json(orders);
  } catch (err) {
    console.error("GET /api/admin/orders error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/orders/:id
// Public: returns single order by id
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json(order);
  } catch (err) {
    console.error("GET /api/admin/orders/:id error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/admin/orders/:id/status
// Public: update status/adminNote (⚠️ this is also public under Option B — anyone can call it).
// Body: { status: "Processing", adminNote: "..." }
router.put("/:id/status", async (req, res) => {
  try {
    const id = req.params.id;
    const { status, adminNote } = req.body || {};
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (status !== undefined) order.status = status;
    if (adminNote !== undefined) order.adminNote = adminNote;
    order.updatedAt = new Date();
    await order.save();

    return res.json(order);
  } catch (err) {
    console.error("PUT /api/admin/orders/:id/status error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

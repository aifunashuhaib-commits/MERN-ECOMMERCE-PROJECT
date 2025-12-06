// backend/controllers/ordersController.js
const Order = require("../models/Order");

// createOrder (customer)
exports.createOrder = async function (req, res) {
  try {
    const userId = req.user.id;
    const { items, total } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: "No items" });
    if (typeof total !== "number") return res.status(400).json({ message: "Invalid total" });

    const order = new Order({
      userId,
      items: items.map(i => ({
        productId: i.productId || i._id,
        name: i.name,
        price: i.price,
        image: i.image,
        qty: i.qty || 1
      })),
      total,
      status: "Pending"
    });

    await order.save();
    return res.json(order);
  } catch (err) {
    console.error("createOrder:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// getUserOrders (customer)
exports.getUserOrders = async function (req, res) {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.json(orders);
  } catch (err) {
    console.error("getUserOrders:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// getOrderById (customer)
exports.getOrderById = async function (req, res) {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const order = await Order.findById(id).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId.toString() !== userId) return res.status(403).json({ message: "Access denied" });
    return res.json(order);
  } catch (err) {
    console.error("getOrderById:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// updateOrderStatus (owner or admin) - used by customer if allowed, else admin will call admin handler
exports.updateOrderStatus = async function (req, res) {
  try {
    const id = req.params.id;
    const { status, adminNote } = req.body;
    const userId = req.user.id;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.userId.toString() !== userId) return res.status(403).json({ message: "Access denied" });

    order.status = status || order.status;
    if (adminNote !== undefined) order.adminNote = adminNote;
    order.updatedAt = new Date();
    await order.save();
    return res.json(order);
  } catch (err) {
    console.error("updateOrderStatus:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- Admin handlers ---------------- */

// adminListOrders - list all orders (admin)
exports.adminListOrders = async function (req, res) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return res.json(orders);
  } catch (err) {
    console.error("adminListOrders:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// getOrderByIdAdmin - admin view single order
exports.getOrderByIdAdmin = async function (req, res) {
  try {
    const id = req.params.id;
    const order = await Order.findById(id).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json(order);
  } catch (err) {
    console.error("getOrderByIdAdmin:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// updateOrderStatusAdmin - admin updates status & adminNote
exports.updateOrderStatusAdmin = async function (req, res) {
  try {
    const id = req.params.id;
    const { status, adminNote } = req.body;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status || order.status;
    if (adminNote !== undefined) order.adminNote = adminNote;
    order.updatedAt = new Date();
    await order.save();
    return res.json(order);
  } catch (err) {
    console.error("updateOrderStatusAdmin:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

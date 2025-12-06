// backend/routes/orders.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/userAuth"); // ensure this middleware exists and uses CommonJS
const ordersController = require("../controllers/ordersController");

// create order (customer)
router.post("/", auth, ordersController.createOrder);

// list user's orders
router.get("/", auth, ordersController.getUserOrders);

// view single order
router.get("/:id", auth, ordersController.getOrderById);

// admin update (you can protect admin routes with admin middleware; here we leave auth only)
router.put("/:id/status", auth, ordersController.updateOrderStatus);

module.exports = router;

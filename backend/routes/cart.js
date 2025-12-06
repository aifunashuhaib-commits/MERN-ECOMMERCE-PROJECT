// backend/routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const cartCtrl = require("../controllers/cartController");
const auth = require("../middleware/userAuth");

// All routes require auth
router.get("/", auth, cartCtrl.getCart);                 // GET /api/cart
router.post("/", auth, cartCtrl.addToCart);              // POST /api/cart
router.put("/item/:itemId", auth, cartCtrl.updateItem); // PUT /api/cart/item/:itemId
router.delete("/item/:itemId", auth, cartCtrl.removeItem); // DELETE /api/cart/item/:itemId
router.delete("/", auth, cartCtrl.clearCart);           // DELETE /api/cart

module.exports = router;

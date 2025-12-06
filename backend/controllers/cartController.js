// backend/controllers/cartController.js
const mongoose = require("mongoose");
const Cart = require("../models/Cart");

/**
 * Resolve effective user id from req.user (set by auth middleware)
 */
function resolveUserId(req) {
  if (req.user && req.user.id) return req.user.id;
  if (req.query && req.query.userId) return req.query.userId;
  if (req.params && req.params.userId) return req.params.userId;
  if (req.body && req.body.userId) return req.body.userId;
  return null;
}

/** GET /api/cart */
exports.getCart = async (req, res) => {
  try {
    const uid = resolveUserId(req);
    if (!uid) return res.status(400).json({ message: "Missing userId (or unauthenticated)" });

    const cart = await Cart.findOne({ user: uid }).lean();
    if (!cart) return res.json({ user: uid, items: [] });
    return res.json(cart);
  } catch (err) {
    console.error("getCart error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/** POST /api/cart  -- add item */
exports.addToCart = async (req, res) => {
  try {
    const uid = resolveUserId(req);
    if (!uid) return res.status(400).json({ message: "Missing userId (or unauthenticated)" });

    // support body.item or direct fields
    const item = req.body.item || {
      productId: req.body.productId,
      name: req.body.name,
      price: req.body.price,
      qty: req.body.qty,
      image: req.body.image
    };

    if (!item) return res.status(400).json({ message: "Missing item to add" });

    // Only convert to ObjectId when valid
    let productObjId = null;
    if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
      productObjId = new mongoose.Types.ObjectId(item.productId); // <-- use new
    }

    let cart = await Cart.findOne({ user: uid });
    if (!cart) {
      cart = new Cart({
        user: uid,
        items: [{
          productId: productObjId,
          name: item.name || "",
          price: Number(item.price || 0),
          qty: Number(item.qty || 1),
          image: item.image || ""
        }]
      });
    } else {
      const existingIdx = cart.items.findIndex(it => {
        if (productObjId && it.productId) return it.productId.toString() === productObjId.toString();
        if (it.productId && item.productId) return it.productId.toString() === item.productId.toString();
        return it.name === item.name;
      });

      if (existingIdx > -1) {
        cart.items[existingIdx].qty = Number(cart.items[existingIdx].qty) + Number(item.qty || 1);
        cart.items[existingIdx].price = Number(item.price || cart.items[existingIdx].price || 0);
        cart.items[existingIdx].image = item.image || cart.items[existingIdx].image;
      } else {
        cart.items.push({
          productId: productObjId,
          name: item.name || "",
          price: Number(item.price || 0),
          qty: Number(item.qty || 1),
          image: item.image || ""
        });
      }
    }

    await cart.save();
    const populated = await Cart.findById(cart._id).lean();
    return res.json(populated);
  } catch (err) {
    console.error("addToCart:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/** PUT /api/cart/item/:itemId  -- update quantity */
exports.updateItem = async (req, res) => {
  try {
    const uid = resolveUserId(req);
    if (!uid) return res.status(400).json({ message: "Missing userId (or unauthenticated)" });

    const { itemId } = req.params;
    const { quantity } = req.body;
    if (typeof quantity === "undefined") return res.status(400).json({ message: "Missing quantity" });

    const cart = await Cart.findOne({ user: uid });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const idx = cart.items.findIndex(it => it._id.toString() === itemId.toString());
    if (idx === -1) return res.status(404).json({ message: "Item not found" });

    if (Number(quantity) <= 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].qty = Number(quantity);
    }

    await cart.save();
    const populated = await Cart.findById(cart._id).lean();
    return res.json(populated);
  } catch (err) {
    console.error("updateItem:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/** DELETE /api/cart/item/:itemId  -- remove item */
exports.removeItem = async (req, res) => {
  try {
    const uid = resolveUserId(req);
    if (!uid) return res.status(400).json({ message: "Missing userId (or unauthenticated)" });

    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: uid });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const idx = cart.items.findIndex(it => it._id.toString() === itemId.toString());
    if (idx === -1) return res.status(404).json({ message: "Item not found" });

    cart.items.splice(idx, 1);
    await cart.save();
    const populated = await Cart.findById(cart._id).lean();
    return res.json(populated);
  } catch (err) {
    console.error("removeItem:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/** DELETE /api/cart  -- clear cart */
exports.clearCart = async (req, res) => {
  try {
    const uid = resolveUserId(req);
    if (!uid) return res.status(400).json({ message: "Missing userId (or unauthenticated)" });

    const cart = await Cart.findOne({ user: uid });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    await cart.save();
    return res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("clearCart:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

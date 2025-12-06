// backend/models/Cart.js
const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: false },
  name: { type: String },
  price: { type: Number, default: 0 },
  qty: { type: Number, default: 1, min: 0 },
  image: { type: String }
}, { _id: true });

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [CartItemSchema]
}, { timestamps: true });

module.exports = mongoose.model("Cart", CartSchema);

const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: String,    // optional duplication for speed/consistency
  price: Number,   // snapshot price
  image: String,
  qty: { type: Number, default: 1 }
});

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [OrderItemSchema],
  total: { type: Number, required: true }, // you can compute/store
  status: { type: String, default: "Pending" },
  adminNote: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);

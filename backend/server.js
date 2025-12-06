const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const productRoutes = require("./routes/products");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/users");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const adminOrdersRoutes = require("./routes/adminOrders");


const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);  // uses userAuth inside route file
app.use("/api/admin/orders", adminOrdersRoutes);

// Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

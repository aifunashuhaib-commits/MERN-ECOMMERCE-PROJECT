// frontend/src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerRegister from "./pages/CustomerRegister";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import AdminOrders from "./pages/AdminOrders";
import AdminOrderDetails from "./pages/AdminOrderDetails";



export default function App() {
  const isAdmin = !!localStorage.getItem("adminToken");

  return (
    <>
      <Header isAdmin={isAdmin} />
      <main className="container" style={{ paddingTop: 20 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/admin/login" element={isAdmin ? <Navigate to="/admin/dashboard" /> : <AdminLogin />} />
          <Route path="/admin/dashboard" element={isAdmin ? <AdminDashboard /> : <Navigate to="/admin/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/customer/register" element={<CustomerRegister />} />
           <Route path="/cart" element={<Cart />} />
           <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />
        <Route path="/admin/orders" element={<AdminOrders />} />

          
        </Routes>
      </main>
    </>
  );
}

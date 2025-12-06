// frontend/src/components/Header.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

/**
 * Header behavior:
 * - If adminToken exists -> show: Home, Orders, Logout
 * - Else if userToken exists -> show: Home, Products, Cart, Orders, Logout
 * - Else (not logged in) -> show: Customer Login, Admin Login
 *
 * Login pages should write tokens to localStorage as:
 *  - customer: localStorage.setItem("userToken", token)
 *  - admin:    localStorage.setItem("adminToken", token)
 * and then dispatch: window.dispatchEvent(new Event("session-changed"));
 */

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const readSession = () => ({
    isCustomer: Boolean(localStorage.getItem("userToken")),
    isAdmin: Boolean(localStorage.getItem("adminToken")),
  });

  const [session, setSession] = useState(readSession);

  useEffect(() => {
    const handle = () => setSession(readSession());
    window.addEventListener("storage", handle); // cross-tab
    window.addEventListener("session-changed", handle); // in-tab
    return () => {
      window.removeEventListener("storage", handle);
      window.removeEventListener("session-changed", handle);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("adminToken");
    try { window.dispatchEvent(new Event("session-changed")); } catch (e) {}
    // Also trigger storage event for other tabs
    try { window.dispatchEvent(new Event("storage")); } catch (e) {}
    setSession(readSession());
    navigate("/");
  };

  // Decide which UI to show
  if (session.isAdmin) {
    // Admin logged in: Home + Orders + Logout
    return (
      <header style={headerStyle}>
        <div style={innerStyle}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link to="/" style={brandStyle}>MERN Ecom</Link>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button style={btn} onClick={() => navigate("/admin/dashboard")}>Home</button>

            {/* NEW: Admin Orders button -> goes to admin orders list */}
            <button
              style={btn}
              onClick={() => {
                // navigate to orders list
                navigate("/admin/orders");
                // If you want to open a specific order directly, use:
                // navigate(`/admin/orders/${someOrderId}`)
              }}
            >
              Orders
            </button>

            <button style={logoutBtn} onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>
    );
  }

  if (session.isCustomer) {
    // Customer logged in: Home, Products, Cart, Orders, Logout
    return (
      <header style={headerStyle}>
        <div style={innerStyle}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link to="/" style={brandStyle}>MERN Ecom</Link>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button style={btn} onClick={() => navigate("/")}>Home</button>
            <button style={btn} onClick={() => navigate("/products")}>Products</button>
            <button style={btn} onClick={() => navigate("/cart")}>Cart</button>
            <button style={btn} onClick={() => navigate("/orders")}>Orders</button>
            <button style={logoutBtn} onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>
    );
  }

  // Not logged in: show Customer Login & Admin Login (visible on all pages)
  return (
    <header style={headerStyle}>
      <div style={innerStyle}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link to="/" style={brandStyle}>MERN Ecom</Link>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button style={btn} onClick={() => navigate("/")}>Home</button>
          <button style={primaryBtn} onClick={() => navigate("/customer/login")}>Customer Login</button>
          <button onClick={() => navigate("/admin/login")}>Admin</button>
        </div>
      </div>
    </header>
  );
}

/* ---------- Styles ---------- */
const headerStyle = {
  background: "#0f172a",
  color: "white",
  padding: "12px 16px",
  borderBottom: "1px solid rgba(255,255,255,0.04)"
};

const innerStyle = {
  maxWidth: 1200,
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const brandStyle = {
  color: "white",
  fontWeight: 700,
  textDecoration: "none",
  fontSize: 18
};

const btn = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  background: "transparent",
  color: "white"
};

const primaryBtn = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  background: "white",
  color: "#111",
  fontWeight: 600
};

const secondaryBtn = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  background: "#cbd5e1",
  color: "#111",
  fontWeight: 600
};

const logoutBtn = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  background: "#ef4444",
  color: "white",
  fontWeight: 600
};

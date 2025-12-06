// frontend/src/pages/Cart.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";


/*
  Replace this file in frontend/src/pages/Cart.jsx
  - Set VITE_API_URL in frontend/.env to http://localhost:5000 (or set vite proxy).
  - Store token in localStorage.token (or userToken/adminToken).
*/

const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || ""; // "" => same-origin (/api/...)

function readCartLocal() {
  try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch (e) { console.error("readCart error", e); return []; }
}
function writeCartLocal(cart) {
  try { localStorage.setItem("cart", JSON.stringify(cart)); window.dispatchEvent(new Event("storage")); } catch (e) { console.error("writeCart error", e); }
}

// Robust parser that reports non-JSON responses with a preview
async function parseJsonOrThrow(response) {
  const ct = response.headers.get("content-type") || "";
  const text = await response.text();
  if (!ct.includes("application/json")) {
    const preview = text.slice(0, 1200).replace(/\n/g, " ");
    throw new Error(`Non-JSON response (content-type: ${ct}). Preview: ${preview}`);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Failed to parse JSON: " + e.message + " Preview: " + text.slice(0, 1200));
  }
}

export default function Cart() {
  const [cart, setCart] = useState({ items: readCartLocal() });
  const [pending, setPending] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(null);
  const [info, setInfo] = useState(null);

  // token detection - supports various keys
  const token = localStorage.getItem("token") || localStorage.getItem("userToken") || localStorage.getItem("adminToken") || null;
  const isServerMode = Boolean(token);
  const headers = token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" };

  useEffect(() => {
    // pendingAdd from other pages
    try {
      const raw = sessionStorage.getItem("pendingAdd");
      if (raw) { setPending(JSON.parse(raw)); setQty(1); } else setPending(null);
    } catch (e) {
      // console.error("Failed to parse pendingAdd", e);
      setPending(null);
    }

    const onStorage = () => { if (!isServerMode) setCart({ items: readCartLocal() }); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line
  }, [isServerMode]);

  async function fetchCart() {
    setLoading(true);
    setServerError(null);
    setInfo(null);
    try {
      if (!isServerMode) {
        setCart({ items: readCartLocal() });
        setInfo("Guest mode: using localStorage cart");
        return;
      }

      const url = API_BASE ? `${API_BASE}/api/cart` : `/api/cart`;
      console.log("fetchCart ->", url, headers);
      const res = await fetch(url, { method: "GET", headers, credentials: "same-origin" });

      if (!res.ok) {
        try {
          const parsed = await parseJsonOrThrow(res);
          throw new Error(parsed.message || JSON.stringify(parsed) || `Status ${res.status}`);
        } catch (parseErr) {
          throw new Error(`HTTP ${res.status} - ${parseErr.message}`);
        }
      }

      const data = await parseJsonOrThrow(res);
      console.log("fetchCart success:", data);
      setCart(data || { items: [] });
      // setInfo("Loaded cart from server");
    } catch (err) {
      console.error("fetchCart error:", err);
      setServerError("Failed to load cart: " + (err.message || err));
      // fallback to local
      setCart({ items: readCartLocal() });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCart(); /* eslint-disable-next-line */ }, [token]);

  // Confirm add pending item (server or local)
  const confirmAddPending = async () => {
    if (!pending) return;
    setServerError(null);
    try {
      if (!isServerMode) {
        // local fallback
        const existing = readCartLocal().find(c => c._id === pending._id);
        let newCart;
        if (existing) newCart = readCartLocal().map(c => c._id === pending._id ? { ...c, qty: Number(c.qty || 0) + Number(qty) } : c);
        else newCart = [...readCartLocal(), { ...pending, qty: Number(qty) }];
        writeCartLocal(newCart);
        setCart({ items: newCart });
        sessionStorage.removeItem("pendingAdd");
        setPending(null);
        setQty(1);
        setInfo("Added to local cart");
        return;
      }

      // server mode
      const item = {
        productId: pending._id || pending.product || pending.id,
        name: pending.name,
        price: Number(pending.price || 0),
        qty: Number(qty || 1),
        image: pending.image || ""
      };
      const url = API_BASE ? `${API_BASE}/api/cart` : `/api/cart`;
      console.log("POST addToCart ->", url, item, headers);

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ item }),
        credentials: "same-origin"
      });

      if (!res.ok) {
        try {
          const parsed = await parseJsonOrThrow(res);
          throw new Error(parsed.message || JSON.stringify(parsed));
        } catch (parseErr) {
          throw new Error(`HTTP ${res.status} - ${parseErr.message}`);
        }
      }

      const updated = await parseJsonOrThrow(res);
      console.log("addToCart success:", updated);
      setCart(updated);
      sessionStorage.removeItem("pendingAdd");
      setPending(null);
      setQty(1);
      setInfo("Added to server cart");
    } catch (err) {
      console.error("confirmAddPending error:", err);
      setServerError("Add to cart failed: " + (err.message || err));
      // show an alert as well so it's obvious
      alert("Add to cart failed:\n" + (err.message || "Unknown error. Check console and Network tab."));
    }
  };

  // Update quantity (PUT /api/cart/item/:itemId) or local
  const updateQty = async (itemId, newQty) => {
    setServerError(null);
    try {
      if (newQty < 1) return;
      if (!isServerMode) {
        const nc = readCartLocal().map(i => i._id === itemId ? { ...i, qty: Number(newQty) } : i);
        writeCartLocal(nc); setCart({ items: nc }); setInfo("Updated local cart"); return;
      }
      const url = API_BASE ? `${API_BASE}/api/cart/item/${itemId}` : `/api/cart/item/${itemId}`;
      console.log("PUT updateQty ->", url, { quantity: Number(newQty) }, headers);
      const res = await fetch(url, { method: "PUT", headers, body: JSON.stringify({ quantity: Number(newQty) }) });
      if (!res.ok) {
        try {
          const parsed = await parseJsonOrThrow(res);
          throw new Error(parsed.message || JSON.stringify(parsed));
        } catch (parseErr) {
          throw new Error(`HTTP ${res.status} - ${parseErr.message}`);
        }
      }
      const updated = await parseJsonOrThrow(res);
      setCart(updated);
      setInfo("Updated cart on server");
    } catch (err) {
      console.error("updateQty error:", err);
      setServerError("Update failed: " + (err.message || err));
      alert("Update failed:\n" + (err.message || "Check console/network"));
    }
  };

  // Remove item (DELETE /api/cart/item/:itemId) or local
  const removeItem = async (itemId) => {
    if (!window.confirm("Remove this item from your cart?")) return;
    setServerError(null);
    try {
      if (!isServerMode) {
        const nc = readCartLocal().filter(i => i._id !== itemId);
        writeCartLocal(nc); setCart({ items: nc }); setInfo("Removed from local cart"); return;
      }
      const url = API_BASE ? `${API_BASE}/api/cart/item/${itemId}` : `/api/cart/item/${itemId}`;
      console.log("DELETE removeItem ->", url, headers);
      const res = await fetch(url, { method: "DELETE", headers });
      if (!res.ok) {
        try {
          const parsed = await parseJsonOrThrow(res);
          throw new Error(parsed.message || JSON.stringify(parsed));
        } catch (parseErr) {
          throw new Error(`HTTP ${res.status} - ${parseErr.message}`);
        }
      }
      const updated = await parseJsonOrThrow(res);
      setCart(updated);
      setInfo("Removed from server cart");
    } catch (err) {
      console.error("removeItem error:", err);
      setServerError("Remove failed: " + (err.message || err));
      alert("Remove failed:\n" + (err.message || "Check console/network"));
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!window.confirm("Clear your entire cart?")) return;
    setServerError(null);
    try {
      if (!isServerMode) {
        writeCartLocal([]); setCart({ items: [] }); setInfo("Cleared local cart"); return;
      }
      const url = API_BASE ? `${API_BASE}/api/cart` : `/api/cart`;
      console.log("DELETE clearCart ->", url, headers);
      const res = await fetch(url, { method: "DELETE", headers });
      if (!res.ok) {
        try {
          const parsed = await parseJsonOrThrow(res);
          throw new Error(parsed.message || JSON.stringify(parsed));
        } catch (parseErr) {
          throw new Error(`HTTP ${res.status} - ${parseErr.message}`);
        }
      }
      await parseJsonOrThrow(res);
      setCart({ items: [] });
      setInfo("Cleared server cart");
    } catch (err) {
      console.error("clearCart error:", err);
      setServerError("Clear failed: " + (err.message || err));
      alert("Clear failed:\n" + (err.message || "Check console/network"));
    }
  };

  const items = cart.items || [];
  const total = items.reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || it.quantity || 0), 0);

  return (
    <div style={{ maxWidth: 980, margin: "28px auto", padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Your Cart Details</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/checkout"><button>Continue Shopping</button></Link>
        </div>
      </div>

      {/* Status banners */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: "#444" }}>
          {/* Mode: <strong>{isServerMode ? "Server (token present)" : "Guest (no token)"}</strong>
          {API_BASE ? ` • API_BASE=${API_BASE}` : " • Using same-origin /api/..."} */}
        </div>
        {info && <div style={{ marginTop: 6, color: "#055a" }}>{info}</div>}
        {serverError && <div style={{ marginTop: 6, color: "white", background: "#b91c1c", padding: 8, borderRadius: 4 }}>{serverError}</div>}
      </div>

      {pending && (
        <div className="card" style={{ marginBottom: 12 }}>
          <h3>Adding: {pending.name}</h3>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <img src={pending.image || "https://via.placeholder.com/120"} alt={pending.name} style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 6 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{pending.name}</div>
              <div>₹{pending.price}</div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label>Quantity:</label>
              <input type="number" min="1" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))} style={{ width: 80, padding: 6 }} />
            </div>

            <div>
              <button onClick={confirmAddPending} style={{ padding: "8px 12px", background: "#111827", color: "#fff" }}>Add to Cart</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {items.length === 0 ? (
          <div style={{ padding: 12 }}>Your cart is empty.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                <th style={{ padding: 8 }}>Product</th>
                <th style={{ padding: 8 }}>Price</th>
                <th style={{ padding: 8 }}>Quantity</th>
                <th style={{ padding: 8 }}>Subtotal</th>
                <th style={{ padding: 8 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const id = item._id || (item.productId ? item.productId : Math.random());
                const qtyVal = item.qty ?? item.quantity ?? 0;
                const priceVal = Number(item.price || 0);
                return (
                  <tr key={id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: 8, display: "flex", gap: 12, alignItems: "center" }}>
                      <img src={item.image || "https://via.placeholder.com/80"} alt={item.name} style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6 }} />
                      <div><div style={{ fontWeight: 700 }}>{item.name}</div></div>
                    </td>
                    <td style={{ padding: 8 }}>₹{priceVal.toLocaleString()}</td>
                    <td style={{ padding: 8 }}>
                      <input type="number" min="1" value={qtyVal} onChange={(e) => updateQty(item._id || item.productId, Math.max(1, Number(e.target.value || 1)))} style={{ width: 80, padding: 6 }} />
                    </td>
                    <td style={{ padding: 8 }}>₹{(priceVal * Number(qtyVal)).toLocaleString()}</td>
                    <td style={{ padding: 8 }}><button onClick={() => removeItem(item._id || item.productId)} style={{ background: "#ef4444", color: "#fff" }}>Remove</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Total: ₹{Number(total || 0).toLocaleString()}</div>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
        <button onClick={clearCart}>Clear Cart</button>
        <button onClick={fetchCart}>Refresh</button>
      </div>
    </div>
  );
}

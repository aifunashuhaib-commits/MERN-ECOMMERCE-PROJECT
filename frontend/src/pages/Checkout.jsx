// frontend/src/pages/Checkout.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Checkout() {
  const [items, setItems] = useState([]); // { id, name, price, qty, image }
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Normalize server response items to the shape we use
  const normalizeServerItems = (docItems = []) => {
    return docItems.map((it) => ({
      id: it.productId?._id || it.productId || (it._id || it.productId),
      name: it.name || it.product?.name || "(no-name)",
      price: Number(it.price ?? it.product?.price ?? 0),
      qty: Number(it.qty ?? it.quantity ?? 1),
      image: it.image || it.product?.image || ""
    }));
  };

  // Load cart: prefer server if authorized, else use localStorage
  async function loadCart() {
    setLoading(true);
    setError(null);

    try {
      // Try server first (API has interceptor to attach user token)
      const res = await API.get("/api/cart");
      const doc = res?.data || { items: [] };
      const normalized = normalizeServerItems(doc.items || []);
      setItems(normalized);
      return; // success -> finally will run to setLoading(false)
    } catch (err) {
      // server failed — fall back to localStorage
      if (err?.response && err.response.status === 401) {
        // Not logged in — fallback to localStorage but inform user they'll need to login to complete checkout
        console.warn("User not authenticated for server cart. Falling back to localStorage.");
      } else {
        console.warn("Failed to fetch server cart, falling back to localStorage:", err?.message || err);
      }

      try {
        const raw = localStorage.getItem("cart") || "[]";
        const local = JSON.parse(raw);
        const normalized = (Array.isArray(local) ? local : []).map((it) => ({
          id: it._id || it.productId || it.id,
          name: it.name,
          price: Number(it.price || 0),
          qty: Number(it.qty || it.quantity || 1),
          image: it.image || ""
        }));
        setItems(normalized);
      } catch (e) {
        console.error("Failed to read local cart:", e);
        setItems([]);
        setError("Could not load cart.");
      }
    } finally {
      // ALWAYS clear loading regardless of success/failure
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = items.reduce((s, it) => s + Number(it.price || 0) * Number(it.qty || 0), 0);

  const handleCheckout = async () => {
    // Require login for checkout (server order creation requires token)
    const token = localStorage.getItem("userToken");
    if (!token) {
      alert("Please login to complete checkout.");
      navigate("/customer/login");
      return;
    }

    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Prepare items payload matching backend Order schema
      const payloadItems = items.map((it) => ({
        productId: it.id,
        name: it.name,
        price: it.price,
        image: it.image,
        qty: it.qty
      }));

      // Create order on backend
      await API.post("/api/orders", {
        items: payloadItems,
        total: Number(total)
      });

      // Clear server cart (best effort)
      try {
        // some implementations use DELETE /api/cart, others use /api/cart/clear — try both safely
        await API.delete("/api/cart/clear").catch(() => API.delete("/api/cart").catch(() => {}));
      } catch (e) {
        // ignore
      }

      // Clear client-side cart and any pending add
      try { localStorage.removeItem("cart"); } catch (e) {}
      try { sessionStorage.removeItem("pendingAdd"); } catch (e) {}

      alert("Checkout successful — your order has been placed.");
      navigate("/orders");
    } catch (err) {
      console.error("Checkout failed:", err);
      const msg = err?.response?.data?.message || err?.message || "Checkout failed";
      setError(msg);
      alert("Checkout failed: " + msg);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading checkout…</div>;

  return (
    <div style={{ maxWidth: 980, margin: "28px auto", padding: 12 }}>
      <div style={{ marginBottom: 12 }}>
        <Link to="/">← Back to products</Link>
      </div>

      <h2>Checkout</h2>

      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}

      {items.length === 0 ? (
        <div className="card" style={{ padding: 16 }}>
          <div>Your cart is empty.</div>
          <div style={{ marginTop: 12 }}>
            <Link to="/"><button>Shop now</button></Link>
          </div>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: 12, marginBottom: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                  <th style={{ padding: 8 }}>Product</th>
                  <th style={{ padding: 8 }}>Price</th>
                  <th style={{ padding: 8 }}>Quantity</th>
                  <th style={{ padding: 8 }}>Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {items.map((it) => (
                  <tr key={it.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: 8, display: "flex", gap: 12, alignItems: "center" }}>
                      <img src={it.image || "https://via.placeholder.com/80"} alt={it.name} style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6 }} />
                      <div>
                        <div style={{ fontWeight: 700 }}>{it.name}</div>
                      </div>
                    </td>

                    <td style={{ padding: 8 }}>₹{Number(it.price).toLocaleString()}</td>

                    <td style={{ padding: 8 }}>{it.qty}</td>

                    <td style={{ padding: 8 }}>₹{(Number(it.price) * Number(it.qty)).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <button onClick={() => navigate("/cart")}>Back to Cart</button>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Total: ₹{total.toLocaleString()}</div>
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={handleCheckout}
                  disabled={processing}
                  style={{
                    padding: "10px 16px",
                    background: processing ? "#9CA3AF" : "#111827",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: processing ? "default" : "pointer"
                  }}
                >
                  {processing ? "Processing…" : "Checkout"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

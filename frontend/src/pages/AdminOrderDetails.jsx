// frontend/src/pages/AdminOrderDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null); // optional profile fetch
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // editable fields
  const [status, setStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        // 1) Fetch order (public endpoint per your Option B)
        const res = await axios.get(`https://mern-ecommerce-project-igh5.onrender.com/api/admin/orders/${id}`);
        if (!mounted) return;

        const ord = res.data;
        setOrder(ord);
        setStatus(ord.status || "Pending");
        setAdminNote(ord.adminNote || "");

        // 2) Try to fetch customer profile (if API exists)
        try {
          // If your backend exposes GET /api/users/:id that returns user profile, this will work.
          if (ord.userId) {
            const ures = await axios.get(`https://mern-ecommerce-project-igh5.onrender.com/api/users/${ord.userId}`);
            if (!mounted) return;
            setCustomer(ures.data);
          }
        } catch (uErr) {
          // no profile endpoint or failed — ignore and keep userId only
          console.warn("Failed to fetch user profile (maybe endpoint not available):", uErr?.message || uErr);
          setCustomer(null);
        }
      } catch (err) {
        console.error("Failed to load order:", err);
        setError(err?.response?.data?.message || err.message || "Failed to load order");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [id]);

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const payload = { status, adminNote };
      const res = await axios.put(`https://mern-ecommerce-project-igh5.onrender.com/api/admin/orders/${order._id}/status`, payload, {
        headers: { "Content-Type": "application/json" }
      });
      setOrder(res.data);
      setStatus(res.data.status || status);
      setAdminNote(res.data.adminNote || adminNote);
      alert("Order updated.");
    } catch (err) {
      console.error("Update failed:", err);
      alert(err?.response?.data?.message || "Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading order...</div>;
  if (error) return <div style={{ padding: 20, color: "crimson" }}>Error: {error}</div>;
  if (!order) return <div style={{ padding: 20 }}>Order not found.</div>;

  const total = Number(order.total || 0);

  return (
    <div style={{ maxWidth: 980, margin: "28px auto", padding: 12 }}>
      <div style={{ marginBottom: 12 }}>
        <Link to="/admin/orders">← Back to orders</Link>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <h2>Order #{order._id}</h2>
        <div style={{ color: "#666" }}>{new Date(order.createdAt).toLocaleString()}</div>

        <section style={{ marginTop: 12 }}>
          <h3>Customer</h3>
          {customer ? (
            <div>
              <div><strong>Name:</strong> {customer.name || customer.fullName || customer.username}</div>
              <div><strong>Phone:</strong> {customer.phone || customer.mobile || "—"}</div>
              <div><strong>Address:</strong> {customer.address || customer.location || "—"}</div>
              {/* show email if available */}
              {customer.email && <div><strong>Email:</strong> {customer.email}</div>}
            </div>
          ) : (
            <div>
              <div><strong>User id:</strong> {order.userId || "—"}</div>
              <div style={{ color: "#666", fontSize: 13, marginTop: 6 }}>
                Customer profile not available or /api/users/:id endpoint missing.
              </div>
            </div>
          )}
        </section>

        <section style={{ marginTop: 16 }}>
          <h3>Products</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                <th style={{ padding: 8 }}>Product</th>
                <th style={{ padding: 8 }}>Price</th>
                <th style={{ padding: 8 }}>Qty</th>
                <th style={{ padding: 8 }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((it, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: 8, display: "flex", gap: 12, alignItems: "center" }}>
                    <img src={it.image || "https://via.placeholder.com/80"} alt={it.name} style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6 }} />
                    <div>
                      <div style={{ fontWeight: 700 }}>{it.name}</div>
                      {/* optional product id */}
                      <div style={{ fontSize: 12, color: "#666" }}>{it.productId}</div>
                    </div>
                  </td>
                  <td style={{ padding: 8 }}>₹{Number(it.price || 0).toLocaleString()}</td>
                  <td style={{ padding: 8 }}>{it.qty}</td>
                  <td style={{ padding: 8 }}>₹{(Number(it.price || 0) * Number(it.qty || 1)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <div>
            {/* <div><strong>Admin note</strong></div>
            <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows="3" style={{ width: 360, padding: 8 }} /> */}
           <div style={{ marginTop: 12 }}>
              <label style={{ display: "block", marginBottom: 6 }}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: 8 }}>
                <option>Pending</option>
                <option>Processing</option>
                <option>Shipped</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>

            <div style={{ marginTop: 12 }}>
              <button onClick={handleSave} disabled={saving} style={{ padding: "8px 12px", background: "#111827", color: "#fff", border: "none", borderRadius: 6 }}>
                {saving ? "Saving…" : "Update status"}
              </button>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Total: ₹{total.toLocaleString()}</div>

           
          </div>
        </div>
      </div>
    </div>
  );
}

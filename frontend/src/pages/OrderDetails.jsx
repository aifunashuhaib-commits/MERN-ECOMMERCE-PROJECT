// frontend/src/pages/OrderDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await API.get(`/api/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Failed to load order:", err);
        if (err?.response?.status === 401) {
          alert("Please login to view order");
          navigate("/customer/login");
        } else if (err?.response?.status === 403) {
          alert("Access denied");
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  if (loading) return <div style={{ padding: 20 }}>Loading order…</div>;
  if (!order) return <div style={{ padding: 20 }}>Order not found.</div>;

  return (
    <div style={{ maxWidth: 980, margin: "28px auto", padding: 12 }}>
      <div style={{ marginBottom: 12 }}>
        <Link to="/orders">← Back to orders</Link>
      </div>

      <div className="card">
        <h2>Order #{order._id}</h2>
        <div style={{ color: "#666" }}>{new Date(order.createdAt).toLocaleString()}</div>
        <div style={{ marginTop: 8, fontWeight: 700 }}>Status: {order.status}</div>
        {order.adminNote && <div style={{ marginTop: 6, color: "#444" }}>Admin note: {order.adminNote}</div>}

        <div style={{ marginTop: 12 }}>
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
              {(order.items || []).map((it) => (
                <tr key={it.productId} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: 8, display: "flex", gap: 12, alignItems: "center" }}>
                    <img src={it.image || "https://via.placeholder.com/80"} alt={it.name} style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6 }} />
                    <div><div style={{ fontWeight: 700 }}>{it.name}</div></div>
                  </td>
                  <td style={{ padding: 8 }}>₹{Number(it.price).toLocaleString()}</td>
                  <td style={{ padding: 8 }}>{it.qty}</td>
                  <td style={{ padding: 8 }}>₹{(Number(it.price) * Number(it.qty)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Total: ₹{Number(order.total).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

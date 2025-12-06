import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`https://mern-ecommerce-project-igh5.onrender.com/api/admin/orders/${id}`);
        if (!mounted) return;
        setOrder(res.data);
        setStatus(res.data.status);
        setAdminNote(res.data.adminNote || "");
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const save = async () => {
    try {
      await axios.put(`https://mern-ecommerce-project-igh5.onrender.com/api/admin/orders/${id}/status`, { status, adminNote });
      alert("Updated");
      navigate("/admin/orders");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!order) return <div style={{ padding: 20 }}>Order not found.</div>;

  return (
    <div style={{ maxWidth: 980, margin: "28px auto", padding: 12 }}>
      <div style={{ marginBottom: 12 }}><Link to="/admin/orders">← Back to all orders</Link></div>
      <h2>Order #{order._id}</h2>
      <div style={{ color: "#666" }}>{new Date(order.createdAt).toLocaleString()}</div>

      <section style={{ marginTop: 12 }}>
        <h3>Customer</h3>
        <div><strong>{order.customer?.name}</strong></div>
        <div>{order.customer?.phone}</div>
        <div>{order.customer?.address}</div>
      </section>

      <section style={{ marginTop: 12 }}>
        <h3>Products</h3>
        {order.items.map((it, idx) => (
          <div key={idx} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <img src={it.image} alt={it.name} style={{ width: 180, height: 130, objectFit: "cover", borderRadius: 8 }} />
            <div>
              <div style={{ fontWeight: 700 }}>{it.name}</div>
              <div>Price: ₹{Number(it.price).toLocaleString()}</div>
              <div>Qty: {it.qty}</div>
              <div>Subtotal: ₹{Number(it.subtotal).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </section>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
        <div>
          <div><strong>Total</strong></div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>₹{Number(order.total).toLocaleString()}</div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div>
            <label>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={{ marginLeft: 8 }}>
              <option>Pending</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>

          <div style={{ marginTop: 12 }}>
            <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows="3" style={{ width: 300, padding: 8 }} />
          </div>

          <div style={{ marginTop: 12 }}>
            <button onClick={save} style={{ padding: "8px 12px", background: "#111827", color: "#fff" }}>Update status</button>
          </div>
        </div>
      </div>
    </div>
  );
}

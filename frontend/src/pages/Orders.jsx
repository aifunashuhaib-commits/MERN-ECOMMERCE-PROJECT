// frontend/src/pages/Orders.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await API.get("/api/orders");
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load orders:", err);
        if (err?.response?.status === 401) {
          alert("Please login to view orders");
          navigate("/customer/login");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading) return <div style={{ padding: 20 }}>Loading orders…</div>;
  if (orders.length === 0) return <div style={{ padding: 20 }}>You have no orders yet. <Link to="/">Shop now</Link></div>;

  return (
    <div style={{ maxWidth: 980, margin: "28px auto", padding: 12 }}>
      <h2>Your Orders</h2>
      <div style={{ display: "grid", gap: 12 }}>
        {orders.map((o) => (
          <div key={o._id} className="card" style={{ padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700 }}>Order #{o._id}</div>
                <div style={{ color: "#666", fontSize: 13 }}>{new Date(o.createdAt).toLocaleString()}</div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700 }}>₹{Number(o.total).toLocaleString()}</div>
                <div style={{ color: "#1f2937", marginTop: 6 }}>{o.status}</div>
                <div style={{ marginTop: 8 }}>
                  <Link to={`/orders/${o._id}`}><button>View details</button></Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

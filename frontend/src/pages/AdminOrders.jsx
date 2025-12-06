// frontend/src/pages/AdminOrders.jsx
import React, { useEffect, useState } from "react";
import API from "../api"; // axios instance pointing to backend
import { Link } from "react-router-dom";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [usersById, setUsersById] = useState({}); // cache user profiles by id
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        // 1) fetch orders (assumes route returns orders with userId/product info)
        const res = await API.get("/api/admin/orders"); // or /api/orders/all if you use that
        if (!mounted) return;
        const fetchedOrders = Array.isArray(res.data) ? res.data : [];
        setOrders(fetchedOrders);

        // 2) build set of unique user ids to request
        const userIds = Array.from(new Set(fetchedOrders.map(o => (o.userId || o.customer?.id || o.user || o.userId?._id).toString()).filter(Boolean)));

        // 3) fetch user profiles in parallel (but only those not already cached)
        const toFetch = userIds.filter(id => !usersById[id]);
        const userFetches = toFetch.map(id => API.get(`/api/users/${id}`).then(r => ({ id, data: r.data })).catch(() => ({ id, data: null })));
        const results = await Promise.all(userFetches);

        // merge into map
        const newMap = { ...usersById };
        results.forEach(r => { if (r && r.id) newMap[r.id] = r.data; });

        if (!mounted) return;
        setUsersById(newMap);
      } catch (err) {
        console.error("AdminOrders load error:", err);
        setError(err?.response?.data?.message || err.message || "Failed to load orders");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  if (loading) return <div style={{ padding: 20 }}>Loading orders…</div>;
  if (error) return <div style={{ padding: 20, color: "crimson" }}>Error: {error}</div>;
  if (!orders.length) return <div style={{ padding: 20 }}>No orders yet.</div>;

  const getCustomerName = (order) => {
    // Try multiple possible fields (robust)
    const userId = order.userId || order.customer?.id || order.user?._id || order.user;
    const id = userId && (typeof userId === "object" ? (userId._id || userId.toString()) : String(userId));
    const profile = id ? usersById[id] : null;
    return profile?.name || order.customer?.name || order.customerName || (profile?.username) || "—";
  };

  const getTotal = o => Number(o.total ?? o.totalPrice ?? o.totalAmount ?? 0);

  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", padding: 12 }}>
      <h2>All Orders</h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
            <th style={{ padding: 8 }}>Order ID</th>
            <th style={{ padding: 8 }}>Customer</th>
            <th style={{ padding: 8 }}>Total</th>
            <th style={{ padding: 8 }}>Status</th>
            <th style={{ padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id || o.id} style={{ borderBottom: "1px solid #f7f7f7" }}>
              <td style={{ padding: 8 }}>{o._id || o.id}</td>
              <td style={{ padding: 8 }}>{getCustomerName(o)}</td>
              <td style={{ padding: 8 }}>₹{getTotal(o).toLocaleString()}</td>
              <td style={{ padding: 8 }}>{o.status || "—"}</td>
              <td style={{ padding: 8 }}>
                <Link to={`/admin/orders/${o._id || o.id}`}><button>View</button></Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

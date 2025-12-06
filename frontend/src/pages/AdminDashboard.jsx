import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", description: "", image: "" });
  const [loading, setLoading] = useState(false);

  const authHeaders = token ? { Authorization: "Bearer " + token } : {};

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    loadProducts();
    // eslint-disable-next-line
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/products");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load products (admin):", err);
      alert("Failed to load products. See console.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({ name: p.name || "", price: p.price || "", description: p.description || "", image: p.image || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", price: "", description: "", image: "" });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addOrUpdate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return alert("Name and price required");
    try {
      setLoading(true);
      if (editingId) {
        await API.put(`/api/products/${editingId}`, { ...form, price: Number(form.price) }, { headers: authHeaders });
        alert("Product updated");
      } else {
        await API.post("/api/admin/add-product", { ...form, price: Number(form.price) }, { headers: authHeaders });
        alert("Product added");
      }
      cancelEdit();
      await loadProducts();
    } catch (err) {
      console.error("Add/Update failed:", err);
      alert(err?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await API.delete(`/api/products/${id}`, { headers: authHeaders });
      alert("Product deleted");
      await loadProducts();
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  // Dashboard layout: full-width content
  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2>Admin Dashboard</h2>
        {/* <div style={{ display: "flex", gap: 8 }}>
          <button onClick={logout} style={{ background: "#ef4444", color: "#fff" }}>Logout</button>
        </div> */}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 16 }}>
        <div>
          <h3>Products</h3>
          {loading ? <div>Loading…</div> : (
            <div>
              {products.length === 0 && <div className="card">No products yet</div>}
              {products.map((p) => (
                <div key={p._id} className="card" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
                  <img src={p.image || "https://via.placeholder.com/120"} alt={p.name} style={{ width: 120, height: 80, objectFit: "cover", borderRadius:6 }} />
                  <div style={{ flex: 1 }}>
                    <strong>{p.name}</strong>
                    <div>₹{p.price}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => startEdit(p)} style={{ background: "#f59e0b" }}>Edit</button>
                    <button onClick={() => remove(p._id)} style={{ background: "#ef4444", color: "#fff" }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside>
          <div className="card">
            <h3>{editingId ? "Edit Product" : "Add Product"}</h3>
            <form onSubmit={addOrUpdate} className="stack">
              <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
              <input name="price" placeholder="Price" value={form.price} onChange={handleChange} />
              <input name="image" placeholder="Image URL" value={form.image} onChange={handleChange} />
              <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit">{editingId ? "Update Product" : "Add Product"}</button>
                {editingId && <button type="button" onClick={cancelEdit} style={{ background: "#666" }}>Cancel</button>}
              </div>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}

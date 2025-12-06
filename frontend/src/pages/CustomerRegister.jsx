// frontend/src/pages/CustomerRegister.jsx
import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function CustomerRegister() {
  const [form, setForm] = useState({ name: "", username: "", password: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.password) return alert("Name, username and password required");
    try {
      setLoading(true);
      const res = await API.post("/api/users/register", form);
      alert(res.data?.message || "Registered");
      navigate("/customer/login");
    } catch (err) {
      console.error("Register error:", err);
      alert(err?.response?.data?.message || err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "24px auto" }}>
      <div className="card">
        <h3>Create Account</h3>
        <form onSubmit={submit} className="stack">
          <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} />
          <input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} />
          <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
          <input name="username" placeholder="Choose a username" value={form.username} onChange={handleChange} />
          <input name="password" type="password" placeholder="Choose a password" value={form.password} onChange={handleChange} />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={loading}>{loading ? "Creating..." : "Register"}</button>
            <button type="button" onClick={() => { setForm({ name: "", username: "", password: "", phone: "", address: "" }); }}>Clear</button>
          </div>
        </form>
      </div>
    </div>
  );
}

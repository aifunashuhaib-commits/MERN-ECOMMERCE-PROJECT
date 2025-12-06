// frontend/src/pages/AdminLogin.jsx
import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const goToDashboard = () => {
    try {
      // Primary: use react-router navigation
      navigate("/admin/dashboard", { replace: true });
      // Small delay then verify path; if it didn't change, use hard redirect
      setTimeout(() => {
        if (window.location.pathname !== "/admin/dashboard") {
          console.warn("navigate() didn't change path — using window.location.href fallback");
          window.location.href = "/admin/dashboard";
        }
      }, 200);
    } catch (e) {
      console.error("navigate failed, falling back to window.location.href", e);
      window.location.href = "/admin/dashboard";
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return alert("Enter username & password");

    try {
      setLoading(true);
      const res = await API.post("/api/admin/login", { username, password });
      console.log("POST /api/admin/login response:", res);

      const token = res?.data?.token;
      if (!token) {
        console.error("No token in response:", res?.data);
        alert("Login succeeded but server didn't return a token. Check server logs.");
        return;
      }

      // Save token where rest of app expects it
      localStorage.setItem("adminToken", token);
      console.log("Saved adminToken to localStorage:", token.slice(0, 20) + "...");

      // Best-effort: notify other parts of app (some apps listen to storage events)
      try { window.dispatchEvent(new Event("storage")); } catch (e) {}

      // Navigate to dashboard (with fallback)
      goToDashboard();
    } catch (err) {
      console.error("Login error:", err);
      const msg = err?.response?.data?.message || err?.message || "Login failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto" }}>
      <div className="card">
        <h3>Admin Login</h3>
        <form onSubmit={handleLogin} className="stack">
          <label>Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label>Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
            <button type="button" onClick={() => { setUsername(""); setPassword(""); }}>Clear</button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CustomerLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // Save token & user
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("userProfile", JSON.stringify(data.user));

      // Tell the header to refresh
      window.dispatchEvent(new Event("session-changed"));

      alert("Login Successful!");

      // Redirect to customer home page
      navigate("/home");

    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div style={{ maxWidth: 380, margin: "40px auto" }}>
      <h2>Customer Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="User Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 10,
            background: "black",
            color: "white",
            border: 0,
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>

      <button
        onClick={() => navigate("/customer/register")}
        style={{
          marginTop: 10,
          width: "100%",
          padding: 10,
          background: "#879874ff",
          border: 0,
          cursor: "pointer",
        }}
      >
        New Customer? Register
      </button>
    </div>
  );
}

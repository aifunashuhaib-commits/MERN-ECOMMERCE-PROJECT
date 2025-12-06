// frontend/src/pages/ProductDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../api";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await API.get(`/api/products/${id}`);
        if (!mounted) return;
        setProduct(res.data);
        console.log("Loaded product:", res.data);
      } catch (err) {
        console.error("Failed to load product:", err);
        setProduct(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Loading product…</div>;
  if (!product) return <div style={{ padding: 24 }}>Product not found.</div>;

  const handleAddToCart = () => {
    try {
      console.log("Add to Cart clicked for product id:", product._id);
      const userToken = localStorage.getItem("userToken");
      if (!userToken) {
        alert("Please login");
        console.warn("Add to cart blocked — user not logged in");
        navigate("/customer/login");
        return;
      }

      const pending = {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image || "",
      };

      sessionStorage.setItem("pendingAdd", JSON.stringify(pending));
      console.log("pendingAdd saved to sessionStorage:", pending);

      // quick visual confirmation (toast-style small alert)
      const note = document.createElement("div");
      note.textContent = "Product queued — go to Cart to set quantity";
      Object.assign(note.style, {
        position: "fixed",
        right: "20px",
        top: "20px",
        padding: "10px 14px",
        background: "#111827",
        color: "white",
        borderRadius: "6px",
        zIndex: 9999,
      });
      document.body.appendChild(note);
      setTimeout(() => note.remove(), 1500);

      // navigate to cart
      navigate("/cart");
    } catch (err) {
      console.error("handleAddToCart error:", err);
      alert("Something went wrong when adding to cart — see console");
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "28px auto", padding: 12 }}>
      <div style={{ marginBottom: 12 }}>
        <Link to="/">← Back to products</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>
        <div className="card" style={{ padding: 0 }}>
          <img
            src={product.image || "https://via.placeholder.com/1200x800?text=No+Image"}
            alt={product.name}
            style={{ width: "100%", height: 520, objectFit: "contain", borderRadius: 8, background: "#f3f4f6" }}
          />
        </div>

        <aside>
          <div className="card">
            <h1 style={{ marginTop: 0 }}>{product.name}</h1>
            <div style={{ fontSize: 20, fontWeight: 700, margin: "8px 0" }}>₹{product.price}</div>
            <div className="muted" style={{ whiteSpace: "pre-line" }}>{product.description}</div>

            <div style={{ marginTop: 18 }}>
              <button
                id="addToCartBtn"
                onClick={handleAddToCart}
                style={{ padding: "10px 16px", fontSize: 16, cursor: "pointer" }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

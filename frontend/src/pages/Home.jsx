// frontend/src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await API.get("/api/products");
        if (!mounted) return;
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load products:", err);
        if (!mounted) return;
        setError(err?.response?.data?.message || err.message || "Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading products…</div>;
  if (error) return <div style={{ padding: 24, color: "crimson" }}>Error: {error}</div>;

  return (
    <section style={{ padding: 12 }}>
      <h2 style={{ marginBottom: 16 }}>Products</h2>

      <div className="grid">
        {products.length === 0 && <div className="card">No products yet.</div>}

        {products.map((p) => (
          <article key={p._id} className="card" style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ width: "100%", height: 180, overflow: "hidden", borderRadius: 6 }}>
              <img src={p.image || "https://via.placeholder.com/600x360?text=No+Image"} alt={p.name || "Product"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              <div>
                <h3 style={{ margin: "6px 0 4px 0" }}>{p.name}</h3>
                <div style={{ fontWeight: 700 }}>₹{p.price}</div>
                {/* <p className="muted" style={{ margin: 0 }}>
                  {p.description ? p.description.slice(0, 100) + (p.description.length > 100 ? "…" : "") : "No description"}
                </p> */}
              </div>

              <div style={{ marginTop: "auto" }}>
                <Link
                  to={`/product/${p._id}`}
                  data-id={p._id}
                  onClick={(e) => {
                    // debug log to confirm click fires
                    console.log("View more clicked for product id:", p._id);
                  }}
                >
                  <button style={{ padding: "8px 10px", borderRadius: 6, cursor: "pointer" }}>View more</button>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

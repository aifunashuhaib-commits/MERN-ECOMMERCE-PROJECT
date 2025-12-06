import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    price: "",
    description: "",
    image: ""
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetch() {
      const res = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(res.data);
    }
    fetch();
  }, []);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const updateProduct = async () => {
    await axios.put(
      `http://localhost:5000/api/products/${id}`,
      product,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Product Updated!");
    navigate("/admin/view-products");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Edit Product</h2>

      <input name="name" value={product.name} onChange={handleChange} placeholder="Name" />
      <input name="price" value={product.price} onChange={handleChange} placeholder="Price" />
      <input name="description" value={product.description} onChange={handleChange} placeholder="Description" />
      <input name="image" value={product.image} onChange={handleChange} placeholder="Image URL" />

      <button onClick={updateProduct} style={{ marginTop: "10px" }}>
        Save Changes
      </button>
    </div>
  );
}

export default AdminEditProduct;

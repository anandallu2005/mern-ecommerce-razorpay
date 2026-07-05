import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const emptyForm = { name: "", description: "", price: "", discountPrice: "", category: "", images: "", stock: "", lowStockThreshold: 5, sku: "" };

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadProducts = () => api.get("/products?limit=100").then(({ data }) => setProducts(data.products));

  useEffect(() => {
    loadProducts();
    api.get("/admin/categories").then(({ data }) => setCategories(data));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: Number(form.discountPrice) || 0,
      stock: Number(form.stock),
      lowStockThreshold: Number(form.lowStockThreshold) || 5,
      images: form.images ? form.images.split(",").map((s) => s.trim()) : [],
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        setMessage("Product updated successfully");
      } else {
        await api.post("/products", payload);
        setMessage("Product created successfully");
      }
      resetForm();
      loadProducts();
    } catch (err) {
      setMessage(err.response?.data?.message || "Error saving product");
    }
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      discountPrice: p.discountPrice,
      category: p.category?._id || p.category,
      images: (p.images || []).join(", "),
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      sku: p.sku || "",
    });
    setEditingId(p._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this product?")) return;
    await api.delete(`/products/${id}`);
    loadProducts();
  };

  return (
    <div style={{ padding: "32px" }}>
      <Link to="/admin">← Back to Dashboard</Link>
      <h2>Manage Products</h2>

      {message && <p style={{ color: message.includes("Error") ? "red" : "green" }}>{message}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="name" placeholder="Product name" value={form.name} onChange={handleChange} required style={styles.input} />
        <input name="sku" placeholder="SKU (optional)" value={form.sku} onChange={handleChange} style={styles.input} />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required style={{ ...styles.input, gridColumn: "span 2" }} />
        <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required style={styles.input} />
        <input name="discountPrice" type="number" placeholder="Discount price (optional)" value={form.discountPrice} onChange={handleChange} style={styles.input} />
        <select name="category" value={form.category} onChange={handleChange} required style={styles.input}>
          <option value="">Select category</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <input name="stock" type="number" placeholder="Stock quantity" value={form.stock} onChange={handleChange} required style={styles.input} />
        <input name="lowStockThreshold" type="number" placeholder="Low stock alert threshold" value={form.lowStockThreshold} onChange={handleChange} style={styles.input} />
        <input name="images" placeholder="Image URLs (comma separated)" value={form.images} onChange={handleChange} style={{ ...styles.input, gridColumn: "span 2" }} />

        <div style={{ gridColumn: "span 2", display: "flex", gap: "10px" }}>
          <button type="submit" style={styles.btn}>{editingId ? "Update Product" : "Create Product"}</button>
          {editingId && <button type="button" onClick={resetForm} style={styles.cancelBtn}>Cancel</button>}
        </div>
      </form>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Price</th>
            <th style={styles.th}>Stock</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td style={styles.td}>{p.name}</td>
              <td style={styles.td}>₹{p.price}</td>
              <td style={styles.td}>{p.stock}</td>
              <td style={styles.td}>{p.isActive ? "Active" : "Inactive"}</td>
              <td style={styles.td}>
                <button onClick={() => handleEdit(p)} style={styles.editBtn}>Edit</button>
                <button onClick={() => handleDelete(p._id)} style={styles.delBtn}>Deactivate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  form: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", margin: "20px 0", maxWidth: "700px" },
  input: { padding: "10px", border: "1px solid #ccc", borderRadius: "4px" },
  btn: { padding: "10px 20px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  cancelBtn: { padding: "10px 20px", background: "#999", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "20px" },
  th: { textAlign: "left", borderBottom: "2px solid #eee", padding: "8px" },
  td: { borderBottom: "1px solid #f0f0f0", padding: "8px" },
  editBtn: { marginRight: "8px", background: "#3d5af1", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer" },
  delBtn: { background: "#e94560", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer" },
};

export default AdminProducts;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const AdminInventory = () => {
  const [inventory, setInventory] = useState({ outOfStock: [], lowStock: [] });
  const [adjustments, setAdjustments] = useState({});
  const [message, setMessage] = useState("");

  const loadInventory = () => api.get("/products/admin/inventory").then(({ data }) => setInventory(data));

  useEffect(() => {
    loadInventory();
  }, []);

  const handleAdjust = async (productId, direction) => {
    const amount = Number(adjustments[productId] || 1);
    const adjustment = direction === "add" ? amount : -amount;
    try {
      await api.put(`/products/${productId}/stock`, { adjustment, reason: direction === "add" ? "Restock" : "Manual reduction" });
      setMessage("Stock updated successfully");
      loadInventory();
    } catch (err) {
      setMessage(err.response?.data?.message || "Error updating stock");
    }
  };

  return (
    <div style={{ padding: "32px" }}>
      <Link to="/admin">← Back to Dashboard</Link>
      <h2>Inventory Management</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}

      <h3 style={{ color: "#e94560" }}>Out of Stock ({inventory.outOfStock.length})</h3>
      <InventoryTable items={inventory.outOfStock} adjustments={adjustments} setAdjustments={setAdjustments} handleAdjust={handleAdjust} />

      <h3 style={{ color: "#e2a03f", marginTop: "32px" }}>Low Stock ({inventory.lowStock.length})</h3>
      <InventoryTable items={inventory.lowStock} adjustments={adjustments} setAdjustments={setAdjustments} handleAdjust={handleAdjust} showThreshold />
    </div>
  );
};

const InventoryTable = ({ items, adjustments, setAdjustments, handleAdjust, showThreshold }) => {
  if (items.length === 0) return <p style={{ color: "#888" }}>None 🎉</p>;
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Product</th>
          <th style={styles.th}>SKU</th>
          <th style={styles.th}>Current Stock</th>
          {showThreshold && <th style={styles.th}>Threshold</th>}
          <th style={styles.th}>Adjust</th>
        </tr>
      </thead>
      <tbody>
        {items.map((p) => (
          <tr key={p._id}>
            <td style={styles.td}>{p.name}</td>
            <td style={styles.td}>{p.sku || "-"}</td>
            <td style={styles.td}>{p.stock}</td>
            {showThreshold && <td style={styles.td}>{p.lowStockThreshold}</td>}
            <td style={styles.td}>
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={adjustments[p._id] || ""}
                onChange={(e) => setAdjustments({ ...adjustments, [p._id]: e.target.value })}
                style={{ width: "60px", padding: "6px", marginRight: "8px" }}
              />
              <button onClick={() => handleAdjust(p._id, "add")} style={styles.addBtn}>+ Restock</button>
              <button onClick={() => handleAdjust(p._id, "remove")} style={styles.removeBtn}>- Reduce</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const styles = {
  table: { width: "100%", borderCollapse: "collapse", marginTop: "12px" },
  th: { textAlign: "left", borderBottom: "2px solid #eee", padding: "8px" },
  td: { borderBottom: "1px solid #f0f0f0", padding: "8px" },
  addBtn: { background: "#2ecc71", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer", marginRight: "6px" },
  removeBtn: { background: "#e94560", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "4px", cursor: "pointer" },
};

export default AdminInventory;

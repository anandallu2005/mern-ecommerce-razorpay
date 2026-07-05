import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [note, setNote] = useState({});
  const [message, setMessage] = useState("");

  const loadOrders = () => {
    const params = filter ? { status: filter } : {};
    api.get("/orders", { params }).then(({ data }) => setOrders(data));
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status, note: note[orderId] || "" });
      setMessage(`Order updated to ${status}`);
      loadOrders();
    } catch (err) {
      setMessage(err.response?.data?.message || "Error updating order");
    }
  };

  return (
    <div style={{ padding: "32px" }}>
      <Link to="/admin">← Back to Dashboard</Link>
      <h2>Manage Orders</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}

      <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: "8px", marginBottom: "20px" }}>
        <option value="">All Statuses</option>
        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      {orders.map((order) => (
        <div key={order._id} style={styles.card}>
          <div style={styles.headerRow}>
            <div>
              <p style={{ fontWeight: "600" }}>Order #{order._id.slice(-8)} — {order.user?.name} ({order.user?.email})</p>
              <p style={{ fontSize: "13px", color: "#666" }}>{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <span style={styles.badge}>{order.status.toUpperCase()}</span>
          </div>

          {order.items.map((item, idx) => (
            <p key={idx} style={{ fontSize: "14px" }}>{item.name} x {item.quantity}</p>
          ))}

          <p>Total: <strong>₹{order.totalPrice}</strong> {order.isPaid ? "✓ Paid" : "✗ Unpaid"}</p>
          <p style={{ fontSize: "13px" }}>
            Ship to: {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
          </p>

          <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
            <input
              placeholder="Note (optional)"
              value={note[order._id] || ""}
              onChange={(e) => setNote({ ...note, [order._id]: e.target.value })}
              style={{ padding: "6px", flex: 1, minWidth: "150px" }}
            />
            {statuses.map((s) => (
              <button key={s} onClick={() => handleStatusUpdate(order._id, s)} style={styles.statusBtn}>
                {s}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  card: { border: "1px solid #eee", borderRadius: "8px", padding: "16px", marginBottom: "16px" },
  headerRow: { display: "flex", justifyContent: "space-between", marginBottom: "8px" },
  badge: { background: "#1a1a2e", color: "#fff", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", height: "fit-content" },
  statusBtn: { padding: "6px 12px", background: "#f0f0f0", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", fontSize: "12px", textTransform: "capitalize" },
};

export default AdminOrders;

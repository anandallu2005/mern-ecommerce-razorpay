import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const statusColors = {
  pending: "#999",
  processing: "#3d5af1",
  shipped: "#e2a03f",
  delivered: "#2ecc71",
  cancelled: "#e94560",
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/my-orders").then(({ data }) => setOrders(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: "32px" }}>Loading orders...</p>;
  if (orders.length === 0) return <p style={{ padding: "32px" }}>You haven't placed any orders yet. <Link to="/">Shop now</Link></p>;

  return (
    <div style={{ padding: "32px" }}>
      <h2>My Orders</h2>
      {orders.map((order) => (
        <div key={order._id} style={styles.card}>
          <div style={styles.headerRow}>
            <div>
              <p style={{ fontWeight: "600" }}>Order #{order._id.slice(-8)}</p>
              <p style={{ fontSize: "13px", color: "#666" }}>{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <span style={{ ...styles.badge, background: statusColors[order.status] }}>
              {order.status.toUpperCase()}
            </span>
          </div>

          <div>
            {order.items.map((item, idx) => (
              <p key={idx} style={{ fontSize: "14px" }}>{item.name} x {item.quantity} — ₹{item.price * item.quantity}</p>
            ))}
          </div>

          <p style={{ marginTop: "8px" }}>Total: <strong>₹{order.totalPrice}</strong> {order.isPaid ? "✓ Paid" : "✗ Unpaid"}</p>

          {/* Tracking timeline */}
          <div style={styles.timeline}>
            {order.statusHistory.map((h, idx) => (
              <div key={idx} style={styles.timelineItem}>
                <span style={{ fontWeight: "600" }}>{h.status}</span>
                <span style={{ color: "#888", marginLeft: "8px", fontSize: "12px" }}>
                  {new Date(h.updatedAt).toLocaleString()}
                </span>
                {h.note && <div style={{ fontSize: "12px", color: "#666" }}>{h.note}</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  card: { border: "1px solid #eee", borderRadius: "8px", padding: "16px", marginBottom: "16px" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" },
  badge: { color: "#fff", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", height: "fit-content" },
  timeline: { marginTop: "12px", borderTop: "1px solid #f0f0f0", paddingTop: "10px" },
  timelineItem: { marginBottom: "6px", fontSize: "13px" },
};

export default MyOrders;

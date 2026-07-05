import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../api/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    api.get("/admin/dashboard").then(({ data }) => setStats(data));
    api.get("/admin/sales-chart?days=30").then(({ data }) => setSalesData(data));
    api.get("/admin/top-products").then(({ data }) => setTopProducts(data));
  }, []);

  if (!stats) return <p style={{ padding: "32px" }}>Loading dashboard...</p>;

  return (
    <div style={{ padding: "32px" }}>
      <h2>Admin Dashboard</h2>

      <div style={styles.navRow}>
        <Link to="/admin/products" style={styles.navLink}>Manage Products</Link>
        <Link to="/admin/inventory" style={styles.navLink}>Inventory</Link>
        <Link to="/admin/orders" style={styles.navLink}>Orders</Link>
      </div>

      <div style={styles.statsGrid}>
        <StatCard label="Total Revenue" value={`₹${stats.totalRevenue.toFixed(2)}`} color="#2ecc71" />
        <StatCard label="Total Orders" value={stats.totalOrders} color="#3d5af1" />
        <StatCard label="Total Products" value={stats.totalProducts} color="#e2a03f" />
        <StatCard label="Total Customers" value={stats.totalUsers} color="#9b59b6" />
        <StatCard label="Low Stock Items" value={stats.lowStockCount} color="#e67e22" />
        <StatCard label="Out of Stock" value={stats.outOfStockCount} color="#e94560" />
      </div>

      <h3 style={{ marginTop: "32px" }}>Orders by Status</h3>
      <div style={styles.statsGrid}>
        {Object.entries(stats.ordersByStatus).map(([status, count]) => (
          <StatCard key={status} label={status} value={count} color="#1a1a2e" />
        ))}
      </div>

      <h3 style={{ marginTop: "32px" }}>Revenue - Last 30 Days</h3>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#1a1a2e" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h3 style={{ marginTop: "32px" }}>Top Selling Products</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Product</th>
            <th style={styles.th}>Sold</th>
            <th style={styles.th}>Stock</th>
            <th style={styles.th}>Price</th>
          </tr>
        </thead>
        <tbody>
          {topProducts.map((p) => (
            <tr key={p._id}>
              <td style={styles.td}>{p.name}</td>
              <td style={styles.td}>{p.sold}</td>
              <td style={styles.td}>{p.stock}</td>
              <td style={styles.td}>₹{p.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div style={{ ...styles.statCard, borderLeft: `4px solid ${color}` }}>
    <p style={{ fontSize: "13px", color: "#666", textTransform: "capitalize" }}>{label}</p>
    <p style={{ fontSize: "22px", fontWeight: "bold" }}>{value}</p>
  </div>
);

const styles = {
  navRow: { display: "flex", gap: "16px", marginBottom: "20px" },
  navLink: { background: "#1a1a2e", color: "#fff", padding: "8px 16px", borderRadius: "4px", textDecoration: "none", fontSize: "14px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px" },
  statCard: { background: "#f9f9f9", padding: "16px", borderRadius: "6px" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "12px" },
  th: { textAlign: "left", borderBottom: "2px solid #eee", padding: "8px" },
  td: { borderBottom: "1px solid #f0f0f0", padding: "8px" },
};

export default AdminDashboard;

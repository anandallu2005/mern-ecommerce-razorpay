import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { userInfo, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>ShopMERN</Link>
      <div style={styles.links}>
        <Link to="/cart" style={styles.link}>Cart ({totalItems})</Link>
        {userInfo ? (
          <>
            <Link to="/my-orders" style={styles.link}>My Orders</Link>
            {userInfo.role === "admin" && (
              <Link to="/admin" style={styles.link}>Admin</Link>
            )}
            <span style={styles.userName}>Hi, {userInfo.name}</span>
            <button onClick={handleLogout} style={styles.btn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 32px",
    background: "#1a1a2e",
    color: "#fff",
  },
  logo: { color: "#fff", fontSize: "22px", fontWeight: "bold", textDecoration: "none" },
  links: { display: "flex", alignItems: "center", gap: "18px" },
  link: { color: "#fff", textDecoration: "none" },
  userName: { color: "#ccc", fontSize: "14px" },
  btn: {
    background: "#e94560",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default Navbar;

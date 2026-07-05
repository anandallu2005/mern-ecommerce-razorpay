import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!userInfo) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: "32px" }}>
        <h2>Your cart is empty</h2>
        <Link to="/">Continue shopping →</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px" }}>
      <h2>Your Cart</h2>
      {cartItems.map((item) => (
        <div key={item.product} style={styles.row}>
          <img src={item.image} alt={item.name} style={styles.img} />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: "600" }}>{item.name}</p>
            <p>₹{item.price} x {item.quantity} = ₹{item.price * item.quantity}</p>
          </div>
          <input
            type="number"
            min="1"
            max={item.stock}
            value={item.quantity}
            onChange={(e) => updateQuantity(item.product, Math.max(1, Number(e.target.value)))}
            style={{ width: "60px", padding: "6px" }}
          />
          <button onClick={() => removeFromCart(item.product)} style={styles.removeBtn}>Remove</button>
        </div>
      ))}
      <div style={styles.summary}>
        <h3>Total: ₹{totalPrice.toFixed(2)}</h3>
        <button onClick={handleCheckout} style={styles.checkoutBtn}>Proceed to Checkout</button>
      </div>
    </div>
  );
};

const styles = {
  row: { display: "flex", alignItems: "center", gap: "16px", padding: "12px 0", borderBottom: "1px solid #eee" },
  img: { width: "70px", height: "70px", objectFit: "cover", borderRadius: "6px" },
  removeBtn: { background: "#e94560", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" },
  summary: { marginTop: "24px", textAlign: "right" },
  checkoutBtn: { padding: "12px 28px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "15px" },
};

export default Cart;

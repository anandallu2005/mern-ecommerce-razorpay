import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

  return (
    <div style={styles.card}>
      <Link to={`/product/${product._id}`}>
        <img
          src={product.images?.[0] || "https://via.placeholder.com/250"}
          alt={product.name}
          style={styles.img}
        />
      </Link>
      <div style={styles.body}>
        <Link to={`/product/${product._id}`} style={styles.title}>{product.name}</Link>
        <div style={styles.priceRow}>
          <span style={styles.price}>₹{hasDiscount ? product.discountPrice : product.price}</span>
          {hasDiscount && <span style={styles.strike}>₹{product.price}</span>}
        </div>
        {product.stock === 0 ? (
          <span style={styles.outOfStock}>Out of stock</span>
        ) : product.stock <= (product.lowStockThreshold || 5) ? (
          <span style={styles.lowStock}>Only {product.stock} left!</span>
        ) : null}
        <button
          disabled={product.stock === 0}
          onClick={() => addToCart(product, 1)}
          style={{ ...styles.btn, opacity: product.stock === 0 ? 0.5 : 1 }}
        >
          {product.stock === 0 ? "Unavailable" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: { border: "1px solid #eee", borderRadius: "8px", overflow: "hidden", background: "#fff" },
  img: { width: "100%", height: "180px", objectFit: "cover" },
  body: { padding: "12px" },
  title: { color: "#1a1a2e", fontWeight: "600", textDecoration: "none", display: "block", marginBottom: "6px" },
  priceRow: { display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" },
  price: { fontWeight: "bold", fontSize: "16px" },
  strike: { textDecoration: "line-through", color: "#888", fontSize: "13px" },
  outOfStock: { color: "#e94560", fontSize: "12px", fontWeight: "600" },
  lowStock: { color: "#e2a03f", fontSize: "12px", fontWeight: "600" },
  btn: {
    width: "100%",
    marginTop: "8px",
    padding: "8px",
    background: "#1a1a2e",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default ProductCard;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => setProduct(data));
  }, [id]);

  if (!product) return <p style={{ padding: "32px" }}>Loading...</p>;

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{ padding: "32px", display: "flex", gap: "32px", flexWrap: "wrap" }}>
      <img
        src={product.images?.[0] || "https://via.placeholder.com/400"}
        alt={product.name}
        style={{ width: "380px", height: "380px", objectFit: "cover", borderRadius: "8px" }}
      />
      <div style={{ flex: 1, minWidth: "280px" }}>
        <h1>{product.name}</h1>
        <p style={{ color: "#666" }}>{product.category?.name}</p>
        <div style={{ margin: "12px 0" }}>
          <span style={{ fontSize: "26px", fontWeight: "bold" }}>
            ₹{hasDiscount ? product.discountPrice : product.price}
          </span>
          {hasDiscount && (
            <span style={{ marginLeft: "10px", textDecoration: "line-through", color: "#888" }}>
              ₹{product.price}
            </span>
          )}
        </div>
        <p>{product.description}</p>

        {product.stock === 0 ? (
          <p style={{ color: "#e94560", fontWeight: "600" }}>Out of stock</p>
        ) : (
          <>
            {product.stock <= product.lowStockThreshold && (
              <p style={{ color: "#e2a03f", fontWeight: "600" }}>Only {product.stock} left in stock!</p>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "14px 0" }}>
              <label>Qty:</label>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={qty}
                onChange={(e) => setQty(Math.min(product.stock, Math.max(1, Number(e.target.value))))}
                style={{ width: "60px", padding: "6px" }}
              />
            </div>
            <button
              onClick={handleAdd}
              style={{ padding: "12px 24px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              {added ? "Added to Cart ✓" : "Add to Cart"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

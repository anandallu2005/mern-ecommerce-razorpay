import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ street: "", city: "", state: "", pincode: "", country: "India" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const handlePayment = async (e) => {
    e.preventDefault();
    setError("");

    if (!address.street || !address.city || !address.state || !address.pincode) {
      setError("Please fill all address fields");
      return;
    }

    setLoading(true);
    try {
      // 1. Create order in our DB
      const orderPayload = {
        items: cartItems.map((i) => ({ product: i.product, quantity: i.quantity })),
        shippingAddress: address,
      };
      const { data: order } = await api.post("/orders", orderPayload);

      // 2. Create Razorpay order
      const { data: razorpayData } = await api.post("/payment/create-order", { orderId: order._id });

      // 3. Open Razorpay checkout
      const options = {
        key: razorpayData.keyId,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: "ShopMERN",
        description: `Order #${order._id}`,
        order_id: razorpayData.razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post("/payment/verify", {
              orderId: order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCart();
            navigate("/my-orders");
          } catch (err) {
            setError("Payment verification failed. Contact support with your order id: " + order._id);
          }
        },
        prefill: {},
        theme: { color: "#1a1a2e" },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "32px", maxWidth: "480px", margin: "0 auto" }}>
      <h2>Checkout</h2>
      <p>Order total: <strong>₹{totalPrice.toFixed(2)}</strong> (incl. shipping & GST calculated at order creation)</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handlePayment} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input name="street" placeholder="Street address" value={address.street} onChange={handleChange} style={styles.input} />
        <input name="city" placeholder="City" value={address.city} onChange={handleChange} style={styles.input} />
        <input name="state" placeholder="State" value={address.state} onChange={handleChange} style={styles.input} />
        <input name="pincode" placeholder="Pincode" value={address.pincode} onChange={handleChange} style={styles.input} />

        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? "Processing..." : "Pay with Razorpay"}
        </button>
      </form>

      <p style={{ fontSize: "12px", color: "#888", marginTop: "12px" }}>
        Test mode: use card 4111 1111 1111 1111, any future expiry, any CVV.
      </p>
    </div>
  );
};

const styles = {
  input: { padding: "10px", border: "1px solid #ccc", borderRadius: "4px" },
  btn: { padding: "12px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "15px" },
};

export default Checkout;

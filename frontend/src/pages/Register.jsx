import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form.name, form.email, form.password, form.phone);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ maxWidth: "360px", margin: "60px auto", padding: "24px" }}>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required style={styles.input} />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required style={styles.input} />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} style={styles.input} />
        <input name="password" type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={handleChange} required minLength={6} style={styles.input} />
        <button type="submit" style={styles.btn}>Register</button>
      </form>
      <p style={{ marginTop: "12px" }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

const styles = {
  input: { padding: "10px", border: "1px solid #ccc", borderRadius: "4px" },
  btn: { padding: "12px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
};

export default Register;

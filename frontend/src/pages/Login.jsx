import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ maxWidth: "360px", margin: "60px auto", padding: "24px" }}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />
        <button type="submit" style={styles.btn}>Login</button>
      </form>
      <p style={{ marginTop: "12px" }}>
        No account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

const styles = {
  input: { padding: "10px", border: "1px solid #ccc", borderRadius: "4px" },
  btn: { padding: "12px", background: "#1a1a2e", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" },
};

export default Login;

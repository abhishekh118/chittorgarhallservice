import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ emailOrPhone: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const { data } = await API.post("/auth/login", form);
      login(data);
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <section className="auth-section legacy-login-page">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">Welcome back</span>
        <h1>User / Provider Login</h1>
        <p>Customer aur service provider dono isi page se login kar sakte hain.</p>
        {error && <div className="form-error">{error}</div>}
        <label>Email or mobile number</label>
        <input required value={form.emailOrPhone} onChange={(e) => setForm({ ...form, emailOrPhone: e.target.value })} />
        <label>Password</label>
        <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn primary full">Login</button>
        <p className="form-foot">New account? <Link to="/register">Register here</Link></p>
      </form>
    </section>
  );
}

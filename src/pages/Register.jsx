import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", role: "customer",
    location: { address: "", area: "", city: "Chittorgarh", pincode: "" }
  });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const setLocation = (key, value) => {
    setForm({ ...form, location: { ...form.location, [key]: value } });
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const { data } = await API.post("/auth/register", form);
      login(data);
      navigate(form.role === "provider" ? "/provider-onboarding" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <section className="auth-section">
      <form className="auth-card wide" onSubmit={submit}>
        <span className="eyebrow">Create account</span>
        <h1>Customer or Service Provider</h1>
        {error && <div className="form-error">{error}</div>}
        <div className="form-grid">
          <div><label>Full name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label>Mobile number</label><input required maxLength="10" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label>Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label>Password</label><input type="password" required minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div><label>Account type</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="customer">I need services</option><option value="provider">I want to work / provide service</option></select></div>
          <div><label>Area</label><input value={form.location.area} onChange={(e) => setLocation("area", e.target.value)} /></div>
          <div className="span-2"><label>Full address</label><input value={form.location.address} onChange={(e) => setLocation("address", e.target.value)} /></div>
        </div>
        <button className="btn primary full">Create Account</button>
      </form>
    </section>
  );
}

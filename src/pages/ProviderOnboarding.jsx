import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

export default function ProviderOnboarding() {
  const [sectors, setSectors] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    sector: "",
    businessName: "",
    description: "",
    experienceYears: 0,
    skillsText: "",
    serviceName: "",
    servicePrice: "",
    deliveryCharge: "",
    location: { address: "", area: "", city: "Chittorgarh", pincode: "", coordinates: {} }
  });

  useEffect(() => {
    API.get("/sectors").then((res) => setSectors(res.data));
  }, []);

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((current) => ({
          ...current,
          location: {
            ...current.location,
            coordinates: { lat: coords.latitude, lng: coords.longitude }
          }
        }));
        setMessage("Location captured");
      },
      () => setMessage("Location permission denied")
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      await API.post("/providers", {
        sector: form.sector,
        businessName: form.businessName,
        description: form.description,
        experienceYears: Number(form.experienceYears),
        skills: form.skillsText.split(",").map((x) => x.trim()).filter(Boolean),
        services: [{
          name: form.serviceName || "General Service",
          price: Number(form.servicePrice || 0),
          unit: "service",
          deliveryCharge: Number(form.deliveryCharge || 0)
        }],
        location: form.location
      });
      setMessage("Profile submitted. Admin verification ke baad site par show hoga.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Submission failed");
    }
  };

  return (
    <section className="section">
      <div className="container">
        <form className="panel-form" onSubmit={submit}>
          <span className="eyebrow">Work with us</span>
          <h1>Service Provider Details</h1>
          <p>Apne kaam, price, address aur location ki details submit karein.</p>
          {message && <div className="info-message">{message}</div>}
          {message.includes("Profile submitted") && <div className="kyc-next"><strong>Next step:</strong> <Link to="/provider-kyc">Complete secure KYC verification</Link></div>}
          <div className="form-grid">
            <div><label>Sector</label><select required value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })}><option value="">Select</option>{sectors.map((s) => <option value={s._id} key={s._id}>{s.name}</option>)}</select></div>
            <div><label>Business / work name</label><input required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} /></div>
            <div><label>Experience (years)</label><input type="number" min="0" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} /></div>
            <div><label>Skills (comma separated)</label><input value={form.skillsText} onChange={(e) => setForm({ ...form, skillsText: e.target.value })} /></div>
            <div><label>Main service</label><input value={form.serviceName} onChange={(e) => setForm({ ...form, serviceName: e.target.value })} /></div>
            <div><label>Starting price ₹</label><input type="number" value={form.servicePrice} onChange={(e) => setForm({ ...form, servicePrice: e.target.value })} /></div>
            <div><label>Delivery / visit charge ₹</label><input type="number" value={form.deliveryCharge} onChange={(e) => setForm({ ...form, deliveryCharge: e.target.value })} /></div>
            <div><label>Area</label><input value={form.location.area} onChange={(e) => setForm({ ...form, location: { ...form.location, area: e.target.value } })} /></div>
            <div className="span-2"><label>Description</label><textarea rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="span-2"><label>Address</label><input value={form.location.address} onChange={(e) => setForm({ ...form, location: { ...form.location, address: e.target.value } })} /></div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn ghost" onClick={getLocation}>Use Current Location</button>
            <button className="btn primary">Submit for Verification</button>
          </div>
        </form>
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import API from "../api";
import ProviderCard from "../components/ProviderCard";

export default function NearbyHelp() {
  const [sectors, setSectors] = useState([]);
  const [sectorSlug, setSectorSlug] = useState("");
  const [need, setNeed] = useState("");
  const [providers, setProviders] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    API.get("/sectors").then((res) => setSectors(res.data));
  }, []);

  const search = () => {
    if (!sectorSlug) return setMessage("Category select karein");
    setMessage("Location permission allow karein...");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { data } = await API.get("/providers/nearby/search", {
            params: {
              sectorSlug,
              lat: coords.latitude,
              lng: coords.longitude,
              radius: 5,
              need
            }
          });
          setProviders(data);
          setMessage(data.length ? `${data.length} nearby providers found` : "5 km range me provider nahi mila");
        } catch (error) {
          setMessage(error.response?.data?.message || "Search failed");
        }
      },
      () => setMessage("Location permission required")
    );
  };

  return (
    <section className="section">
      <div className="container">
        <div className="page-banner">
          <span className="eyebrow">Emergency & urgent requirement</span>
          <h1>Important Help Near You</h1>
          <p>Category select karke apni requirement aur live location submit karein. Platform 5 km ke verified providers distance aur delivery/visit charge ke saath dikhayega.</p>
        </div>

        <div className="help-search">
          <select value={sectorSlug} onChange={(e) => setSectorSlug(e.target.value)}>
            <option value="">Select category</option>
            {sectors.map((sector) => <option value={sector.slug} key={sector._id}>{sector.name}</option>)}
          </select>
          <input placeholder="Kis cheez ki zarurat hai?" value={need} onChange={(e) => setNeed(e.target.value)} />
          <button className="btn primary" onClick={search}>Use Location & Search</button>
        </div>
        {message && <div className="info-message">{message}</div>}
        <div className="provider-grid">
          {providers.map((provider) => (
            <div key={provider._id}>
              <ProviderCard provider={provider} />
              <div className="distance-line">{provider.distanceKm} km away · Estimated charge ₹{provider.estimatedDeliveryCharge}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

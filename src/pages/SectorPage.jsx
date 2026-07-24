import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import ProviderCard from "../components/ProviderCard";

export default function SectorPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    API.get(`/sectors/${slug}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Unable to load sector"));
  }, [slug]);

  if (error) return <div className="container page-state">{error}</div>;
  if (!data) return <div className="container page-state">Loading...</div>;

  return (
    <section className="section">
      <div className="container">
        <div className="page-banner">
          <span className="eyebrow">Chittorgarh services</span>
          <h1>{data.sector.name}</h1>
          <p>{data.sector.description}</p>
        </div>

        <div className="provider-grid">
          {data.providers.length ? (
            data.providers.map((provider) => <ProviderCard key={provider._id} provider={provider} />)
          ) : (
            <div className="empty-card">
              <h3>No verified provider yet</h3>
              <p>Provider registration is open for this sector.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  BriefcaseBusiness,
} from "lucide-react";

import API from "../api";
import ProviderCard from "../components/ProviderCard";
import "./SectorPage.css";

export default function SectorPage() {
  const { slug } = useParams();

  const [data, setData] =
    useState(null);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let active = true;

    async function loadSector() {
      setLoading(true);
      setError("");
      setData(null);

      try {
        const response =
          await API.get(
            `/sectors/${slug}`
          );

        if (!active) return;

        const responseData =
          response.data;

        if (!responseData?.sector) {
          throw new Error(
            "Invalid sector response"
          );
        }

        setData({
          sector:
            responseData.sector,
          providers:
            Array.isArray(
              responseData.providers
            )
              ? responseData.providers
              : [],
        });
      } catch (requestError) {
        if (!active) return;

        console.error(
          "Sector load error:",
          requestError
        );

        setError(
          requestError.response?.data
            ?.message ||
            "Service category load nahi ho paayi."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (slug) {
      loadSector();
    }

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <section className="section sector-page">
        <div className="container">
          <div className="page-state">
            Loading service...
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section sector-page">
        <div className="container">
          <div className="page-state error">
            <h2>
              Service load nahi hui
            </h2>

            <p>{error}</p>

            <Link
              className="btn primary"
              to="/"
            >
              <ArrowLeft size={17} />
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!data?.sector) {
    return null;
  }

  return (
    <section className="section sector-page">
      <div className="container">
        <Link
          className="sector-back-link"
          to="/"
        >
          <ArrowLeft size={17} />
          All services
        </Link>

        <div className="page-banner">
          <span className="eyebrow">
            Chittorgarh services
          </span>

          <h1>
            {data.sector.name}
          </h1>

          <p>
            {data.sector.description ||
              "Verified local service providers ko compare karein."}
          </p>

          <span className="sector-count">
            <BriefcaseBusiness
              size={16}
            />

            {data.providers.length}{" "}
            {data.providers.length === 1
              ? "provider"
              : "providers"}{" "}
            available
          </span>
        </div>

        <div className="provider-grid">
          {data.providers.length ? (
            data.providers.map(
              (provider) => (
                <ProviderCard
                  key={provider._id}
                  provider={provider}
                />
              )
            )
          ) : (
            <div className="empty-card">
              <div className="empty-card-icon">
                <BriefcaseBusiness />
              </div>

              <h3>
                No verified provider yet
              </h3>

              <p>
                Is service category ke
                liye abhi koi verified
                provider available nahi
                hai.
              </p>

              <Link
                className="btn primary"
                to="/provider/register"
              >
                Register as Provider
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
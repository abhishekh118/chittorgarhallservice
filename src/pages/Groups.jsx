import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  LocateFixed,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import API from "../api";
import SectorCard from "../components/SectorCard";
import "./Home.css";

const popularServices = ["Home Repair", "Taxi", "Hotels", "Education"];

const trustItems = [
  { icon: ShieldCheck, label: "Secure booking" },
  { icon: LocateFixed, label: "Nearby providers" },
  { icon: Clock3, label: "Quick response" },
  { icon: BadgeCheck, label: "Verified profiles" },
];

export default function Home() {
  const [sectors, setSectors] = useState([]);
  const [notices, setNotices] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function loadHomeData() {
      setLoading(true);
      setError("");

      const [sectorResult, noticeResult] = await Promise.allSettled([
        API.get("/sectors"),
        API.get("/public/notices"),
      ]);

      if (!active) return;

      if (sectorResult.status === "fulfilled") {
        setSectors(
          Array.isArray(sectorResult.value.data)
            ? sectorResult.value.data
            : []
        );
      } else {
        console.error("Sector load error:", sectorResult.reason);
        setSectors([]);
        setError(
          sectorResult.reason?.response?.data?.message ||
            "Services load nahi ho paayi. Backend connection check karein."
        );
      }

      if (noticeResult.status === "fulfilled") {
        setNotices(
          Array.isArray(noticeResult.value.data)
            ? noticeResult.value.data
            : []
        );
      } else {
        console.error("Notice load error:", noticeResult.reason);
        setNotices([]);
      }

      setLoading(false);
    }

    loadHomeData();

    return () => {
      active = false;
    };
  }, []);

  const filteredSectors = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return sectors;

    return sectors.filter((sector) =>
      `${sector.name || ""} ${sector.description || ""}`
        .toLowerCase()
        .includes(value)
    );
  }, [query, sectors]);

  function goToServices() {
    document.getElementById("services")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function searchService(searchValue = query) {
    const value = searchValue.trim().toLowerCase();

    if (!value) {
      goToServices();
      return;
    }

    const match = sectors.find((sector) => {
      const name = sector.name?.toLowerCase() || "";
      const description = sector.description?.toLowerCase() || "";
      return name === value || name.includes(value) || description.includes(value);
    });

    if (match?.slug) {
      navigate(`/sector/${match.slug}`);
      return;
    }

    goToServices();
  }

  function handleSearch(event) {
    event.preventDefault();
    searchService();
  }

  function selectPopularService(serviceName) {
    setQuery(serviceName);
    searchService(serviceName);
  }

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="container home-hero-grid">
          <div className="home-copy">
            <span className="home-kicker">
              <BadgeCheck size={17} />
              Trusted local service platform
            </span>

            <h1>
              Chittorgarh ki har service,
              <span> ek hi jagah.</span>
            </h1>

            <p className="home-lead">
              Verified professionals ko search aur compare karein. Transparent
              pricing ke saath apni service safely book karein.
            </p>

            <form className="home-search" onSubmit={handleSearch}>
              <Search size={21} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Plumber, taxi, hotel, tutor..."
                aria-label="Search local services"
              />
              <button type="submit">Search</button>
            </form>

            <div className="home-popular" aria-label="Popular services">
              <span>Popular:</span>
              {popularServices.map((service) => (
                <button
                  type="button"
                  key={service}
                  onClick={() => selectPopularService(service)}
                >
                  {service}
                </button>
              ))}
            </div>

            <div className="home-actions">
              <Link className="home-btn home-btn-primary" to="/customer/register">
                <UserRound size={18} />
                Book a Service
              </Link>
              <Link className="home-btn home-btn-outline" to="/provider/register">
                <BriefcaseBusiness size={18} />
                List Your Business
              </Link>
            </div>
          </div>

          <aside className="home-preview" aria-label="Featured service categories">
            <div className="home-preview-head">
              <strong>
                <BriefcaseBusiness size={20} />
                Popular Services
              </strong>
              <span>
                <BadgeCheck size={14} />
                Verified
              </span>
            </div>

            <div className="home-preview-list">
              {loading ? (
                <div className="preview-empty">Loading services...</div>
              ) : sectors.length ? (
                sectors.slice(0, 4).map((sector) => (
                  <Link
                    className="home-preview-item"
                    key={sector._id || sector.slug}
                    to={`/sector/${sector.slug}`}
                  >
                    <span className="preview-icon">{sector.icon || "●"}</span>
                    <b>{sector.name}</b>
                    <ArrowRight size={17} />
                  </Link>
                ))
              ) : (
                <div className="preview-empty">No services available</div>
              )}
            </div>

            <button
              type="button"
              className="home-view-all"
              onClick={goToServices}
            >
              Explore all services
              <ArrowRight size={17} />
            </button>
          </aside>
        </div>

        <div className="container home-trust">
          {trustItems.map(({ icon: Icon, label }) => (
            <div key={label}>
              <Icon size={19} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="notice-zone">
        <div className="container">
          <div className="home-section-head">
            <div>
              <span className="section-label">City updates</span>
              <h2>Latest notices</h2>
              <p>Important service and community updates.</p>
            </div>
          </div>

          {notices.length ? (
            <div className="notice-grid">
              {notices.slice(0, 3).map((notice) => (
                <article className="notice-card" key={notice._id || notice.title}>
                  <small>{notice.type || "Update"}</small>
                  <h3>{notice.title}</h3>
                  <p>{notice.message}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="home-empty compact">
              <h3>No new notices</h3>
              <p>Latest updates yahan dikhai dengi.</p>
            </div>
          )}
        </div>
      </section>

      <section className="services-section" id="services">
        <div className="container">
          <div className="home-section-head home-section-head-row">
            <div>
              <span className="section-label">Explore categories</span>
              <h2>Find the right service</h2>
              <p>Choose a category and compare nearby providers.</p>
            </div>
            <Link className="section-link" to="/important-help">
              Nearby services
              <ArrowRight size={17} />
            </Link>
          </div>

          {error && <div className="home-error">{error}</div>}

          {loading ? (
            <div className="home-empty">Loading services...</div>
          ) : filteredSectors.length ? (
            <div className="sector-grid">
              {filteredSectors.map((sector) => (
                <SectorCard key={sector._id || sector.slug} sector={sector} />
              ))}
            </div>
          ) : (
            <div className="home-empty">
              <Search size={30} />
              <h3>Service not found</h3>
              <p>Kisi dusre service name se search karein.</p>
            </div>
          )}
        </div>
      </section>

      <section className="journey-section">
        <div className="container journey-grid">
          <article className="journey-card">
            <div className="journey-icon">
              <UserRound />
            </div>
            <span>For customers</span>
            <h2>Need a local service?</h2>
            <p>
              Compare verified providers and book with transparent charges.
            </p>
            <Link to="/customer/register">
              Create customer account
              <ArrowRight size={19} />
            </Link>
          </article>

          <article className="journey-card journey-card-red">
            <div className="journey-icon">
              <BriefcaseBusiness />
            </div>
            <span>For providers</span>
            <h2>Grow your local business</h2>
            <p>
              Create a profile, complete KYC and receive online bookings.
            </p>
            <Link to="/provider/register">
              Register your business
              <ArrowRight size={19} />
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}
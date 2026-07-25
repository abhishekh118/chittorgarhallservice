import {
  useEffect,
  useMemo,
  useState,
} from "react";

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

import {
  Link,
  useNavigate,
} from "react-router-dom";

import API from "../api";
import SectorCard from "../components/SectorCard";
import "./Home.css";

const popular = [
  "Home Repair",
  "Taxi",
  "Hotels",
  "Education",
];

export default function Home() {
  const [sectors, setSectors] =
    useState([]);

  const [notices, setNotices] =
    useState([]);

  const [query, setQuery] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function loadHomeData() {
      setLoading(true);
      setError("");

      try {
        const [
          sectorResponse,
          noticeResponse,
        ] = await Promise.all([
          API.get("/sectors"),
          API.get("/public/notices"),
        ]);

        if (!active) return;

        const sectorData =
          Array.isArray(
            sectorResponse.data
          )
            ? sectorResponse.data
            : [];

        const noticeData =
          Array.isArray(
            noticeResponse.data
          )
            ? noticeResponse.data
            : [];

        setSectors(sectorData);
        setNotices(noticeData);
      } catch (requestError) {
        if (!active) return;

        console.error(
          "Home data load error:",
          requestError
        );

        setError(
          requestError.response?.data
            ?.message ||
            "Services load nahi ho paayi. Backend connection check karein."
        );

        setSectors([]);
        setNotices([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadHomeData();

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const value = query
      .trim()
      .toLowerCase();

    if (!value) {
      return sectors;
    }

    return sectors.filter((sector) =>
      sector.name
        ?.toLowerCase()
        .includes(value)
    );
  }, [query, sectors]);

  function scrollToServices() {
    document
      .getElementById("services")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  function showAllServices() {
    setQuery("");

    window.setTimeout(() => {
      scrollToServices();
    }, 0);
  }

  function searchService(
    value = query
  ) {
    const term = String(value)
      .trim()
      .toLowerCase();

    if (!term) {
      showAllServices();
      return;
    }

    const exactMatch =
      sectors.find(
        (sector) =>
          sector.name
            ?.toLowerCase() === term ||
          sector.slug
            ?.toLowerCase() ===
            term.replace(/\s+/g, "-")
      );

    const partialMatch =
      sectors.find((sector) =>
        sector.name
          ?.toLowerCase()
          .includes(term)
      );

    const match =
      exactMatch || partialMatch;

    if (match?.slug) {
      navigate(
        `/sector/${match.slug}`
      );

      return;
    }

    scrollToServices();
  }

  const previewSectors =
    sectors.slice(0, 4);

  return (
    <>
      <section className="home-hero">
        <div className="container home-hero-grid">
          <div className="home-copy">
            <span className="home-kicker">
              <BadgeCheck size={16} />
              Trusted local service
              platform
            </span>

            <h1>
              Chittorgarh ki har
              service,{" "}
              <span>ek hi jagah.</span>
            </h1>

            <p>
              Verified professionals ko
              search aur compare karein.
              Transparent pricing ke
              saath apni service safely
              book karein.
            </p>

            <div className="home-search">
              <Search size={21} />

              <input
                type="search"
                value={query}
                onChange={(event) =>
                  setQuery(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter"
                  ) {
                    searchService();
                  }
                }}
                placeholder="Plumber, taxi, hotel, tutor..."
                aria-label="Search services"
              />

              <button
                type="button"
                onClick={() =>
                  searchService()
                }
              >
                Search
              </button>
            </div>

            <div className="home-popular">
              <span>Popular:</span>

              {popular.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => {
                    setQuery(item);
                    searchService(item);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="home-actions">
              <Link
                className="btn primary"
                to="/customer/register"
              >
                <UserRound size={18} />
                Book a Service
              </Link>

              <Link
                className="btn ghost"
                to="/provider/register"
              >
                <BriefcaseBusiness
                  size={18}
                />
                List Your Business
              </Link>
            </div>
          </div>

          <aside className="home-preview">
            <div className="home-preview-head">
              <strong>
                <BriefcaseBusiness
                  size={20}
                />
                All Services
              </strong>

              <span>Verified</span>
            </div>

            <div className="home-preview-list">
              {loading ? (
                <div className="preview-message">
                  Loading services...
                </div>
              ) : previewSectors.length ? (
                previewSectors.map(
                  (sector) => (
                    <Link
                      className="home-preview-item"
                      key={sector._id}
                      to={`/sector/${sector.slug}`}
                    >
                      <span>
                        {sector.icon ||
                          "🔴"}
                      </span>

                      <b>{sector.name}</b>

                      <ArrowRight
                        size={17}
                      />
                    </Link>
                  )
                )
              ) : (
                <div className="preview-message">
                  Services available nahi
                  hain.
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn ghost"
              onClick={showAllServices}
            >
              Explore all services
              <ArrowRight size={17} />
            </button>
          </aside>
        </div>

        <div className="container home-trust">
          <div>
            <ShieldCheck size={18} />
            Secure booking
          </div>

          <div>
            <LocateFixed size={18} />
            Nearby providers
          </div>

          <div>
            <Clock3 size={18} />
            Quick response
          </div>

          <div>
            <BadgeCheck size={18} />
            Verified profiles
          </div>
        </div>
      </section>

      <section className="notice-zone">
        <div className="container">
          <div className="section-head">
            <div>
              <span>City updates</span>

              <h2>Latest notices</h2>

              <p>
                Important service and
                community updates.
              </p>
            </div>
          </div>

          {notices.length ? (
            <div className="notice-grid">
              {notices
                .slice(0, 3)
                .map((notice) => (
                  <article
                    className="notice-card"
                    key={notice._id}
                  >
                    <small>
                      {notice.type ||
                        "Update"}
                    </small>

                    <h3>
                      {notice.title}
                    </h3>

                    <p>
                      {notice.message}
                    </p>
                  </article>
                ))}
            </div>
          ) : (
            !loading && (
              <div className="home-empty">
                <h3>
                  Koi active notice nahi
                  hai
                </h3>

                <p>
                  New city updates yahan
                  dikhengi.
                </p>
              </div>
            )
          )}
        </div>
      </section>

      <section
        className="section"
        id="services"
      >
        <div className="container">
          <div className="section-head">
            <div>
              <span>
                Explore categories
              </span>

              <h2>
                Find the right service
              </h2>

              <p>
                Choose a category and
                compare nearby
                providers.
              </p>
            </div>

            <Link to="/important-help">
              Nearby services
              <ArrowRight size={17} />
            </Link>
          </div>

          {loading ? (
            <div className="home-empty">
              Loading services...
            </div>
          ) : error ? (
            <div className="home-empty error">
              <h3>
                Services load nahi hui
              </h3>

              <p>{error}</p>
            </div>
          ) : filtered.length ? (
            <div className="sector-grid">
              {filtered.map(
                (sector) => (
                  <SectorCard
                    key={sector._id}
                    sector={sector}
                  />
                )
              )}
            </div>
          ) : (
            <div className="home-empty">
              <h3>
                Service not found
              </h3>

              <p>
                Koi dusra service name
                search karein.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="journey-section">
        <div className="container journey-grid">
          <article className="journey-card customer">
            <div className="journey-icon">
              <UserRound />
            </div>

            <span>For customers</span>

            <h2>
              Need a local service?
            </h2>

            <p>
              Verified providers compare
              karein aur transparent
              charges ke saath service
              book karein.
            </p>

            <Link to="/customer/register">
              Create customer account
              <ArrowRight size={19} />
            </Link>
          </article>

          <article className="journey-card provider">
            <div className="journey-icon">
              <BriefcaseBusiness />
            </div>

            <span>For providers</span>

            <h2>
              Grow your local business
            </h2>

            <p>
              Business profile create
              karein, KYC complete karein
              aur online bookings
              receive karein.
            </p>

            <Link to="/provider/register">
              Register your business
              <ArrowRight size={19} />
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
import {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import API from "../api";

import MarketplaceCard from
  "../components/MarketplaceCard";

import "./Marketplace.css";

const marketplaceTabs = [
  {
    value: "second_hand",
    label: "Second-hand Items",
  },
  {
    value: "room",
    label: "Rooms on Rent",
  },
  {
    value: "house",
    label: "Houses & Property",
  },
];

export default function Marketplace() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const selectedType =
    searchParams.get("type") ||
    "second_hand";

  const [listings, setListings] =
    useState([]);

  const [location, setLocation] =
    useState(
      searchParams.get("location") || ""
    );

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    let active = true;

    async function loadListings() {
      try {
        setLoading(true);
        setMessage("");

        const currentLocation =
          searchParams.get("location") ||
          "";

        setLocation(currentLocation);

        const { data } =
          await API.get(
            "/marketplace",
            {
              params: {
                type: selectedType,

                location:
                  currentLocation.trim(),
              },
            }
          );

        if (active) {
          setListings(
            Array.isArray(data)
              ? data.filter(Boolean)
              : []
          );
        }
      } catch (error) {
        console.error(
          "Marketplace load error:",
          error.response?.data ||
            error
        );

        if (active) {
          setListings([]);

          setMessage(
            error.response?.data
              ?.message ||
              "Listings load nahi ho paayi."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadListings();

    return () => {
      active = false;
    };
  }, [selectedType, searchParams]);

  function changeTab(type) {
    setSearchParams({
      type,
    });
  }

  async function search(event) {
    event.preventDefault();

    const params = {
      type: selectedType,
    };

    if (location.trim()) {
      params.location =
        location.trim();
    }

    setSearchParams(params);
  }

  return (
    <section className="section marketplace-page">
      <div className="container">
        <div className="page-banner">
          <span className="eyebrow">
            Verified local marketplace
          </span>

          <h1>
            Buy, Rent or Find a Home
          </h1>

          <p>
            KYC-verified businesses ki
            admin-approved listings
            dekhein.
          </p>
        </div>

        <div className="market-toolbar">
          <div className="market-tabs">
            {marketplaceTabs.map(
              (tab) => (
                <button
                  type="button"
                  key={tab.value}
                  className={
                    selectedType ===
                    tab.value
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    changeTab(tab.value)
                  }
                >
                  {tab.label}
                </button>
              )
            )}
          </div>

          <form onSubmit={search}>
            <input
              value={location}
              onChange={(event) =>
                setLocation(
                  event.target.value
                )
              }
              placeholder="Area, city, district or pincode"
            />

            <button className="btn primary">
              Search
            </button>
          </form>
        </div>

        {message && (
          <div className="info-message">
            {message}
          </div>
        )}

        {loading ? (
          <div className="empty-card">
            Listings loading...
          </div>
        ) : listings.length > 0 ? (
          <div className="market-grid">
            {listings.map(
              (listing) =>
                listing?._id ? (
                  <MarketplaceCard
                    key={listing._id}
                    listing={listing}
                  />
                ) : null
            )}
          </div>
        ) : (
          <div className="empty-card">
            Is category ya location mein
            approved listing nahi mili.
          </div>
        )}
      </div>
    </section>
  );
}
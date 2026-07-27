import {
  useEffect,
  useState,
} from "react";

import NearbyMarketplace from
  "../components/NearbyMarketplace";

import "./Marketplace.css";
import {
  LocateFixed,
  MapPin,
  Search,
} from "lucide-react";

import API from "../api";
import ProviderCard from "../components/ProviderCard";
import "./NearbyHelp.css";

export default function NearbyHelp() {
  const [sectors, setSectors] =
    useState([]);

  const [
    sectorSlug,
    setSectorSlug,
  ] = useState("");

  const [need, setNeed] =
    useState("");

  const [
    locationQuery,
    setLocationQuery,
  ] = useState("");

  const [providers, setProviders] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [
    sectorsLoading,
    setSectorsLoading,
  ] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSectors() {
      try {
        setSectorsLoading(true);

        const response =
          await API.get("/sectors");

        if (active) {
          setSectors(
            Array.isArray(response.data)
              ? response.data
              : []
          );
        }
      } catch (requestError) {
        console.error(
          "Sectors load error:",
          requestError.response?.data ||
            requestError
        );

        if (active) {
          setSectors([]);

          setError(
            requestError.response?.data
              ?.message ||
              "Categories load nahi ho paayi."
          );
        }
      } finally {
        if (active) {
          setSectorsLoading(false);
        }
      }
    }

    loadSectors();

    return () => {
      active = false;
    };
  }, []);

  function validateCategory() {
    if (!sectorSlug) {
      setError(
        "Pehle service category select karein."
      );

      return false;
    }

    return true;
  }

  function searchWithLiveLocation() {
    setMessage("");
    setError("");
    setProviders([]);

    if (!validateCategory()) {
      return;
    }

    if (!navigator.geolocation) {
      setError(
        "Aapka browser live location support nahi karta. City ya village se search karein."
      );

      return;
    }

    setLoading(true);

    setMessage(
      "Live location capture ho rahi hai..."
    );

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response =
            await API.get(
              "/providers/nearby/search",
              {
                params: {
                  sectorSlug,

                  lat:
                    coords.latitude,

                  lng:
                    coords.longitude,

                  // Testing के लिए 20 km.
                  // बाद में 5 कर सकते हो.
                  radius: 20,

                  need: need.trim(),
                },
              }
            );

          const result =
            Array.isArray(response.data)
              ? response.data
              : [];

          setProviders(result);

          setMessage(
            result.length
              ? `${result.length} nearby providers found`
              : "20 km range mein verified provider nahi mila."
          );
        } catch (requestError) {
          console.error(
            "Nearby search error:",
            requestError.response?.data ||
              requestError
          );

          setProviders([]);

          setError(
            requestError.response?.data
              ?.message ||
              "Nearby providers search nahi ho paayi."
          );
        } finally {
          setLoading(false);
        }
      },

      (locationError) => {
        console.error(
          "Location permission error:",
          locationError
        );

        setLoading(false);
        setProviders([]);
        setMessage("");

        if (
          locationError.code ===
          locationError.PERMISSION_DENIED
        ) {
          setError(
            "Location permission denied hai. Permission Allow karein ya city/village se search karein."
          );
        } else if (
          locationError.code ===
          locationError.POSITION_UNAVAILABLE
        ) {
          setError(
            "Location available nahi hai. Device GPS ON karein ya city/village से search karein."
          );
        } else if (
          locationError.code ===
          locationError.TIMEOUT
        ) {
          setError(
            "Location capture timeout ho gaya. Dobara try karein."
          );
        } else {
          setError(
            "Live location capture nahi ho paayi."
          );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  }

  async function searchWithPlace() {
    setMessage("");
    setError("");
    setProviders([]);

    if (!validateCategory()) {
      return;
    }

    if (
      locationQuery.trim().length < 2
    ) {
      setError(
        "City, village, area ya district ka naam likhein."
      );

      return;
    }

    try {
      setLoading(true);

      setMessage(
        `${locationQuery.trim()} mein providers search ho rahe hain...`
      );

      const response = await API.get(
        "/providers/location/search",
        {
          params: {
            sectorSlug,
            location:
              locationQuery.trim(),
            need: need.trim(),
          },
        }
      );

      const result =
        Array.isArray(response.data)
          ? response.data
          : [];

      setProviders(result);

      setMessage(
        result.length
          ? `${result.length} providers ${locationQuery.trim()} ke aas-paas mile`
          : `${locationQuery.trim()} mein verified provider nahi mila.`
      );
    } catch (requestError) {
      console.error(
        "Place search error:",
        requestError.response?.data ||
          requestError
      );

      setProviders([]);

      setError(
        requestError.response?.data
          ?.message ||
          "City/village search nahi ho paayi."
      );
    } finally {
      setLoading(false);
    }
  }

  function handlePlaceKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      searchWithPlace();
    }
  }

  return (
    <section className="section nearby-page">
      <div className="container">
        <div className="page-banner">
          <span className="eyebrow">
            Emergency & urgent requirement
          </span>

          <h1>
            Important Help Near You
          </h1>

          <p>
            Live location ya city, village,
            area aur district ke naam se
            verified service providers
            search karein.
          </p>
        </div>

        <div className="help-search-panel">
          <div className="help-search-fields">
            <div className="help-field">
              <label htmlFor="helpSector">
                Service category
              </label>

              <select
                id="helpSector"
                value={sectorSlug}
                disabled={sectorsLoading}
                onChange={(event) =>
                  setSectorSlug(
                    event.target.value
                  )
                }
              >
                <option value="">
                  {sectorsLoading
                    ? "Categories loading..."
                    : "Select category"}
                </option>

                {sectors.map(
                  (sector) => (
                    <option
                      value={sector.slug}
                      key={sector._id}
                    >
                      {sector.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="help-field">
              <label htmlFor="helpNeed">
                Kya service chahiye?
              </label>

              <input
                id="helpNeed"
                placeholder="Jaise: teacher, plumber, taxi"
                value={need}
                onChange={(event) =>
                  setNeed(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="help-field">
              <label htmlFor="helpLocation">
                City, village, area or district
              </label>

              <div className="location-search-input">
                <MapPin size={19} />

                <input
                  id="helpLocation"
                  placeholder="Jaise: Motihari, Raghunathpur"
                  value={locationQuery}
                  onChange={(event) =>
                    setLocationQuery(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handlePlaceKeyDown
                  }
                />
              </div>
            </div>
          </div>

          <div className="help-search-actions">
            <button
              type="button"
              className="btn primary"
              disabled={loading}
              onClick={
                searchWithLiveLocation
              }
            >
              <LocateFixed size={18} />

              {loading
                ? "Searching..."
                : "Use Live Location"}
            </button>

            <span className="search-divider">
              OR
            </span>

            <button
              type="button"
              className="btn secondary"
              disabled={loading}
              onClick={searchWithPlace}
            >
              <Search size={18} />

              {loading
                ? "Searching..."
                : "Search Place"}
            </button>
          </div>
        </div>

        {message && (
          <div className="info-message">
            {message}
          </div>
        )}

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <div className="provider-grid">
          {providers.map(
            (provider) => (
              <div
                className="nearby-result"
                key={provider._id}
              >
                <ProviderCard
                  provider={provider}
                />

                {(provider.distanceKm !=
                  null ||
                  provider
                    .estimatedDeliveryCharge !=
                    null) && (
                  <div className="distance-line">
                    {provider.distanceKm !=
                      null && (
                      <span>
                        {Number(
                          provider.distanceKm
                        ).toFixed(1)}{" "}
                        km away
                      </span>
                    )}

                    {provider
                      .estimatedDeliveryCharge !=
                      null && (
                      <span>
                        Estimated charge ₹
                        {
                          provider.estimatedDeliveryCharge
                        }
                      </span>
                    )}
                    <NearbyMarketplace />
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
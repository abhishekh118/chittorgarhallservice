import {
  useEffect,
  useState,
} from "react";

import {
  ExternalLink,
  LoaderCircle,
  MapPin,
} from "lucide-react";

import API from "../api";
import "./CityGuide.css";

export default function CityGuide() {
  const [places, setPlaces] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    async function loadPlaces() {
      try {
        setLoading(true);
        setError("");

        const response =
          await API.get(
            "/public/places"
          );

        if (active) {
          setPlaces(
            Array.isArray(response.data)
              ? response.data
              : []
          );
        }
      } catch (requestError) {
        console.error(
          "City guide error:",
          requestError
        );

        if (active) {
          setPlaces([]);

          setError(
            requestError.response?.data
              ?.message ||
              "City guide load nahi ho paayi."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPlaces();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="section city-guide-page">
      <div className="container">
        <div className="page-banner">
          <span className="eyebrow">
            Explore the city
          </span>

          <h1>
            Chittorgarh City Guide
          </h1>

          <p>
            Famous places, local
            information, transport, hotels,
            food and useful city resources.
          </p>
        </div>

        {loading && (
          <div className="page-state">
            <LoaderCircle
              className="spin"
              size={22}
            />
            City guide loading...
          </div>
        )}

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {!loading && (
          <div className="place-grid">
            {places.map((place) => (
              <article
                className="place-card"
                key={place._id}
              >
                <div className="place-image">
                  {place.image ? (
                    <img
                      src={place.image}
                      alt={place.name}
                      loading="lazy"
                    />
                  ) : (
                    <span>
                      {place.name
                        ?.slice(0, 1)
                        .toUpperCase() ||
                        "C"}
                    </span>
                  )}
                </div>

                <div className="place-content">
                  <span className="eyebrow">
                    {place.category}
                  </span>

                  <h3>{place.name}</h3>

                  <p>
                    {place.shortDescription}
                  </p>

                  {place.address && (
                    <div className="place-address">
                      <MapPin size={16} />
                      <span>
                        {place.address}
                      </span>
                    </div>
                  )}

                  {place.mapUrl && (
                    <a
                      className="place-map-link"
                      href={place.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View on Google Maps
                      <ExternalLink
                        size={15}
                      />
                    </a>
                  )}
                </div>
              </article>
            ))}

            {!places.length && (
              <div className="empty-card">
                <h3>
                  City information coming
                  soon
                </h3>

                <p>
                  Admin ne abhi koi city
                  guide place add nahi kiya.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
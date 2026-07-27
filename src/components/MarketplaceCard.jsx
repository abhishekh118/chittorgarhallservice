import {
  useState,
} from "react";

import {
  MapPin,
  Phone,
  Play,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import API from "../api";

import {
  useAuth,
} from "../context/AuthContext";

const labels = {
  second_hand: "Second-hand",
  room: "Room",
  house: "House",
};

export default function MarketplaceCard({
  listing,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentLocation = useLocation();

  const [contact, setContact] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * अगर किसी कारण listing prop नहीं
   * मिली तो component crash नहीं होगा।
   */
  if (!listing) {
    return null;
  }

  const media =
    Array.isArray(listing.media)
      ? listing.media
      : [];

  const cover =
    media.find(
      (item) =>
        item?.type === "image"
    ) || media[0];

  const priceSuffix =
    listing.priceUnit === "per_month"
      ? "/month"
      : listing.priceUnit === "per_day"
        ? "/day"
        : "";

  function normalizePhone(value) {
    const digits = String(value || "")
      .replace(/\D/g, "");

    if (digits.length < 10) {
      return "";
    }

    return digits.slice(-10);
  }

  async function getContact() {
    setError("");

    if (!user) {
      navigate(
        "/customer/login",
        {
          state: {
            from:
              currentLocation.pathname +
              currentLocation.search,
          },
        }
      );

      return;
    }

    if (
      user.role !== "customer" &&
      user.role !== "admin"
    ) {
      setError(
        "Seller se contact karne ke liye customer account se login karein."
      );

      return;
    }

    try {
      setLoading(true);

      const { data } =
        await API.post(
          `/marketplace/${listing._id}/enquiry`,
          {
            offeredPrice:
              listing.price,

            message:
              `I am interested in ${listing.title}`,
          }
        );

      const phone =
        normalizePhone(
          data.seller?.phone
        );

      if (!phone) {
        setError(
          "Seller ka valid phone number available nahi hai."
        );

        return;
      }

      setContact({
        name:
          data.seller?.name ||
          "Seller",

        phone,
      });
    } catch (requestError) {
      console.error(
        "Seller contact error:",
        requestError.response?.data ||
          requestError
      );

      setError(
        requestError.response?.data
          ?.message ||
          "Seller ka contact nahi mil paya."
      );
    } finally {
      setLoading(false);
    }
  }

  const phoneUrl = contact
    ? `tel:+91${contact.phone}`
    : "#";

  const whatsappMessage =
    encodeURIComponent(
      `Hello, main aapki "${listing.title}" listing mein interested hoon. Kya ye available hai?`
    );

  const whatsappUrl = contact
    ? `https://wa.me/91${contact.phone}?text=${whatsappMessage}`
    : "#";

  return (
    <article className="market-card">
      <div className="market-media">
        {cover?.type === "video" ? (
          <video
            src={cover.url}
            controls
            muted
            preload="metadata"
          />
        ) : cover?.url ? (
          <img
            src={cover.url}
            alt={
              listing.title ||
              "Marketplace listing"
            }
            loading="lazy"
          />
        ) : (
          <div className="market-no-image">
            No image
          </div>
        )}

        {media.some(
          (item) =>
            item?.type === "video"
        ) && (
          <span className="video-badge">
            <Play size={14} />
            Video
          </span>
        )}

        <span className="market-type">
          {labels[
            listing.listingType
          ] || "Listing"}
        </span>
      </div>

      <div className="market-body">
        <h3>
          {listing.title ||
            "Untitled listing"}
        </h3>

        <strong className="market-price">
          ₹
          {Number(
            listing.price || 0
          ).toLocaleString("en-IN")}

          {priceSuffix}
        </strong>

        <p>
          {listing.description ||
            "No description available"}
        </p>

        <span className="market-location">
          <MapPin size={15} />

          {[
            listing.location?.area,
            listing.location?.city,
          ]
            .filter(Boolean)
            .join(", ") ||
            "Location not available"}
        </span>

        <div className="market-foot">
          <span>
            <ShieldCheck size={15} />
            Verified business
          </span>

          {!contact && (
            <button
              type="button"
              className="btn primary"
              disabled={loading}
              onClick={getContact}
            >
              {loading
                ? "Loading..."
                : listing.listingType ===
                    "second_hand"
                  ? "Buy / Contact"
                  : "Enquire Now"}
            </button>
          )}
        </div>

        {error && (
          <div className="card-contact-error">
            {error}
          </div>
        )}

        {contact && (
          <div className="card-seller-contact">
            <button
              type="button"
              className="card-contact-close"
              onClick={() => {
                setContact(null);
                setError("");
              }}
            >
              <X size={17} />
            </button>

            <span>
              Verified seller
            </span>

            <strong>
              {contact.name}
            </strong>

            <a
              className="contact-phone"
              href={phoneUrl}
            >
              +91 {contact.phone}
            </a>

            <div className="card-contact-actions">
              <a
                href={phoneUrl}
                className="btn primary"
              >
                <Phone size={16} />
                Call Now
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="btn whatsapp"
              >
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
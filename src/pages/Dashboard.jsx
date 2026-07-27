import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import API from "../api";
import { useAuth } from "../context/AuthContext";

import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();

  const [bookings, setBookings] =
    useState([]);

  const [provider, setProvider] =
    useState(null);

  const [bookingsLoading, setBookingsLoading] =
    useState(true);

  const [providerLoading, setProviderLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      if (!user) {
        if (active) {
          setBookings([]);
          setProvider(null);
          setBookingsLoading(false);
        }

        return;
      }

      setError("");
      setBookingsLoading(true);

      try {
        const bookingResponse =
          await API.get("/bookings/mine");

        const bookingData =
          Array.isArray(bookingResponse.data)
            ? bookingResponse.data
            : [];

        if (active) {
          setBookings(bookingData);
        }
      } catch (requestError) {
        console.error(
          "Bookings load error:",
          requestError.response?.data ||
            requestError.message
        );

        if (active) {
          setBookings([]);

          setError(
            requestError.response?.data
              ?.message ||
              "Booking history load nahi ho payi."
          );
        }
      } finally {
        if (active) {
          setBookingsLoading(false);
        }
      }

      if (user.role === "provider") {
        try {
          if (active) {
            setProviderLoading(true);
          }

          const providerResponse =
            await API.get("/providers/me");

          /*
           * Backend direct provider object ya
           * { provider: {...} } return kar sakta hai.
           */
          const providerData =
            providerResponse.data?.provider ??
            providerResponse.data ??
            null;

          if (active) {
            setProvider(providerData);
          }
        } catch (requestError) {
          console.error(
            "Provider profile load error:",
            requestError.response?.data ||
              requestError.message
          );

          if (active) {
            setProvider(null);

            /*
             * 404 ka matlab provider onboarding
             * complete nahi hua hai. Isliye ise
             * critical error ki tarah show nahi karte.
             */
            if (
              requestError.response?.status !==
              404
            ) {
              setError(
                requestError.response?.data
                  ?.message ||
                  "Provider profile load nahi ho paya."
              );
            }
          }
        } finally {
          if (active) {
            setProviderLoading(false);
          }
        }
      } else if (active) {
        setProvider(null);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [user]);

  function formatMoney(value) {
    const amount = Number(value || 0);

    return amount.toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    );
  }

  function readableStatus(value) {
    if (!value) {
      return "Pending";
    }

    return String(value)
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase()
      );
  }

  function getProviderStatus() {
    if (user?.role !== "provider") {
      return "Not applicable";
    }

    if (providerLoading) {
      return "Loading...";
    }

    if (!provider) {
      return "Profile incomplete";
    }

    if (
      provider.verified ||
      provider.verificationStatus ===
        "approved"
    ) {
      return "Verified";
    }

    return readableStatus(
      provider.verificationStatus ||
        "pending"
    );
  }

  return (
    <section className="section dashboard-page">
      <div className="container">
        <div className="page-banner">
          <span className="eyebrow">
            My account
          </span>

          <h1>
            Hello, {user?.name || "User"}
          </h1>

          <p>
            Your bookings, orders, profile
            and service activity are saved
            here.
          </p>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {user?.role === "provider" &&
          !providerLoading &&
          !provider && (
            <div className="info-message">
              Provider profile incomplete.{" "}

              <Link to="/provider-onboarding">
                Complete now
              </Link>
            </div>
          )}

        {user?.role === "provider" &&
          provider &&
          provider.verificationStatus !==
            "approved" &&
          !provider.verified && (
            <div className="info-message">
              Your provider verification is{" "}

              <strong>
                {readableStatus(
                  provider.verificationStatus ||
                    "pending"
                )}
              </strong>
              .{" "}

              <Link to="/provider-kyc">
                Check KYC status
              </Link>
            </div>
          )}

        {user?.role === "provider" &&
          provider &&
          (provider.verified ||
            provider.verificationStatus ===
              "approved") && (
            <div className="dashboard-business-actions">
              <Link
                className="btn primary"
                to="/provider/marketplace/new"
              >
                Add Second-hand / Property
              </Link>

              <Link
                className="btn ghost"
                to="/marketplace"
              >
                View Marketplace
              </Link>
            </div>
          )}

        <div className="dashboard-grid">
          <div className="panel">
            <h3>Account Type</h3>

            <strong>
              {readableStatus(
                user?.role || "customer"
              )}
            </strong>
          </div>

          <div className="panel">
            <h3>Total Bookings</h3>

            <strong>
              {bookingsLoading
                ? "..."
                : bookings.length}
            </strong>
          </div>

          <div className="panel">
            <h3>Provider Status</h3>

            <strong>
              {getProviderStatus()}
            </strong>
          </div>
        </div>

        <div className="panel">
          <h2>Booking History</h2>

          {bookingsLoading ? (
            <div className="dashboard-empty">
              Booking history loading...
            </div>
          ) : bookings.length === 0 ? (
            <div className="dashboard-empty">
              <p>
                Abhi tak koi booking nahi
                hai.
              </p>

              <Link
                className="btn primary"
                to="/"
              >
                Explore Services
              </Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Sector</th>
                    <th>Provider</th>
                    <th>Service</th>
                    <th>Base</th>
                    <th>GST</th>
                    <th>Delivery</th>
                    <th>Fee</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map(
                    (booking) => (
                      <tr key={booking._id}>
                        <td>
                          {booking.sector
                            ?.name || "—"}
                        </td>

                        <td>
                          {booking.provider
                            ?.businessName ||
                            "—"}
                        </td>

                        <td>
                          {booking.serviceName ||
                            "General Service"}
                        </td>

                        <td>
                          ₹
                          {formatMoney(
                            booking.baseAmount
                          )}
                        </td>

                        <td>
                          ₹
                          {formatMoney(
                            booking.gstAmount
                          )}
                        </td>

                        <td>
                          ₹
                          {formatMoney(
                            booking.deliveryCharge
                          )}
                        </td>

                        <td>
                          ₹
                          {formatMoney(
                            booking.platformFee
                          )}
                        </td>

                        <td>
                          <b>
                            ₹
                            {formatMoney(
                              booking.totalAmount
                            )}
                          </b>
                        </td>

                        <td>
                          {readableStatus(
                            booking.paymentStatus
                          )}
                        </td>

                        <td>
                          {readableStatus(
                            booking.status
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
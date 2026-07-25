import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ExternalLink,
  LoaderCircle,
  ShieldCheck,
  X,
} from "lucide-react";

import AdminContentManager from "../components/AdminContentManager";
import API from "../api";
import "./Admin.css";

const initialStats = {
  users: 0,
  providers: 0,
  bookings: 0,
  sectors: 0,
  pendingProviders: 0,
};

function readableLabel(value = "") {
  return String(value)
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

export default function Admin() {
  const [stats, setStats] =
    useState(initialStats);

  const [providers, setProviders] =
    useState([]);

  const [kycs, setKycs] =
    useState([]);

  const [selected, setSelected] =
    useState(null);

  const [reason, setReason] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    detailsLoading,
    setDetailsLoading,
  ] = useState(false);

  const [
    reviewLoading,
    setReviewLoading,
  ] = useState(false);

  const load = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const [
          statsResult,
          providerResult,
          kycResult,
        ] = await Promise.allSettled([
          API.get("/admin/stats"),
          API.get("/admin/providers"),
          API.get("/kyc/admin"),
        ]);

        if (
          statsResult.status ===
          "fulfilled"
        ) {
          setStats(
            statsResult.value.data ||
              initialStats
          );
        } else {
          setStats(initialStats);
        }

        if (
          providerResult.status ===
          "fulfilled"
        ) {
          setProviders(
            Array.isArray(
              providerResult.value.data
            )
              ? providerResult.value.data
              : []
          );
        } else {
          setProviders([]);
        }

        if (
          kycResult.status ===
          "fulfilled"
        ) {
          setKycs(
            Array.isArray(
              kycResult.value.data
            )
              ? kycResult.value.data
              : []
          );
        } else {
          setKycs([]);
        }

        const failedResult = [
          statsResult,
          providerResult,
          kycResult,
        ].find(
          (result) =>
            result.status ===
            "rejected"
        );

        if (failedResult) {
          setError(
            failedResult.reason
              ?.response?.data
              ?.message ||
              "Some admin data could not be loaded"
          );
        }
      } catch (loadError) {
        console.error(
          "Admin load error:",
          loadError
        );

        setStats(initialStats);
        setProviders([]);
        setKycs([]);

        setError(
          loadError.response?.data
            ?.message ||
            "Unable to load admin data"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  const openKyc = async (id) => {
    try {
      setDetailsLoading(true);
      setError("");
      setMessage("");

      const { data } = await API.get(
        `/kyc/admin/${id}`
      );

      setSelected(data);

      setReason(
        data.rejectionReason || ""
      );
    } catch (openError) {
      console.error(
        "Open KYC error:",
        openError.response?.data ||
          openError
      );

      setSelected(null);

      setError(
        openError.response?.data
          ?.error ||
          openError.response?.data
            ?.message ||
          "Unable to open KYC details"
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    if (reviewLoading) {
      return;
    }

    setSelected(null);
    setReason("");
  };

  const review = async (action) => {
    if (!selected?._id) {
      setError(
        "Select a KYC record first"
      );
      return;
    }

    if (
      [
        "reject",
        "resubmission_required",
      ].includes(action) &&
      !reason.trim()
    ) {
      setError(
        "Reason is required for rejection or resubmission"
      );
      return;
    }

    try {
      setReviewLoading(true);
      setError("");
      setMessage("");

      const { data } = await API.patch(
        `/kyc/admin/${selected._id}/review`,
        {
          action,
          reason: reason.trim(),
        }
      );

      setMessage(
        data.message ||
          "KYC updated successfully"
      );

      setSelected(null);
      setReason("");

      await load();
    } catch (reviewError) {
      console.error(
        "KYC review error:",
        reviewError.response?.data ||
          reviewError
      );

      setError(
        reviewError.response?.data
          ?.error ||
          reviewError.response?.data
            ?.message ||
          "Review action failed"
      );
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <section className="section admin-page">
      <div className="container">
        <div className="page-banner">
          <span className="eyebrow">
            Control center
          </span>

          <h1>Admin Panel</h1>

          <p>
            Providers, bookings and secure
            KYC verification manage karein.
          </p>
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

        {loading && (
          <div className="admin-loading">
            <LoaderCircle
              className="spin"
              size={22}
            />

            <span>
              Admin data loading...
            </span>
          </div>
        )}

        <div className="dashboard-grid">
          {Object.entries(stats).map(
            ([key, value]) => (
              <div
                className="panel"
                key={key}
              >
                <h3>
                  {readableLabel(key)}
                </h3>

                <strong>
                  {Number(value) || 0}
                </strong>
              </div>
            )
          )}
        </div>

        <div className="panel">
          <h2>KYC Review Queue</h2>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Sector</th>
                  <th>Phone</th>
                  <th>Documents</th>
                  <th>Status</th>
                  <th>Review</th>
                </tr>
              </thead>

              <tbody>
                {kycs.map((item) => (
                  <tr key={item._id}>
                    <td>
                      {item.provider
                        ?.businessName ||
                        "Provider unavailable"}

                      <small>
                        {item.provider?.user
                          ?.name || ""}
                      </small>
                    </td>

                    <td>
                      {item.provider?.sector
                        ?.name || "—"}
                    </td>

                    <td>
                      {item.provider?.user
                        ?.phone || "—"}
                    </td>

                    <td>
                      {item.documents
                        ?.length || 0}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          item.status || ""
                        }`}
                      >
                        {readableLabel(
                          item.status ||
                            "draft"
                        )}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="btn small"
                        disabled={
                          detailsLoading
                        }
                        onClick={() =>
                          openKyc(item._id)
                        }
                      >
                        {detailsLoading
                          ? "Opening..."
                          : "Open KYC"}
                      </button>
                    </td>
                  </tr>
                ))}

                {!loading &&
                  !kycs.length && (
                    <tr>
                      <td colSpan="6">
                        No KYC records yet.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <h2>All Providers</h2>
<AdminContentManager />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Sector</th>
                  <th>Rating</th>
                  <th>Verification</th>
                </tr>
              </thead>

              <tbody>
                {providers.map(
                  (provider) => (
                    <tr key={provider._id}>
                      <td>
                        {provider.businessName ||
                          "Unnamed provider"}

                        <small>
                          {provider.user?.name ||
                            ""}
                        </small>
                      </td>

                      <td>
                        {provider.sector?.name ||
                          "—"}
                      </td>

                      <td>
                        {Number(
                          provider.averageRating
                        ).toFixed(1)}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            provider.verified
                              ? "approved"
                              : provider.verificationStatus ||
                                "not_submitted"
                          }`}
                        >
                          {provider.verified
                            ? "Verified"
                            : readableLabel(
                                provider.verificationStatus ||
                                  "not submitted"
                              )}
                        </span>
                      </td>
                    </tr>
                  )
                )}

                {!loading &&
                  !providers.length && (
                    <tr>
                      <td colSpan="4">
                        No providers found.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selected && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div
            className="kyc-modal"
            role="dialog"
            aria-modal="true"
            aria-label="KYC Review"
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close"
              disabled={reviewLoading}
              onClick={closeModal}
            >
              <X />
            </button>

            <h2>
              <ShieldCheck />
              KYC Review
            </h2>

            <p>
              <b>
                {selected.provider
                  ?.businessName ||
                  "Provider"}
              </b>

              {" — "}

              {selected.provider?.user
                ?.name || "Unknown user"}
            </p>

            <div className="document-grid">
              {(selected.documents || []).map(
                (document) =>
                  document.previewUrl ? (
                    <a
                      key={document._id}
                      className="document-card"
                      href={
                        document.previewUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span>
                        {readableLabel(
                          document.type
                        )}
                      </span>

                      <small>
                        {document.originalName ||
                          "KYC document"}
                      </small>

                      <ExternalLink
                        size={16}
                      />
                    </a>
                  ) : (
                    <div
                      key={document._id}
                      className="document-card unavailable"
                    >
                      <span>
                        {readableLabel(
                          document.type
                        )}
                      </span>

                      <small>
                        {document.previewError ||
                          "File unavailable"}
                      </small>
                    </div>
                  )
              )}

              {!selected.documents
                ?.length && (
                <p>
                  No documents attached.
                </p>
              )}
            </div>

            <p className="privacy-note">
              Preview links expire in{" "}
              {Math.round(
                (selected.previewExpiresIn ||
                  300) / 60
              )}{" "}
              minutes. Do not download or
              share documents unless legally
              necessary.
            </p>

            <label htmlFor="kycReason">
              Reason (required for reject or
              resubmission)
            </label>

            <textarea
              id="kycReason"
              rows="3"
              value={reason}
              disabled={reviewLoading}
              onChange={(event) =>
                setReason(
                  event.target.value
                )
              }
              placeholder="Enter reason..."
            />

            <div className="form-actions">
              <button
                type="button"
                className="btn ghost"
                disabled={reviewLoading}
                onClick={() =>
                  review("under_review")
                }
              >
                Mark Reviewing
              </button>

              <button
                type="button"
                className="btn primary"
                disabled={reviewLoading}
                onClick={() =>
                  review("approve")
                }
              >
                Approve & Verify
              </button>

              <button
                type="button"
                className="btn danger"
                disabled={reviewLoading}
                onClick={() =>
                  review(
                    "resubmission_required"
                  )
                }
              >
                Request Changes
              </button>

              <button
                type="button"
                className="btn danger"
                disabled={reviewLoading}
                onClick={() =>
                  review("reject")
                }
              >
                Reject
              </button>
            </div>

            {reviewLoading && (
              <div className="admin-loading">
                <LoaderCircle
                  className="spin"
                  size={20}
                />

                <span>
                  Updating KYC...
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
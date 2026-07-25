import {
  useEffect,
  useState,
} from "react";

import {
  BadgeCheck,
  FileCheck2,
  ShieldCheck,
  Upload,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import API from "../api";
import "./KycVerification.css";

const statusText = {
  draft:
    "Documents saved — submit pending",

  submitted:
    "Submitted for review",

  under_review:
    "Admin is reviewing",

  approved:
    "Verified Provider",

  rejected:
    "KYC rejected",

  resubmission_required:
    "Changes required",
};

export default function KycVerification() {
  const [data, setData] =
    useState(null);

  const [files, setFiles] =
    useState({});

  const [form, setForm] =
    useState({
      aadhaarLast4: "",
      panLast4: "",
      consentAccepted: false,
      declarationAccepted: false,
    });

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [pageLoading, setPageLoading] =
    useState(true);

  async function loadKycStatus() {
    setPageLoading(true);

    try {
      const response =
        await API.get("/kyc/me");

      setData(response.data);

      if (
        response.data?.message
      ) {
        setMessage(
          response.data.message
        );
      }
    } catch (error) {
      console.error(
        "KYC status error:",
        error.response?.data ||
          error.message
      );

      setMessage(
        error.response?.data
          ?.message ||
          "KYC status load failed"
      );
    } finally {
      setPageLoading(false);
    }
  }

  useEffect(() => {
    loadKycStatus();
  }, []);

  function chooseFile(
    name,
    file
  ) {
    setFiles((current) => ({
      ...current,
      [name]: file,
    }));
  }

  async function uploadDocuments(
    event
  ) {
    event.preventDefault();

    if (
      !form.consentAccepted ||
      !form.declarationAccepted
    ) {
      setMessage(
        "Consent and declaration accept karein."
      );

      return;
    }

    if (
      !files.aadhaarFront ||
      !files.selfie ||
      !files.businessPhoto
    ) {
      setMessage(
        "Aadhaar front, selfie and business photo required hain."
      );

      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const body =
        new FormData();

      Object.entries(
        files
      ).forEach(
        ([key, file]) => {
          if (file) {
            body.append(
              key,
              file
            );
          }
        }
      );

      Object.entries(
        form
      ).forEach(
        ([key, value]) => {
          body.append(
            key,
            String(value)
          );
        }
      );

      const response =
        await API.post(
          "/kyc/upload",
          body
        );

      setMessage(
        response.data.message
      );

      await loadKycStatus();
    } catch (error) {
      console.error(
        "KYC upload error:",
        error.response?.data ||
          error.message
      );

      setMessage(
        error.response?.data
          ?.message ||
          "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitForReview() {
    setLoading(true);
    setMessage("");

    try {
      const response =
        await API.post(
          "/kyc/submit"
        );

      setMessage(
        response.data.message
      );

      await loadKycStatus();
    } catch (error) {
      setMessage(
        error.response?.data
          ?.message ||
          "Submit failed"
      );
    } finally {
      setLoading(false);
    }
  }

  const kyc = data?.kyc;

  const profileRequired =
    data?.profileRequired;

  const locked = [
    "submitted",
    "under_review",
    "approved",
  ].includes(kyc?.status);

  return (
    <section className="section kyc-page">
      <div className="container kyc-layout">
        <div className="page-banner">
          <span className="eyebrow">
            Secure provider verification
          </span>

          <h1>KYC Verification</h1>

          <p>
            Documents private storage
            mein rahenge aur sirf
            authorised admin temporary
            preview link se review karega.
          </p>
        </div>

        {pageLoading && (
          <div className="info-message">
            Loading KYC status...
          </div>
        )}

        {message && (
          <div className="info-message">
            {message}
          </div>
        )}

        {profileRequired && (
          <div className="profile-required-card">
            <ShieldCheck size={32} />

            <div>
              <h2>
                Provider profile required
              </h2>

              <p>
                KYC verification se pehle
                business aur service
                profile complete karein.
              </p>

              <Link
                className="btn primary"
                to="/provider-onboarding"
              >
                Complete Provider Profile
              </Link>
            </div>
          </div>
        )}

        {kyc && (
          <div
            className={
              `kyc-status status-${kyc.status}`
            }
          >
            <ShieldCheck />

            <div>
              <strong>
                {statusText[
                  kyc.status
                ] || kyc.status}
              </strong>

              {kyc.rejectionReason && (
                <p>
                  Reason:{" "}
                  {
                    kyc.rejectionReason
                  }
                </p>
              )}
            </div>

            {kyc.status ===
              "approved" && (
              <BadgeCheck />
            )}
          </div>
        )}

        {!pageLoading &&
          !profileRequired && (
            <form
              className="panel-form"
              onSubmit={
                uploadDocuments
              }
            >
              <h2>
                Identity and business
                documents
              </h2>

              <p className="privacy-note">
                Full Aadhaar number mat
                likhein. Sirf last four
                digits optional hain.
                JPG, PNG, WEBP or PDF;
                maximum 5 MB per file.
              </p>

              <div className="form-grid file-grid">
                <FileInput
                  label="Aadhaar Front *"
                  name="aadhaarFront"
                  required
                  onChange={
                    chooseFile
                  }
                />

                <FileInput
                  label="Aadhaar Back"
                  name="aadhaarBack"
                  onChange={
                    chooseFile
                  }
                />

                <FileInput
                  label="PAN Card"
                  name="pan"
                  onChange={
                    chooseFile
                  }
                />

                <FileInput
                  label="Clear Selfie *"
                  name="selfie"
                  accept="image/*"
                  required
                  onChange={
                    chooseFile
                  }
                />

                <FileInput
                  label="Shop / Business Photo *"
                  name="businessPhoto"
                  accept="image/*"
                  required
                  onChange={
                    chooseFile
                  }
                />

                <FileInput
                  label="Sector Licence (if applicable)"
                  name="license"
                  onChange={
                    chooseFile
                  }
                />

                <div>
                  <label>
                    Aadhaar last 4 digits
                  </label>

                  <input
                    inputMode="numeric"
                    maxLength="4"
                    value={
                      form.aadhaarLast4
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,

                        aadhaarLast4:
                          event.target.value
                            .replace(
                              /\D/g,
                              ""
                            )
                            .slice(
                              0,
                              4
                            ),
                      })
                    }
                  />
                </div>

                <div>
                  <label>
                    PAN last 4 characters
                  </label>

                  <input
                    maxLength="4"
                    value={
                      form.panLast4
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,

                        panLast4:
                          event.target.value
                            .toUpperCase()
                            .slice(
                              0,
                              4
                            ),
                      })
                    }
                  />
                </div>
              </div>

              <label className="check-row">
                <input
                  type="checkbox"
                  checked={
                    form.consentAccepted
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,

                      consentAccepted:
                        event.target
                          .checked,
                    })
                  }
                />

                <span>
                  I consent to secure
                  collection and review of
                  these documents for
                  provider verification,
                  fraud prevention and
                  legal compliance.
                </span>
              </label>

              <label className="check-row">
                <input
                  type="checkbox"
                  checked={
                    form.declarationAccepted
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,

                      declarationAccepted:
                        event.target
                          .checked,
                    })
                  }
                />

                <span>
                  I declare that submitted
                  information is mine,
                  correct and valid.
                </span>
              </label>

              <div className="form-actions">
                <button
                  className="btn primary"
                  disabled={
                    loading ||
                    locked
                  }
                >
                  <Upload size={17} />

                  {loading
                    ? "Uploading..."
                    : "Save Documents"}
                </button>

                <button
                  type="button"
                  className="btn ghost"
                  disabled={
                    loading ||
                    locked ||
                    !kyc
                  }
                  onClick={
                    submitForReview
                  }
                >
                  <FileCheck2
                    size={17}
                  />

                  Submit for Review
                </button>
              </div>
            </form>
          )}
      </div>
    </section>
  );
}

function FileInput({
  label,
  name,
  required = false,

  accept =
    "image/jpeg,image/png,image/webp,application/pdf",

  onChange,
}) {
  return (
    <div>
      <label htmlFor={name}>
        {label}
      </label>

      <input
        id={name}
        type="file"
        accept={accept}
        required={required}
        onChange={(event) =>
          onChange(
            name,
            event.target.files?.[0]
          )
        }
      />
    </div>
  );
}
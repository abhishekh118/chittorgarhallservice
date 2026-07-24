import { useEffect, useState } from "react";
import { BadgeCheck, FileCheck2, ShieldCheck, Upload } from "lucide-react";
import API from "../api";

const statusText = {
  draft: "Documents saved — submit pending",
  submitted: "Submitted for review",
  under_review: "Admin is reviewing",
  approved: "Verified Provider",
  rejected: "KYC rejected",
  resubmission_required: "Changes required"
};

export default function KycVerification() {
  const [data, setData] = useState(null);
  const [files, setFiles] = useState({});
  const [form, setForm] = useState({ aadhaarLast4: "", panLast4: "", consentAccepted: false, declarationAccepted: false });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => API.get("/kyc/me").then((r) => setData(r.data)).catch((e) => setMessage(e.response?.data?.message || "KYC status load failed"));
  useEffect(() => { load(); }, []);

  const choose = (name, file) => setFiles((current) => ({ ...current, [name]: file }));
  const upload = async (event) => {
    event.preventDefault();
    setLoading(true); setMessage("");
    try {
      const body = new FormData();
      Object.entries(files).forEach(([key, file]) => file && body.append(key, file));
      Object.entries(form).forEach(([key, value]) => body.append(key, String(value)));
      const { data: response } = await API.post("/kyc/upload", body, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage(response.message); await load();
    } catch (error) { setMessage(error.response?.data?.message || "Upload failed"); }
    finally { setLoading(false); }
  };

  const submitReview = async () => {
    setLoading(true);
    try { const { data: response } = await API.post("/kyc/submit"); setMessage(response.message); await load(); }
    catch (error) { setMessage(error.response?.data?.message || "Submit failed"); }
    finally { setLoading(false); }
  };

  const kyc = data?.kyc;
  const locked = ["submitted", "under_review", "approved"].includes(kyc?.status);
  return (
    <section className="section"><div className="container kyc-layout">
      <div className="page-banner"><span className="eyebrow">Secure provider verification</span><h1>KYC Verification</h1><p>Documents private S3 storage me rahenge aur sirf authorised admin temporary preview link se review karega.</p></div>
      {message && <div className="info-message">{message}</div>}
      {kyc && <div className={`kyc-status status-${kyc.status}`}><ShieldCheck/><div><strong>{statusText[kyc.status] || kyc.status}</strong>{kyc.rejectionReason && <p>Reason: {kyc.rejectionReason}</p>}</div>{kyc.status === "approved" && <BadgeCheck/>}</div>}

      <form className="panel-form" onSubmit={upload}>
        <h2>Identity & business documents</h2>
        <p className="privacy-note">Full Aadhaar number mat likhein. Sirf last 4 digits optional hain. JPG/PNG/WEBP/PDF, maximum 5 MB per file.</p>
        <div className="form-grid file-grid">
          <FileInput label="Aadhaar Front *" name="aadhaarFront" onChange={choose}/>
          <FileInput label="Aadhaar Back" name="aadhaarBack" onChange={choose}/>
          <FileInput label="PAN Card" name="pan" onChange={choose}/>
          <FileInput label="Clear Selfie *" name="selfie" accept="image/*" onChange={choose}/>
          <FileInput label="Shop / Business Photo *" name="businessPhoto" accept="image/*" onChange={choose}/>
          <FileInput label="Sector Licence (if applicable)" name="license" onChange={choose}/>
          <div><label>Aadhaar last 4 digits</label><input inputMode="numeric" maxLength="4" value={form.aadhaarLast4} onChange={(e)=>setForm({...form,aadhaarLast4:e.target.value.replace(/\D/g,"")})}/></div>
          <div><label>PAN last 4 characters</label><input maxLength="4" value={form.panLast4} onChange={(e)=>setForm({...form,panLast4:e.target.value.toUpperCase()})}/></div>
        </div>
        <label className="check-row"><input type="checkbox" checked={form.consentAccepted} onChange={(e)=>setForm({...form,consentAccepted:e.target.checked})}/><span>I consent to collection and secure review of these documents only for provider verification, fraud prevention and legal compliance.</span></label>
        <label className="check-row"><input type="checkbox" checked={form.declarationAccepted} onChange={(e)=>setForm({...form,declarationAccepted:e.target.checked})}/><span>I declare that submitted information is mine, correct and valid. I am responsible for service-specific licences.</span></label>
        <div className="form-actions"><button className="btn primary" disabled={loading || locked}><Upload size={17}/>{loading ? "Uploading..." : "Save Documents"}</button><button type="button" className="btn ghost" disabled={loading || locked} onClick={submitReview}><FileCheck2 size={17}/>Submit for Review</button></div>
      </form>
    </div></section>
  );
}

function FileInput({ label, name, accept = "image/jpeg,image/png,image/webp,application/pdf", onChange }) {
  return <div><label>{label}</label><input type="file" accept={accept} onChange={(e)=>onChange(name,e.target.files?.[0])}/></div>;
}

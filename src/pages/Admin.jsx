import { useEffect, useState } from "react";
import { ExternalLink, ShieldCheck, X } from "lucide-react";
import API from "../api";

export default function Admin() {
  const [stats, setStats] = useState({});
  const [providers, setProviders] = useState([]);
  const [kycs, setKycs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const [statsRes, providerRes, kycRes] = await Promise.all([API.get("/admin/stats"), API.get("/admin/providers"), API.get("/kyc/admin")]);
    setStats(statsRes.data); setProviders(providerRes.data); setKycs(kycRes.data);
  };
  useEffect(() => { load().catch(console.error); }, []);

  const openKyc = async (id) => { const { data } = await API.get(`/kyc/admin/${id}`); setSelected(data); setReason(data.rejectionReason || ""); };
  const review = async (action) => {
    try { const { data } = await API.patch(`/kyc/admin/${selected._id}/review`, { action, reason }); setMessage(data.message); setSelected(null); setReason(""); await load(); }
    catch (error) { setMessage(error.response?.data?.message || "Review action failed"); }
  };

  return <section className="section admin-page"><div className="container">
    <div className="page-banner"><span className="eyebrow">Control center</span><h1>Admin Panel</h1><p>Providers, bookings and secure KYC verification manage karein.</p></div>
    {message && <div className="info-message">{message}</div>}
    <div className="dashboard-grid">{Object.entries(stats).map(([key,value])=><div className="panel" key={key}><h3>{key}</h3><strong>{value}</strong></div>)}</div>
    <div className="panel"><h2>KYC Review Queue</h2><div className="table-wrap"><table><thead><tr><th>Provider</th><th>Sector</th><th>Phone</th><th>Documents</th><th>Status</th><th>Review</th></tr></thead><tbody>
      {kycs.map((item)=><tr key={item._id}><td>{item.provider?.businessName}<small>{item.provider?.user?.name}</small></td><td>{item.provider?.sector?.name}</td><td>{item.provider?.user?.phone}</td><td>{item.documents?.length || 0}</td><td>{item.status}</td><td><button className="btn small" onClick={()=>openKyc(item._id)}>Open KYC</button></td></tr>)}
      {!kycs.length && <tr><td colSpan="6">No KYC records yet.</td></tr>}
    </tbody></table></div></div>
    <div className="panel"><h2>All Providers</h2><div className="table-wrap"><table><thead><tr><th>Provider</th><th>Sector</th><th>Rating</th><th>Verification</th></tr></thead><tbody>{providers.map((p)=><tr key={p._id}><td>{p.businessName}<small>{p.user?.name}</small></td><td>{p.sector?.name}</td><td>{p.averageRating}</td><td>{p.verified ? "Verified" : p.verificationStatus || "Not submitted"}</td></tr>)}</tbody></table></div></div>
  </div>
  {selected && <div className="modal-backdrop"><div className="kyc-modal"><button className="modal-close" onClick={()=>setSelected(null)}><X/></button><h2><ShieldCheck/> KYC Review</h2><p><b>{selected.provider?.businessName}</b> — {selected.provider?.user?.name}</p><div className="document-grid">{selected.documents.map((doc)=><a key={doc._id} className="document-card" href={doc.previewUrl} target="_blank" rel="noreferrer"><span>{doc.type.replaceAll("_"," ")}</span><small>{doc.originalName}</small><ExternalLink size={16}/></a>)}</div><p className="privacy-note">Preview links expire in {Math.round(selected.previewExpiresIn/60)} minutes. Do not download/share documents unless legally necessary.</p><label>Reason (required for reject/resubmission)</label><textarea rows="3" value={reason} onChange={(e)=>setReason(e.target.value)}/><div className="form-actions"><button className="btn ghost" onClick={()=>review("under_review")}>Mark Reviewing</button><button className="btn primary" onClick={()=>review("approve")}>Approve & Verify</button><button className="btn danger" onClick={()=>review("resubmission_required")}>Request Changes</button><button className="btn danger" onClick={()=>review("reject")}>Reject</button></div></div></div>}
  </section>;
}

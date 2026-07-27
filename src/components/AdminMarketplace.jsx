import { useCallback, useEffect, useState } from "react";
import API from "../api";

export default function AdminMarketplace() {
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");
  const load = useCallback(() => {
    API.get("/marketplace/admin/all")
      .then(({ data }) => setRows(Array.isArray(data) ? data : []))
      .catch((error) => setMessage(error.response?.data?.message || "Marketplace listings load nahi hui"));
  }, []);
  useEffect(() => void load(), [load]);

  async function review(id, action) {
    const reason =
      action === "reject" ? window.prompt("Rejection reason likhein:") : "";
    if (action === "reject" && !reason?.trim()) return;
    try {
      const { data } = await API.patch(`/marketplace/admin/${id}/review`, { action, reason });
      setMessage(data.message);
      load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Review failed");
    }
  }

  return (
    <div className="panel admin-marketplace">
      <h2>Marketplace Approval</h2>
      {message && <div className="info-message">{message}</div>}
      <div className="admin-market-list">
        {rows.map((item) => (
          <article key={item._id}>
            {item.media?.[0]?.type === "image" ? <img src={item.media[0].url} alt="" /> : <video src={item.media?.[0]?.url} />}
            <div>
              <strong>{item.title}</strong>
              <span>{item.listingType.replace("_", " ")} · ₹{Number(item.price).toLocaleString("en-IN")}</span>
              <small>{item.owner?.name} · {item.owner?.phone} · {item.location?.area}</small>
            </div>
            <b className={`status ${item.status}`}>{item.status}</b>
            {item.status === "pending" && (
              <div className="admin-market-actions">
                <button className="btn primary" onClick={() => review(item._id, "approve")}>Approve</button>
                <button className="btn danger" onClick={() => review(item._id, "reject")}>Reject</button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

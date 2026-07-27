import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

export default function NearbyMarketplace() {
  const [type, setType] = useState("second_hand");
  const [location, setLocation] = useState("");
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");

  async function search(event) {
    event.preventDefault();
    if (location.trim().length < 2) return setMessage("Area, city ya pincode likhein.");
    try {
      const { data } = await API.get("/marketplace", {
        params: { type, location: location.trim(), limit: 12 },
      });
      setRows(Array.isArray(data) ? data : []);
      setMessage(data.length ? `${data.length} approved listings mili` : "Koi approved listing nahi mili");
    } catch (error) {
      setMessage(error.response?.data?.message || "Search nahi ho paayi");
    }
  }

  return (
    <section className="nearby-marketplace">
      <div className="section-heading">
        <span className="eyebrow">Products & property nearby</span>
        <h2>Area se marketplace search karein</h2>
      </div>
      <form className="nearby-market-form" onSubmit={search}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="second_hand">Second-hand items</option>
          <option value="room">Rooms</option>
          <option value="house">Houses</option>
        </select>
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Area, city, district or pincode" />
        <button className="btn primary">Search</button>
      </form>
      {message && <p className="info-message">{message}</p>}
      {!!rows.length && (
        <div className="nearby-market-results">
          {rows.slice(0, 6).map((item) => (
            <Link to={`/marketplace?type=${item.listingType}&location=${encodeURIComponent(location)}`} key={item._id}>
              <img src={item.media?.find((media) => media.type === "image")?.url} alt="" />
              <div><strong>{item.title}</strong><span>₹{Number(item.price).toLocaleString("en-IN")}</span></div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

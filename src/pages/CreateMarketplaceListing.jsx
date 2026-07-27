import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import "./Marketplace.css";

const initialForm = {
  listingType: "second_hand",
  transactionType: "sale",
  title: "",
  category: "",
  description: "",
  price: "",
  priceUnit: "fixed",
  condition: "good",
  area: "",
  city: "Chittorgarh",
  district: "Chittorgarh",
  pincode: "",
  address: "",
  bedrooms: "",
  bathrooms: "",
  furnishing: "",
  carpetArea: "",
  preferredTenant: "",
  deposit: "",
};

export default function CreateMarketplaceListing() {
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const isProperty = form.listingType === "room" || form.listingType === "house";

  async function submit(event) {
    event.preventDefault();
    if (!files.length) return setMessage("Kam-se-kam ek image ya video select karein.");
    if (files.length > 12) return setMessage("Maximum 12 images/videos upload kar sakte hain.");

    const body = new FormData();
    Object.entries({
      listingType: form.listingType,
      transactionType: form.transactionType,
      title: form.title,
      category: form.category,
      description: form.description,
      price: form.price,
      priceUnit: form.priceUnit,
      condition: form.condition,
    }).forEach(([key, value]) => body.append(key, value));

    body.append(
      "location",
      JSON.stringify({
        address: form.address,
        area: form.area,
        city: form.city,
        district: form.district,
        pincode: form.pincode,
      })
    );
    body.append(
      "property",
      JSON.stringify({
        propertyType: form.listingType,
        bedrooms: Number(form.bedrooms || 0),
        bathrooms: Number(form.bathrooms || 0),
        furnishing: form.furnishing,
        carpetArea: Number(form.carpetArea || 0),
        preferredTenant: form.preferredTenant,
        deposit: Number(form.deposit || 0),
      })
    );
    files.forEach((file) => body.append("media", file));

    try {
      setSaving(true);
      const { data } = await API.post("/marketplace", body);
      setMessage(data.message);
      setForm(initialForm);
      setFiles([]);
      event.target.reset();
    } catch (error) {
      setMessage(error.response?.data?.message || "Listing submit nahi ho paayi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="section marketplace-page">
      <div className="container">
        <form className="panel-form listing-form" onSubmit={submit}>
          <span className="eyebrow">KYC-verified business account</span>
          <h1>Add Marketplace Listing</h1>
          <p>
            Listing admin approval ke baad public hogi. KYC pending hai?{" "}
            <Link to="/provider-kyc">Complete KYC</Link>
          </p>
          {message && <div className="info-message">{message}</div>}

          <div className="form-grid">
            <div>
              <label>Listing section</label>
              <select value={form.listingType} onChange={(e) => change("listingType", e.target.value)}>
                <option value="second_hand">Second-hand item</option>
                <option value="room">Room on rent</option>
                <option value="house">House / property</option>
              </select>
            </div>
            <div>
              <label>Offer type</label>
              <select value={form.transactionType} onChange={(e) => change("transactionType", e.target.value)}>
                <option value="sale">For sale</option>
                <option value="rent">For rent</option>
              </select>
            </div>
            <div className="span-2">
              <label>Title / name</label>
              <input required value={form.title} onChange={(e) => change("title", e.target.value)} />
            </div>
            <div>
              <label>Category</label>
              <input required value={form.category} placeholder="Furniture, mobile, 1 BHK..." onChange={(e) => change("category", e.target.value)} />
            </div>
            <div>
              <label>Price ₹</label>
              <input required min="0" type="number" value={form.price} onChange={(e) => change("price", e.target.value)} />
            </div>
            <div>
              <label>Price type</label>
              <select value={form.priceUnit} onChange={(e) => change("priceUnit", e.target.value)}>
                <option value="fixed">Fixed</option>
                <option value="negotiable">Negotiable</option>
                <option value="per_month">Per month</option>
                <option value="per_day">Per day</option>
              </select>
            </div>
            {!isProperty && (
              <div>
                <label>Condition</label>
                <select value={form.condition} onChange={(e) => change("condition", e.target.value)}>
                  <option value="like_new">Like new</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>
            )}
            {isProperty && (
              <>
                <div><label>Bedrooms</label><input type="number" min="0" value={form.bedrooms} onChange={(e) => change("bedrooms", e.target.value)} /></div>
                <div><label>Bathrooms</label><input type="number" min="0" value={form.bathrooms} onChange={(e) => change("bathrooms", e.target.value)} /></div>
                <div><label>Furnishing</label><select value={form.furnishing} onChange={(e) => change("furnishing", e.target.value)}><option value="">Select</option><option value="unfurnished">Unfurnished</option><option value="semi_furnished">Semi furnished</option><option value="furnished">Furnished</option></select></div>
                <div><label>Area (sq. ft.)</label><input type="number" min="0" value={form.carpetArea} onChange={(e) => change("carpetArea", e.target.value)} /></div>
                <div><label>Deposit ₹</label><input type="number" min="0" value={form.deposit} onChange={(e) => change("deposit", e.target.value)} /></div>
                <div><label>Preferred tenant</label><input value={form.preferredTenant} onChange={(e) => change("preferredTenant", e.target.value)} /></div>
              </>
            )}
            <div><label>Area</label><input required value={form.area} onChange={(e) => change("area", e.target.value)} /></div>
            <div><label>City</label><input required value={form.city} onChange={(e) => change("city", e.target.value)} /></div>
            <div><label>District</label><input value={form.district} onChange={(e) => change("district", e.target.value)} /></div>
            <div><label>Pincode</label><input value={form.pincode} maxLength="6" onChange={(e) => change("pincode", e.target.value)} /></div>
            <div className="span-2"><label>Full address / location</label><input value={form.address} onChange={(e) => change("address", e.target.value)} /></div>
            <div className="span-2"><label>Product/property description</label><textarea required rows="5" value={form.description} onChange={(e) => change("description", e.target.value)} /></div>
            <div className="span-2">
              <label>Images and videos (maximum 12; each maximum 50 MB)</label>
              <input required multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" type="file" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
              <small>{files.length} file(s) selected</small>
            </div>
          </div>
          <button disabled={saving} className="btn primary full">
            {saving ? "Uploading..." : "Submit for Admin Approval"}
          </button>
        </form>
      </div>
    </section>
  );
}

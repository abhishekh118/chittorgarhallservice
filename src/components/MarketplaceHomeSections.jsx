import { useEffect, useState } from "react";
import { ArrowRight, Home, PackageSearch, BedDouble } from "lucide-react";
import { Link } from "react-router-dom";
import API from "../api";

const sections = [
  { type: "second_hand", title: "Second-hand Deals", text: "Verified local sellers se useful products kharidein.", icon: PackageSearch },
  { type: "room", title: "Rooms on Rent", text: "Area aur budget ke hisaab se verified rooms dekhein.", icon: BedDouble },
  { type: "house", title: "Houses & Property", text: "Ghar rent par lein ya sale listings explore karein.", icon: Home },
];

export default function MarketplaceHomeSections() {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    Promise.all(
      sections.map(async ({ type }) => {
        const { data } = await API.get("/marketplace", { params: { type, limit: 6 } });
        return [type, Array.isArray(data) ? data.length : 0];
      })
    )
      .then((rows) => setCounts(Object.fromEntries(rows)))
      .catch(() => setCounts({}));
  }, []);

  return (
    <section className="section home-marketplace">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Local marketplace & property</span>
          <h2>Buy, rent and discover nearby</h2>
        </div>
        <div className="home-market-grid">
          {sections.map(({ type, title, text, icon: Icon }) => (
            <Link className="home-market-card" to={`/marketplace?type=${type}`} key={type}>
              <Icon size={28} />
              <div><h3>{title}</h3><p>{text}</p></div>
              <span>{counts[type] || 0} latest <ArrowRight size={17} /></span>
            </Link>
          ))}
        </div>
        <div className="home-market-business">
          <div>
            <strong>Verified business account hai?</strong>
            <p>Second-hand product, room ya house listing admin approval ke liye submit karein.</p>
          </div>
          <Link className="btn primary" to="/provider/marketplace/new">Add Listing</Link>
        </div>
      </div>
    </section>
  );
}

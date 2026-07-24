import { useEffect, useState } from "react";
import API from "../api";

export default function CityGuide() {
  const [places, setPlaces] = useState([]);
  useEffect(() => { API.get("/public/places").then((res) => setPlaces(res.data)); }, []);

  return (
    <section className="section">
      <div className="container">
        <div className="page-banner"><span className="eyebrow">Explore the city</span><h1>Chittorgarh City Guide</h1><p>Famous places, local information, transport, hotels, food and useful city resources.</p></div>
        <div className="place-grid">
          {places.map((place) => (
            <article className="place-card" key={place._id}>
              <div className="place-image">{place.image ? <img src={place.image} alt={place.name} /> : <span>{place.name.slice(0, 1)}</span>}</div>
              <div><span className="eyebrow">{place.category}</span><h3>{place.name}</h3><p>{place.shortDescription}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

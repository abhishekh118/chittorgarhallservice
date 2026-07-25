import { Link } from "react-router-dom";
import { MapPin, Phone, MessageCircle, Mail } from "lucide-react";
import "./Footer.css";

export default function Footer() {
  const phone = import.meta.env.VITE_CALL_NUMBER || "6367697913";
  const whatsapp = import.meta.env.VITE_WHATSAPP_NUMBER || "916367697913";

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h3>Chittorgarh All Services</h3>
          <p>Trusted local workers, businesses, emergency help, bookings and city information in one platform.</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <Link to="/">All Sectors</Link>
          <Link to="/important-help">Nearby Important Help</Link>
          <Link to="/provider-onboarding">Join as Service Provider</Link>
          <Link to="/kyc-policy">KYC Policy</Link>
          <Link to="/city-guide">Explore Chittorgarh</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <a href={`tel:${phone}`}><Phone size={16} /> {phone}</a>
          <a href={`https://wa.me/${whatsapp}`} target="_blank"><MessageCircle size={16} /> WhatsApp</a>
          <span><MapPin size={16} /> Chittorgarh, Rajasthan</span>
          <span><Mail size={16} /> support@yourdomain.com</span>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} Chittorgarh All Services</div>
    </footer>
  );
}

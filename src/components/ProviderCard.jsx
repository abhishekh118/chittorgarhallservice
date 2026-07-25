import { MapPin, Phone, Star, BadgeCheck, CreditCard } from "lucide-react";
import { useState } from "react";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { loadRazorpayCheckout } from "../utils/razorpay";
import "./ProviderCard.css";

export default function ProviderCard({ provider }) {
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const account = provider.user || {};
  const firstService = provider.services?.[0];

  const payAndBook = async () => {
    if (!user) return navigate("/login");

    const loaded = await loadRazorpayCheckout();
    if (!loaded) {
      alert("Payment window load nahi hua. Internet connection check karein.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post("/bookings/create-order", {
        provider: provider._id,
        serviceName: firstService?.name || "General Service",
        bookingDate: new Date().toISOString(),
        quantity: 1,
        location: {
          address: user.location?.address || "Customer will share location on WhatsApp"
        }
      });

      setPrice(data.breakdown);

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Chittorgarh All Services",
        description: `${data.provider.sector} - ${firstService?.name || "Service Booking"}`,
        order_id: data.orderId,
        prefill: {
          name: data.customer.name,
          email: data.customer.email,
          contact: data.customer.phone
        },
        notes: {
          bookingId: data.bookingId
        },
        theme: {
          color: "#0b6b53"
        },
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await API.post("/bookings/verify-payment", {
              bookingId: data.bookingId,
              ...paymentResponse
            });

            alert("Payment successful. Booking confirmed.");
            if (verifyResponse.data.whatsappUrl) {
              window.open(verifyResponse.data.whatsappUrl, "_blank");
            }
          } catch (error) {
            alert(error.response?.data?.message || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => setLoading(false)
        }
      };

      const checkout = new window.Razorpay(options);
      checkout.on("payment.failed", (response) => {
        alert(response.error?.description || "Payment failed");
        setLoading(false);
      });
      checkout.open();
    } catch (error) {
      alert(error.response?.data?.message || "Payment order create nahi hua");
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="provider-card">
      <div className="provider-top">
        <div className="avatar">{account.name?.slice(0, 1) || "S"}</div>
        <div>
          <h3>{provider.businessName}</h3>
          <p>{account.name} {provider.verified && <BadgeCheck size={16} />}</p>
        </div>
      </div>

      <p className="provider-description">
        {provider.description || "Local service provider in Chittorgarh."}
      </p>

      <div className="provider-meta">
        <span><Star size={16} /> {provider.averageRating || 0} ({provider.reviewCount || 0})</span>
        <span><MapPin size={16} /> {provider.location?.area || "Chittorgarh"}</span>
      </div>

      {firstService && (
        <div className="price-preview">
          <strong>{firstService.name}</strong>
          <span>₹{firstService.price} + GST + ₹{firstService.deliveryCharge || 0} delivery + ₹20 fee</span>
        </div>
      )}

      {price && (
        <div className="payment-breakdown">
          <div><span>Service price</span><b>₹{price.baseAmount}</b></div>
          <div><span>GST ({price.gstRate}%)</span><b>₹{price.gstAmount}</b></div>
          <div><span>Delivery / visit</span><b>₹{price.deliveryCharge}</b></div>
          <div><span>Platform fee</span><b>₹{price.platformFee}</b></div>
          <div className="total"><span>Total</span><b>₹{price.totalAmount}</b></div>
        </div>
      )}

      <div className="skills">
        {provider.skills?.slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}
      </div>

      <div className="card-actions">
        <a className="btn ghost" href={`tel:${account.phone}`}>
          <Phone size={17} /> Call
        </a>
        <button className="btn primary" onClick={payAndBook} disabled={loading}>
          <CreditCard size={17} />
          {loading ? "Opening..." : "Pay & Book"}
        </button>
      </div>
    </article>
  );
}

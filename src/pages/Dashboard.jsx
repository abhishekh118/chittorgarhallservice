import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    API.get("/bookings/mine")
      .then((res) => setBookings(res.data?.length ? res.data : demoData.bookings))
      .catch(() => setBookings(demoData.bookings));
    if (user?.role === "provider") {
      API.get("/providers/me").then((res) => setProvider(res.data));
    }
  }, [user]);

  return (
    <section className="section dashboard-page">
      <div className="container">
        <div className="page-banner">
          <span className="eyebrow">My account</span>
          <h1>Hello, {user?.name}</h1>
          <p>Your bookings, orders, profile and service activity are saved here.</p>
        </div>

        {user?.role === "provider" && !provider && (
          <div className="info-message">Provider profile incomplete. <Link to="/provider-onboarding">Complete now</Link></div>
        )}

        <div className="dashboard-grid">
          <div className="panel">
            <h3>Account Type</h3>
            <strong>{user?.role}</strong>
          </div>
          <div className="panel">
            <h3>Total Bookings</h3>
            <strong>{bookings.length}</strong>
          </div>
          <div className="panel">
            <h3>Provider Status</h3>
            <strong>{provider ? (provider.verified ? "Verified" : "Pending") : "Not applicable"}</strong>
          </div>
        </div>

        <div className="panel">
          <h2>Booking History</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Sector</th><th>Provider</th><th>Service</th><th>Base</th><th>GST</th><th>Delivery</th><th>Fee</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.sector?.name}</td>
                    <td>{booking.provider?.businessName}</td>
                    <td>{booking.serviceName}</td>
                    <td>₹{booking.baseAmount}</td>
                    <td>₹{booking.gstAmount}</td>
                    <td>₹{booking.deliveryCharge}</td>
                    <td>₹{booking.platformFee}</td>
                    <td><b>₹{booking.totalAmount}</b></td>
                    <td>{booking.paymentStatus}</td>
                    <td>{booking.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

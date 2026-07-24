import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import SectorPage from "./pages/SectorPage";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerRegister from "./pages/CustomerRegister";
import ProviderLogin from "./pages/ProviderLogin";
import ProviderRegister from "./pages/ProviderRegister";
import ProviderOnboarding from "./pages/ProviderOnboarding";
import NearbyHelp from "./pages/NearbyHelp";
import Groups from "./pages/Groups";
import CityGuide from "./pages/CityGuide";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import KycVerification from "./pages/KycVerification";
import KycPolicy from "./pages/KycPolicy";
import { useAuth } from "./context/AuthContext";

function Protected({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={role === "provider" ? "/provider/login" : "/customer/login"} replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return <div className="app-shell"><Navbar /><main><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/sector/:slug" element={<SectorPage />} />
    <Route path="/important-help" element={<NearbyHelp />} />
    <Route path="/city-guide" element={<CityGuide />} />
    <Route path="/kyc-policy" element={<KycPolicy />} />
    <Route path="/customer/login" element={<CustomerLogin />} />
    <Route path="/customer/register" element={<CustomerRegister />} />
    <Route path="/provider/login" element={<ProviderLogin />} />
    <Route path="/provider/register" element={<ProviderRegister />} />
    <Route path="/login" element={<Navigate to="/customer/login" replace />} />
    <Route path="/register" element={<Navigate to="/customer/register" replace />} />
    <Route path="/provider-onboarding" element={<Protected role="provider"><ProviderOnboarding /></Protected>} />
    <Route path="/provider-kyc" element={<Protected role="provider"><KycVerification /></Protected>} />
    <Route path="/groups" element={<Protected><Groups /></Protected>} />
    <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
    <Route path="/admin" element={<Protected role="admin"><Admin /></Protected>} />
  </Routes></main><Footer /></div>;
}

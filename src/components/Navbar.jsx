import { Link, NavLink } from "react-router-dom";
import { BriefcaseBusiness, ChevronDown, Menu, Phone, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { user, logout } = useAuth();
  const callNumber = import.meta.env.VITE_CALL_NUMBER || "6367697913";
  const close = () => { setOpen(false); setAccountOpen(false); };

  return <>
    <div className="top-strip"><div className="container top-strip-inner"><span>Chittorgarh ka apna local services platform</span><a href={`tel:${callNumber}`}><Phone size={14}/> Help: {callNumber}</a></div></div>
    <header className="navbar"><div className="container nav-inner">
      <Link className="brand" to="/" onClick={close}><span className="brand-cloud">C</span><span><strong>Chittorgarh</strong><small>All Services</small></span></Link>
      <button className="menu-btn" onClick={() => setOpen(v=>!v)}>{open?<X/>:<Menu/>}</button>
      <nav className={open?"nav-links open":"nav-links"}>
        <NavLink to="/" onClick={close}>Home</NavLink><NavLink to="/important-help" onClick={close}>Nearby Help</NavLink><NavLink to="/city-guide" onClick={close}>City Guide</NavLink>
        {user && <NavLink to="/dashboard" onClick={close}>Dashboard</NavLink>}
        {user?.role==="provider" && <NavLink to="/provider-kyc" onClick={close}>KYC</NavLink>}
        {user?.role==="admin" && <NavLink to="/admin" onClick={close}>Admin</NavLink>}
        {!user ? <div className="account-menu"><button onClick={()=>setAccountOpen(v=>!v)}><UserRound size={17}/> Login <ChevronDown size={15}/></button>{accountOpen&&<div className="account-popover"><Link to="/customer/login" onClick={close}><UserRound/> Customer Login</Link><Link to="/provider/login" onClick={close}><BriefcaseBusiness/> Provider Login</Link></div>}</div> : <button className="logout-btn" onClick={()=>{logout();close();}}>Logout</button>}
        {!user && <Link className="provider-nav-cta" to="/provider/register" onClick={close}><BriefcaseBusiness size={17}/> List Your Business</Link>}
      </nav>
    </div></header>
  </>;
}

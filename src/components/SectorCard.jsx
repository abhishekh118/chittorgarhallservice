import { ArrowUpRight } from "lucide-react"; import { Link } from "react-router-dom";
import "./SectorCard.css";
const icons={plumber:'🔧',electrician:'💡',taxi:'🚕',hotel:'🏨',cafe:'☕',doctor:'🩺',mechanic:'🛠️',tutor:'📚',cleaning:'🧹'};
export default function SectorCard({sector}){return <Link className="sector-card" to={`/sector/${sector.slug}`}><div className="sector-icon">{icons[sector.slug]||sector.icon||'✨'}</div><div><h3>{sector.name}</h3><p>{sector.description||`Trusted ${sector.name.toLowerCase()} services near you.`}</p></div><span className="sector-arrow"><ArrowUpRight/></span></Link>}

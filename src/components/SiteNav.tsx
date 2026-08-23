import { Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import advisorsLogo from "@/assets/advisorsclub-logo.png";

type Props = {
  discoverSearch?: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
  };
};

export function SiteNav({ discoverSearch }: Props) {
  return (
    <nav className="site-nav">
      <div className={`sn-left${discoverSearch ? " sn-left-grow" : ""}`}>
        <Link
          to="/"
          className="nav-logo"
          aria-label="AdvisorsClub — Home"
          onClick={() => {
            if (typeof window !== "undefined" && window.location.pathname === "/") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          <img src={advisorsLogo} alt="AdvisorsClub" className="logo-img" />
        </Link>
        <span className="sn-sep" />
        <Link to="/discover" className="sn-link">Discover</Link>
        {discoverSearch && (
          <div className="sn-search">
            <Search size={15} />
            <input
              value={discoverSearch.value}
              onChange={(e) => discoverSearch.onChange(e.target.value)}
              placeholder={discoverSearch.placeholder ?? "Search clubs, topics, advisors..."}
              aria-label="Search Clubs"
            />
          </div>
        )}
      </div>
      <div className="sn-right">
        <Link to="/login" className="sn-link">Login</Link>
        <Link to="/signup" className="nav-btn sn-cta">
          Start For Free
          <ArrowRight size={14} strokeWidth={3} />
        </Link>
      </div>
    </nav>
  );
}

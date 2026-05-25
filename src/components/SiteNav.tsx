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
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: discoverSearch ? 1 : "0 0 auto" }}>
          <Link
            to="/landing"
            className="nav-logo"
            aria-label="AdvisorsClub — Home"
            onClick={() => {
              if (typeof window !== "undefined" && window.location.pathname === "/landing") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <img src={advisorsLogo} alt="AdvisorsClub" className="logo-img" style={{ height: 28 }} />
          </Link>
          <span style={{ width: 1, height: 22, background: "rgba(255,255,255,0.2)" }} />
          <Link
            to="/discover"
            style={{ color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none" }}
          >
            Discover
          </Link>
          {discoverSearch && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginLeft: 16,
                padding: "8px 14px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                flex: 1,
                maxWidth: 420,
              }}
            >
              <Search size={15} color="rgba(255,255,255,0.6)" />
              <input
                value={discoverSearch.value}
                onChange={(e) => discoverSearch.onChange(e.target.value)}
                placeholder={discoverSearch.placeholder ?? "Search clubs, topics, advisors..."}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: 14,
                  fontFamily: "inherit",
                }}
              />
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link to="/login" style={{ color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
            Login
          </Link>
          <Link to="/signup" className="nav-btn">
            Start For Free
            <ArrowRight size={14} strokeWidth={3} style={{ display: "inline", verticalAlign: "-2px", marginLeft: 4 }} />
          </Link>
        </div>
      </nav>
  );
}

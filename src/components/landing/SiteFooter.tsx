import { Link } from "@tanstack/react-router";
import advisorsLogo from "@/assets/advisorsclub-logo.png";

export function SiteFooter() {
  const Logo = () => (
    <Link to="/" className="nav-logo" aria-label="AdvisorsClub">
      <img src={advisorsLogo} alt="AdvisorsClub" className="logo-img" />
    </Link>
  );
  return (
      <footer>
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="fg-brand">
              <Logo />
              <p>The all-in-one Club platform for Advisors who want to teach, coach, and get paid.</p>
            </div>
            <div className="fg-col"><h4>Platform</h4><a href="#">Features</a><a href="#">Pricing</a><a href="#">AIVA</a><a href="#">Roadmap</a></div>
            <div className="fg-col"><h4>Compare</h4><a href="#">Vs Circle</a><a href="#">Vs Skool</a><a href="#">Vs Kajabi</a><a href="#">Vs Teachable</a></div>
            <div className="fg-col"><h4>Resources</h4><a href="#">Help Center</a><a href="#">Blog</a><a href="#">Affiliates</a><a href="#">Migrate</a></div>
            <div className="fg-col"><h4>Company</h4><a href="#">About</a><a href="#">Careers</a><a href="#">Privacy</a><a href="#">Terms</a></div>
          </div>
          <div className="footer-btm">
            <span>© {new Date().getFullYear()} AdvisorsClub. All Rights Reserved.</span>
            <span>Powered By: <strong style={{ color: "var(--ac-amber)" }}>Real Advisors, Inc.</strong></span>
          </div>
        </div>
      </footer>
  );
}

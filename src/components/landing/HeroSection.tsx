import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";

const COVERS = [coverWealth, coverRealEstate, coverSales, coverMindset, coverMarketing, coverCrypto, coverFitness, coverSpeaking, coverStartup, coverAI, coverBrand, coverInvesting];
const HERO_TILES: string[] = Array.from({ length: 28 }, (_, i) => COVERS[i % COVERS.length]);

const QUICK_STARTS = [
  "Build A Community",
  "Launch A Course",
  "Create A Coaching Program",
  "Grow My Existing Business",
  "Run A Challenge",
];
import coverWealth from "@/assets/covers/wealth.jpg";
import coverRealEstate from "@/assets/covers/realestate.jpg";
import coverSales from "@/assets/covers/sales.jpg";
import coverMindset from "@/assets/covers/mindset.jpg";
import coverMarketing from "@/assets/covers/marketing.jpg";
import coverCrypto from "@/assets/covers/crypto.jpg";
import coverFitness from "@/assets/covers/fitness.jpg";
import coverSpeaking from "@/assets/covers/speaking.jpg";
import coverStartup from "@/assets/covers/startup.jpg";
import coverAI from "@/assets/covers/ai.jpg";
import coverBrand from "@/assets/covers/brand.jpg";
import coverInvesting from "@/assets/covers/investing.jpg";

export function HeroSection() {
  const nav = useNavigate();
  const [heroPrompt, setHeroPrompt] = useState("");
  const startBuilding = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && heroPrompt.trim()) {
      window.sessionStorage.setItem("aiva-hero-prompt", heroPrompt.trim());
    }
    nav({ to: "/signup", search: {} });
  };
  return (
      <section className="hero">
        <div className="hero-mosaic" aria-hidden="true">
          {HERO_TILES.map((src, i) => (
            <div className="hm-tile" key={i} style={{ backgroundImage: `url(${src})` }} />
          ))}
        </div>
        <div className="hero-overlay" />

        <div className="hero-content">
          <h1><span style={{whiteSpace:"nowrap", color:"white"}}>AI Builds Your Community.</span><br /><span className="gold" style={{whiteSpace:"nowrap"}}>Automates Your Business.</span></h1>
          <p className="hero-sub">
            Launch memberships, sell courses, run coaching programs, and grow your business with your built-in <span className="gold">AI Business Operator</span>.
          </p>

          <form className="hero-aiva" onSubmit={startBuilding}>
            <div className="hero-aiva-hd">
              <span className="hero-aiva-icon"><Sparkles size={16} strokeWidth={2.4} /></span>
              <h2>What Do You Want To Build?</h2>
            </div>
            <div className="hero-aiva-input-wrap">
              <textarea
                className="hero-aiva-input"
                value={heroPrompt}
                onChange={e => setHeroPrompt(e.target.value)}
                placeholder="Tell us about your business, audience, expertise, or idea..."
                rows={3}
              />
              <button
                type="submit"
                className="hero-aiva-cta"
                disabled={!heroPrompt.trim()}
                style={{ opacity: heroPrompt.trim() ? 1 : 0.45, transition: "opacity .2s ease" }}
              >
                Build It With AI <ArrowRight size={14} strokeWidth={3} />
              </button>
            </div>
            <div className="hero-aiva-foot">
              <div className="hero-chips">
                {QUICK_STARTS.map(q => (
                  <button type="button" key={q} className="hero-chip" onClick={() => setHeroPrompt(q)}>{q}</button>
                ))}
              </div>
            </div>
          </form>

          <p className="hero-fine">No Credit Card Required · Free Forever On Starter · Setup In 5 Minutes</p>
        </div>
      </section>
  );
}

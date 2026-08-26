import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { examplesFor, HERO_QUICK_STARTS, ROTATING_PROMPTS, type HeroCategory } from "./hero-examples";

const COVERS = [coverWealth, coverRealEstate, coverSales, coverMindset, coverMarketing, coverCrypto, coverFitness, coverSpeaking, coverStartup, coverAI, coverBrand, coverInvesting];
const HERO_TILES: string[] = Array.from({ length: 28 }, (_, i) => COVERS[i % COVERS.length]);

/** Shown the moment a visitor takes the box over, so it is never left blank. */
const STATIC_PLACEHOLDER = "Tell us about your business, audience, expertise, or idea...";

/** Typewriter pacing, matching the live site. */
const TYPE_SPEED = 26;   // ms per character while typing
const HOLD_MS = 2600;    // pause on a finished sentence
const ERASE_SPEED = 12;  // ms per character while erasing

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

/**
 * Types the rotating examples into the placeholder, then erases and moves on.
 *
 * It drives the PLACEHOLDER, never the value, which is what makes "your own
 * words are never overwritten" structural rather than a promise. It stops the
 * moment the visitor engages — someone reading a moving sentence while trying
 * to type is being fought by the page — and `prefers-reduced-motion` rests on
 * one complete sentence instead of animating.
 */
function useTypedPlaceholder(active: boolean): string {
  const [text, setText] = useState(ROTATING_PROMPTS[0]);
  const [stillMotion, setStillMotion] = useState(false);
  const at = useRef(0);

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    const sync = () => setStillMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!active || stillMotion) return;
    let timer: ReturnType<typeof setTimeout>;
    let char = 0;
    let erasing = false;
    setText("");

    const tick = () => {
      const full = ROTATING_PROMPTS[at.current % ROTATING_PROMPTS.length];
      if (!erasing) {
        char += 1;
        setText(full.slice(0, char));
        if (char >= full.length) { erasing = true; timer = setTimeout(tick, HOLD_MS); return; }
        timer = setTimeout(tick, TYPE_SPEED);
      } else {
        char -= 1;
        setText(full.slice(0, char));
        if (char <= 0) { erasing = false; at.current += 1; timer = setTimeout(tick, 320); return; }
        timer = setTimeout(tick, ERASE_SPEED);
      }
    };

    timer = setTimeout(tick, 150);
    return () => clearTimeout(timer);
  }, [active, stillMotion]);

  // Resting or engaged: a stable, complete sentence rather than a half word.
  if (!active || stillMotion) return ROTATING_PROMPTS[0];
  return text;
}

export function HeroSection() {
  const nav = useNavigate();
  const [heroPrompt, setHeroPrompt] = useState("");
  // Set as soon as the visitor makes the box theirs — by focusing it, typing,
  // or picking a pill. From then on the examples stop moving for good.
  const [engaged, setEngaged] = useState(false);

  const rotating = !engaged && !heroPrompt;
  const placeholder = useTypedPlaceholder(rotating);

  const startBuilding = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && heroPrompt.trim()) {
      window.sessionStorage.setItem("aiva-hero-prompt", heroPrompt.trim());
    }
    nav({ to: "/signup", search: {} });
  };

  /**
   * A pill drops that category's example straight into the box, ready to edit.
   * Clicking the same pill again offers the next example in that category, so
   * the pills double as a way to browse what is possible.
   */
  const pickCategory = (next: HeroCategory) => {
    const list = examplesFor(next);
    const at = list.indexOf(heroPrompt);
    setEngaged(true);
    setHeroPrompt(list[(at + 1) % list.length] ?? "");
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
                onChange={e => { setEngaged(true); setHeroPrompt(e.target.value); }}
                onFocus={() => setEngaged(true)}
                placeholder={placeholder}
                aria-label={STATIC_PLACEHOLDER}
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
                {HERO_QUICK_STARTS.map(q => (
                  <button type="button" key={q.category} className="hero-chip" onClick={() => pickCategory(q.category)}>{q.label}</button>
                ))}
              </div>
            </div>
          </form>

          <p className="hero-fine">No Credit Card Required · Free Forever On Starter · Setup In 5 Minutes</p>
        </div>
      </section>
  );
}

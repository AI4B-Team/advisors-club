import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { examplesFor, HERO_QUICK_STARTS, type HeroCategory } from "./hero-examples";

const COVERS = [coverWealth, coverRealEstate, coverSales, coverMindset, coverMarketing, coverCrypto, coverFitness, coverSpeaking, coverStartup, coverAI, coverBrand, coverInvesting];
const HERO_TILES: string[] = Array.from({ length: 28 }, (_, i) => COVERS[i % COVERS.length]);

/** Shown the moment a visitor takes the box over, so it is never left blank. */
const STATIC_PLACEHOLDER = "Tell us about your business, audience, expertise, or idea...";

/** How long an example rests before it crossfades to the next one. */
const HOLD_MS = 4200;
const FADE_MS = 320;

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
 * Crossfades through `examples` while `active`.
 *
 * Two rules it must not break: it never touches the textarea's value (the
 * examples live in an overlay, not in the field), and it stops the moment the
 * visitor engages. Someone reading a moving sentence while trying to type is
 * being fought by the page.
 *
 * Honours `prefers-reduced-motion` by holding on the first example instead of
 * rotating at all.
 */
function useRotatingExample(examples: string[], active: boolean): { text: string; fading: boolean } {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [stillMotion, setStillMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    const sync = () => setStillMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // A new set (a pill was chosen) starts from the top rather than mid-rotation.
  useEffect(() => { setIndex(0); setFading(false); }, [examples]);

  useEffect(() => {
    if (!active || stillMotion || examples.length < 2) return;
    let swap: ReturnType<typeof setTimeout> | undefined;
    const hold = setTimeout(() => {
      setFading(true);
      swap = setTimeout(() => {
        setIndex(i => (i + 1) % examples.length);
        setFading(false);
      }, FADE_MS);
    }, HOLD_MS);
    return () => { clearTimeout(hold); clearTimeout(swap); };
  }, [active, stillMotion, index, examples]);

  return { text: examples[index] ?? examples[0] ?? "", fading };
}

export function HeroSection() {
  const nav = useNavigate();
  const [heroPrompt, setHeroPrompt] = useState("");
  // Set as soon as the visitor makes the box theirs — by focusing it, typing,
  // or picking a pill. From then on the examples stop moving for good.
  const [engaged, setEngaged] = useState(false);
  const [category, setCategory] = useState<HeroCategory | null>(null);

  // Memoized on the category: a fresh array every render would restart the
  // rotation's timer before it could ever fire.
  const examples = useMemo(() => examplesFor(category), [category]);
  const showExamples = !engaged && !heroPrompt;
  const { text: example, fading } = useRotatingExample(examples, showExamples);

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
    setCategory(next);
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
                // While the examples are showing they ARE the placeholder; the
                // static one takes back over the moment they stop.
                placeholder={showExamples ? "" : STATIC_PLACEHOLDER}
                aria-label={STATIC_PLACEHOLDER}
                rows={3}
              />
              {showExamples && (
                <div className="hero-aiva-examples" aria-hidden="true">
                  <span className={fading ? "is-out" : undefined}>{example}</span>
                </div>
              )}
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

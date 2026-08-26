import { useMemo, useState } from "react";
import { Store, AlertTriangle } from "lucide-react";
import { LIBRARY_CATEGORIES } from "@/lib/apps/library";
import { publishApp, listingForApp, currentAuthor } from "@/lib/apps/marketplace-store";
import {
  authorEarningsLabel, publishBlocker, PLATFORM_TAKE_RATE,
  type Listing, type PublishInput,
} from "@/lib/apps/marketplace";
import type { App, AppPricing } from "@/lib/apps/types";

type PriceModel = AppPricing["model"];

/**
 * Lists an app for other creators. Republishing an already-listed app pushes a
 * new version rather than creating a second listing, so the copy switches to
 * an update flow when a listing already exists.
 */
export function PublishAppModal({ app, onClose, onPublished }: {
  app: App;
  onClose: () => void;
  onPublished?: (listing: Listing) => void;
}) {
  const existing = useMemo(() => listingForApp(app.id), [app.id]);
  const author = useMemo(() => currentAuthor(), []);
  const blocker = publishBlocker(app);

  const [name, setName] = useState(existing?.name ?? app.name);
  const [description, setDescription] = useState(existing?.description ?? app.description);
  const [details, setDetails] = useState(existing?.details ?? "");
  const [category, setCategory] = useState(existing?.category ?? author.niche ?? LIBRARY_CATEGORIES[0] ?? "Universal");
  const [model, setModel] = useState<PriceModel>(existing?.pricing.model ?? "free");
  const [price, setPrice] = useState(
    existing && existing.pricing.model !== "free" ? String(existing.pricing.price) : "49",
  );
  const [interval, setInterval] = useState<"month" | "year">(
    existing?.pricing.model === "subscription" ? existing.pricing.interval : "month",
  );
  const [changelog, setChangelog] = useState("");

  const categories = useMemo(() => {
    const all = [...LIBRARY_CATEGORIES];
    if (author.niche && !all.includes(author.niche)) all.unshift(author.niche);
    if (existing && !all.includes(existing.category)) all.unshift(existing.category);
    return all;
  }, [author.niche, existing]);

  const pricing: AppPricing = useMemo(() => {
    const value = Math.max(0, Number(price) || 0);
    if (model === "free" || value <= 0) return { model: "free" };
    if (model === "subscription") return { model: "subscription", price: value, interval };
    return { model: "one-time", price: value };
  }, [model, price, interval]);

  function submit() {
    if (blocker || !name.trim()) return;
    const input: PublishInput = {
      name, description, details, category, pricing,
      changelog: existing ? changelog : undefined,
    };
    const listing = publishApp(app, input);
    onPublished?.(listing);
    onClose();
  }

  return (
    <div className="apx-modal-wrap" onClick={onClose}>
      <div className="apx-modal" onClick={e => e.stopPropagation()}>
        <div className="apx-modal-head">
          <h3><Store size={16} /> {existing ? "Publish An Update" : "Publish To The Marketplace"}</h3>
          <button className="apx-x" onClick={onClose}>×</button>
        </div>

        <div className="apx-modal-body">
          {blocker ? (
            <p className="apx-warn"><AlertTriangle size={13} /> {blocker}</p>
          ) : (
            <>
              <p className="apx-muted">
                {existing
                  ? `This Is Version ${existing.version + 1}. Creators Who Already Installed It Will See An Update Waiting — Their Own Edits Stay Untouched Until They Take It.`
                  : `Other Creators Will Be Able To Install This Into Their Own Club. You Publish As ${author.name}.`}
              </p>

              <label className="apx-field">
                <span className="apx-field-l">Listing Name</span>
                <input value={name} onChange={e => setName(e.target.value)} autoFocus />
              </label>

              <label className="apx-field">
                <span className="apx-field-l">One-Line Description</span>
                <input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Score A Property Deal In Under A Minute."
                />
              </label>

              <label className="apx-field">
                <span className="apx-field-l">Who It's For</span>
                <textarea
                  rows={3}
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="Say Who Gets Value From This And What They Do With The Result. This Is What Sells The Install."
                />
              </label>

              <label className="apx-field">
                <span className="apx-field-l">Category</span>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>

              <label className="apx-field">
                <span className="apx-field-l">What Creators Pay To Install</span>
                <select value={model} onChange={e => setModel(e.target.value as PriceModel)}>
                  <option value="free">Free</option>
                  <option value="one-time">One-Time Price</option>
                  <option value="subscription">Subscription</option>
                </select>
                <span className="apx-field-h">This Is What Another CREATOR Pays You. What Their Members Pay Is Their Decision, Set In Their Own Club.</span>
              </label>

              {model !== "free" && (
                <div className="apx-build-grid">
                  <label className="apx-field">
                    <span className="apx-field-l">Price</span>
                    <div className="apx-input-wrap">
                      <i>$</i>
                      <input type="number" min={0} value={price} onChange={e => setPrice(e.target.value)} />
                    </div>
                  </label>
                  {model === "subscription" && (
                    <label className="apx-field">
                      <span className="apx-field-l">Billed</span>
                      <select value={interval} onChange={e => setInterval(e.target.value as "month" | "year")}>
                        <option value="month">Monthly</option>
                        <option value="year">Yearly</option>
                      </select>
                    </label>
                  )}
                </div>
              )}

              <div className="apx-split">
                <strong>{authorEarningsLabel(pricing)}</strong>
                <span>Advisors Club Takes {Math.round(PLATFORM_TAKE_RATE * 100)}% Of Paid Installs. Free Listings Cost You Nothing.</span>
              </div>

              {existing && (
                <label className="apx-field">
                  <span className="apx-field-l">What Changed</span>
                  <input
                    value={changelog}
                    onChange={e => setChangelog(e.target.value)}
                    placeholder="Added A Cash-On-Cash Output."
                  />
                  <span className="apx-field-h">Shown To Creators Deciding Whether To Take The Update.</span>
                </label>
              )}
            </>
          )}
        </div>

        <div className="apx-modal-foot">
          <button className="apx-mini" onClick={onClose}>Cancel</button>
          <button className="apx-primary-btn" disabled={Boolean(blocker) || !name.trim()} onClick={submit}>
            {existing ? `Publish Version ${existing.version + 1}` : "Publish Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}

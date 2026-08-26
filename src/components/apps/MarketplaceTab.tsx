import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, BadgeCheck, Check, Download, Eye, EyeOff, Loader2, Search, Star, Store } from "lucide-react";
import { appIcon } from "@/components/apps/icons";
import { DataBadge } from "@/components/DataBadge";
import { useCommerceViewer } from "@/hooks/use-commerce";
import type { MarketplaceEarnings } from "@/lib/commerce/wire";
import {
  catalogListings, categoriesOf, filterListings, isPaidListing, listingPrice,
  sortListings, splitRevenue, type CatalogSort, type Listing, type RevenueSplit,
} from "@/lib/apps/marketplace";
import {
  fetchMarketplaceEarnings, getListings, hydrateMarketplace, installListing,
  installedListingIds, isOwnListing, marketplaceIsServerBacked, myEarnings,
  myListings, setListingStatus, subscribeMarketplace,
} from "@/lib/apps/marketplace-store";
import { APP_KIND_LABEL, pricingLabel } from "@/lib/apps/types";

type MarketState = {
  listings: Listing[];
  /** Listings this club already installed. */
  installed: Set<string>;
  /** Listings this club published. Never includes sample supply. */
  mine: Listing[];
  earned: RevenueSplit & { count: number };
};

const EMPTY: MarketState = {
  listings: [],
  installed: new Set(),
  mine: [],
  earned: { count: 0, gross: 0, platformFee: 0, authorNet: 0, rate: 0 },
};

function useMarketplace(): MarketState {
  const [state, setState] = useState<MarketState>(EMPTY);
  useEffect(() => {
    const sync = () => setState({
      listings: getListings(),
      installed: new Set(installedListingIds()),
      mine: myListings(),
      earned: myEarnings(),
    });
    sync();
    // Inside a real club the catalog lives in the database; pull it once.
    void hydrateMarketplace();
    return subscribeMarketplace(sync);
  }, []);
  return state;
}

/**
 * Payout totals from the server. Money is counted from paid orders, never
 * from the local ledger — so until this answers, nothing is presented as
 * earnings inside a real club.
 */
function useEarnings(): { server: MarketplaceEarnings | null; loading: boolean } {
  const [server, setServer] = useState<MarketplaceEarnings | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    void fetchMarketplaceEarnings().then(r => {
      if (!cancelled) { setServer(r); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);
  return { server, loading };
}

/**
 * The second marketplace layer: apps creators publish for other creators.
 * Installing writes a DRAFT app into this club — the same contract as the App
 * Library, so nothing reaches members until the creator publishes it.
 */
export function MarketplaceTab({ onInstalled }: { onInstalled: (appId: string) => void }) {
  const { listings, installed, mine, earned } = useMarketplace();
  const { server: serverEarnings, loading: earningsLoading } = useEarnings();
  const viewer = useCommerceViewer();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const [sort, setSort] = useState<CatalogSort>("popular");
  const [open, setOpen] = useState<Listing | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const catalog = useMemo(() => catalogListings(listings), [listings]);
  const categories = useMemo(() => categoriesOf(catalog), [catalog]);
  const shown = useMemo(
    () => sortListings(filterListings(catalog, { query, category: category || undefined, freeOnly }), sort),
    [catalog, query, category, freeOnly, sort],
  );

  const install = useCallback(async (listing: Listing) => {
    setBusy(true);
    setError(null);
    try {
      const result = await installListing(listing, viewer);
      if (!result.ok) { setError(result.error); return; }
      // Hosted checkout: the provider takes over and its webhook installs it.
      if ("redirectUrl" in result) { window.location.assign(result.redirectUrl); return; }
      setOpen(null);
      onInstalled(result.appId);
    } finally {
      setBusy(false);
    }
  }, [onInstalled, viewer]);

  return (
    <>
      <p className="apx-muted">
        Apps Other Creators Built And Listed. Installing One Adds A Draft To Your Club That You Can Rename,
        Re-Price And Adapt Before Any Member Sees It.
      </p>

      {mine.length > 0 && (
        <section className="apx-lib-sec">
          <h2 className="apx-lib-t">Your Listings</h2>
          <EarningsTotals
            listed={mine.length}
            local={earned}
            server={serverEarnings}
            loading={earningsLoading}
            expectServer={marketplaceIsServerBacked()}
          />
          <div className="apx-grid">
            {mine.map(l => (
              <div key={l.id} className="apx-card">
                <span className="apx-card-i">{appIcon(l.icon)}</span>
                <span className="apx-card-t">{l.name}</span>
                <span className="apx-card-d">{l.description}</span>
                <div className="apx-card-meta">
                  <span className="apx-card-kind">Version {l.version}</span>
                  <span className="apx-card-kind">{pricingLabel(l.pricing)}</span>
                  <span className="apx-card-kind">{l.installs} Installs</span>
                </div>
                <div className="apx-card-foot">
                  <span className={`apx-status${l.status === "live" ? " is-live" : ""}`}>
                    {l.status === "live" ? "Live" : "Unlisted"}
                  </span>
                  <button
                    className="apx-mini"
                    onClick={() => setListingStatus(l.id, l.status === "live" ? "unlisted" : "live")}
                  >
                    {l.status === "live" ? <><EyeOff size={13} /> Unlist</> : <><Eye size={13} /> Relist</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="apx-mkt-filters">
        <label className="apx-mkt-search">
          <Search size={14} aria-hidden />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search Apps, Creators Or Niches"
            aria-label="Search The Marketplace"
          />
        </label>
        <select value={category} onChange={e => setCategory(e.target.value)} aria-label="Category">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value as CatalogSort)} aria-label="Sort">
          <option value="popular">Most Installed</option>
          <option value="newest">Recently Updated</option>
          <option value="price">Price</option>
        </select>
        <button
          className={`apx-mini${freeOnly ? " is-on" : ""}`}
          onClick={() => setFreeOnly(f => !f)}
          aria-pressed={freeOnly}
        >
          Free Only
        </button>
      </div>

      {error && (
        <p className="apx-warn" role="alert"><AlertTriangle size={13} /> {error}</p>
      )}

      {shown.length === 0 ? (
        <div className="apx-empty">
          <Store size={18} />
          <strong>{catalog.length === 0 ? "No Apps Listed Yet" : "Nothing Matches"}</strong>
          <span>
            {catalog.length === 0
              ? "Nobody Has Published An App For Other Creators Yet. Yours Could Be The First."
              : "Try A Different Category Or Clear The Search."}
          </span>
        </div>
      ) : (
        <div className="apx-grid">
          {shown.map(l => (
            <ListingCard
              key={l.id}
              listing={l}
              installed={installed.has(l.id)}
              own={isOwnListing(l)}
              onOpen={() => setOpen(l)}
            />
          ))}
        </div>
      )}

      {open && (
        <ListingModal
          listing={open}
          installed={installed.has(open.id)}
          own={isOwnListing(open)}
          busy={busy}
          error={error}
          onClose={() => { if (!busy) { setOpen(null); setError(null); } }}
          onInstall={() => void install(open)}
        />
      )}
    </>
  );
}

function ListingCard({ listing, installed, own, onOpen }: {
  listing: Listing;
  installed: boolean;
  /** Published by this club — browsable, but not installable. */
  own: boolean;
  onOpen: () => void;
}) {
  return (
    <div className="apx-card">
      <div className="apx-card-top">
        <span className="apx-card-i">{appIcon(listing.icon)}</span>
        {listing.sample && <DataBadge kind="sample" />}
      </div>
      <button className="apx-card-body apx-mkt-open" onClick={onOpen}>
        <span className="apx-card-t">{listing.name}</span>
        <span className="apx-mkt-author">
          {listing.author.name}
          {listing.author.verified && <BadgeCheck size={12} aria-label="Verified Creator" />}
        </span>
        <span className="apx-card-d">{listing.description}</span>
      </button>
      <div className="apx-card-meta">
        <span className="apx-card-kind">{APP_KIND_LABEL[listing.kind]}</span>
        <span className="apx-card-kind">{listing.category}</span>
        {listing.rating !== undefined && (
          <span className="apx-card-kind"><Star size={11} /> {listing.rating}</span>
        )}
      </div>
      <div className="apx-card-foot">
        <span className={`apx-price${isPaidListing(listing) ? "" : " is-free"}`}>{pricingLabel(listing.pricing)}</span>
        <button className="apx-mini" onClick={onOpen}>
          {own ? "Your Listing" : installed ? <><Check size={13} /> Installed</> : <><Download size={13} /> View</>}
        </button>
      </div>
    </div>
  );
}

function ListingModal({ listing, installed, own, busy, error, onClose, onInstall }: {
  listing: Listing;
  installed: boolean;
  own: boolean;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onInstall: () => void;
}) {
  const price = listingPrice(listing.pricing);
  const split = splitRevenue(price);

  return (
    <div className="apx-modal-wrap" onClick={onClose}>
      <div className="apx-modal" onClick={e => e.stopPropagation()}>
        <div className="apx-modal-head">
          <h3>{appIcon(listing.icon, 16)} {listing.name}</h3>
          <button className="apx-x" onClick={onClose}>×</button>
        </div>

        <div className="apx-modal-body">
          {listing.sample && (
            <p className="apx-muted">
              <DataBadge kind="sample" /> This Listing Is An Example We Seeded To Show How The Marketplace Works.
              The Creator, The Install Count And The Rating Are Not Real. The Tool Is — Installing It Gives You A Working App.
            </p>
          )}

          <div className="apx-mkt-by">
            <strong>
              {listing.author.name}
              {listing.author.verified && <BadgeCheck size={13} aria-label="Verified Creator" />}
            </strong>
            {listing.author.niche && <span>{listing.author.niche}</span>}
          </div>

          <p className="apx-mkt-pitch">{listing.details || listing.description}</p>

          <div className="apx-card-meta">
            <span className="apx-card-kind">{APP_KIND_LABEL[listing.kind]}</span>
            <span className="apx-card-kind">{listing.category}</span>
            <span className="apx-card-kind">Version {listing.version}</span>
            <span className="apx-card-kind">{listing.installs.toLocaleString()} Installs</span>
            {listing.rating !== undefined && (
              <span className="apx-card-kind"><Star size={11} /> {listing.rating} ({listing.ratingCount})</span>
            )}
          </div>

          {listing.changelog && (
            <div className="apx-note">
              <strong>Latest Update</strong>
              <span>{listing.changelog}</span>
            </div>
          )}

          <div className="apx-note">
            <strong>What You Get</strong>
            <span>
              {listing.schema.fields.length} Inputs · {listing.schema.outputs.length} Calculated Outputs
              {listing.schema.template ? " · A Generated Document" : ""}
              {listing.schema.checklist?.length ? ` · ${listing.schema.checklist.length} Checklist Steps` : ""}
              {". "}
              It Installs As A Draft You Can Edit Before Anyone Sees It.
            </span>
          </div>

          <div className="apx-split">
            <strong>{pricingLabel(listing.pricing)}</strong>
            <span>
              {price > 0
                ? `Paid Once At Checkout. ${listing.author.name} Receives $${split.authorNet.toLocaleString()}, Advisors Club Keeps $${split.platformFee.toLocaleString()}.`
                : "This Creator Lists It Free. No Revenue Share Applies."}
            </span>
          </div>
        </div>

        <div className="apx-modal-foot">
          {error && <span className="apx-warn" role="alert"><AlertTriangle size={13} /> {error}</span>}
          <button className="apx-mini" onClick={onClose} disabled={busy}>Close</button>
          {own ? (
            <button className="apx-primary-btn" disabled>This Is Your Listing</button>
          ) : installed ? (
            <button className="apx-primary-btn" disabled><Check size={14} /> Already Installed</button>
          ) : (
            <button className="apx-primary-btn" onClick={onInstall} disabled={busy}>
              {busy
                ? <><Loader2 size={14} className="apx-spin" /> {price > 0 ? "Opening Checkout…" : "Installing…"}</>
                : <><Download size={14} /> {price > 0 ? `Install For $${price.toLocaleString()}` : "Install Free"}</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Payout totals.
 *
 * Inside a real club the ONLY number presented as money is the server's, from
 * paid orders. The local ledger is a sandbox artefact, so it is shown as demo
 * data and labelled — never quietly promoted to revenue.
 */
function EarningsTotals({ listed, local, server, loading, expectServer }: {
  listed: number;
  local: RevenueSplit & { count: number };
  server: MarketplaceEarnings | null;
  loading: boolean;
  /** True inside a real club, where only the server may state earnings. */
  expectServer: boolean;
}) {
  // Inside a real club the server is the only source of a money figure. If it
  // has not answered, the honest answer is "we do not know yet" — not the
  // local ledger wearing a demo label, and certainly not a number.
  const unknown = expectServer && !server;
  const live = Boolean(server?.live);
  const installs = server ? server.installs : local.count;
  const net = server ? server.netCents / 100 : local.authorNet;
  const fee = server ? server.platformFeeCents / 100 : local.platformFee;
  const money = (v: number) => (loading || unknown ? "—" : `$${v.toLocaleString()}`);

  return (
    <>
      <div className="apx-totals">
        <div className="apx-total"><span>Listed</span><strong>{listed}</strong></div>
        <div className="apx-total"><span>Installs</span><strong>{loading || unknown ? "—" : installs}</strong></div>
        <div className="apx-total">
          <span>{live ? "You've Earned" : "Earnings"}</span>
          <strong>{money(net)}</strong>
        </div>
        <div className="apx-total"><span>Platform Share</span><strong>{money(fee)}</strong></div>
      </div>

      {!loading && unknown && (
        <p className="apx-warn" role="status">
          <AlertTriangle size={13} /> Couldn't Reach The Payout Ledger. Reload To Try Again.
        </p>
      )}
      {!loading && !unknown && !live && (
        <p className="apx-muted">
          <DataBadge kind={expectServer ? "demo" : "sample"} />{" "}
          No Payments Have Settled Yet — These Totals Are Not Revenue.
        </p>
      )}
      {server && server.refundedCents > 0 && (
        <p className="apx-muted">${(server.refundedCents / 100).toLocaleString()} Refunded And Excluded Above.</p>
      )}
    </>
  );
}

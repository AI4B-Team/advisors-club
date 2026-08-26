import { useCallback, useEffect, useMemo, useState } from "react";
import { BadgeCheck, Check, Download, Eye, EyeOff, Search, Star, Store } from "lucide-react";
import { appIcon } from "@/components/apps/icons";
import { DataBadge } from "@/components/DataBadge";
import {
  catalogListings, categoriesOf, filterListings, isPaidListing, listingPrice,
  sortListings, splitRevenue, type CatalogSort, type Listing, type RevenueSplit,
} from "@/lib/apps/marketplace";
import {
  getListings, installListing, installedListingIds, isOwnListing, myEarnings,
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
    return subscribeMarketplace(sync);
  }, []);
  return state;
}

/**
 * The second marketplace layer: apps creators publish for other creators.
 * Installing writes a DRAFT app into this club — the same contract as the App
 * Library, so nothing reaches members until the creator publishes it.
 */
export function MarketplaceTab({ onInstalled }: { onInstalled: (appId: string) => void }) {
  const { listings, installed, mine, earned } = useMarketplace();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);
  const [sort, setSort] = useState<CatalogSort>("popular");
  const [open, setOpen] = useState<Listing | null>(null);

  const catalog = useMemo(() => catalogListings(listings), [listings]);
  const categories = useMemo(() => categoriesOf(catalog), [catalog]);
  const shown = useMemo(
    () => sortListings(filterListings(catalog, { query, category: category || undefined, freeOnly }), sort),
    [catalog, query, category, freeOnly, sort],
  );

  const install = useCallback((listing: Listing) => {
    const result = installListing(listing);
    if (result) { setOpen(null); onInstalled(result.app.id); }
  }, [onInstalled]);

  return (
    <>
      <p className="apx-muted">
        Apps Other Creators Built And Listed. Installing One Adds A Draft To Your Club That You Can Rename,
        Re-Price And Adapt Before Any Member Sees It.
      </p>

      {mine.length > 0 && (
        <section className="apx-lib-sec">
          <h2 className="apx-lib-t">Your Listings</h2>
          <div className="apx-totals">
            <div className="apx-total"><span>Listed</span><strong>{mine.length}</strong></div>
            <div className="apx-total"><span>Installs</span><strong>{earned.count}</strong></div>
            <div className="apx-total"><span>You've Earned</span><strong>${earned.authorNet.toLocaleString()}</strong></div>
            <div className="apx-total"><span>Platform Share</span><strong>${earned.platformFee.toLocaleString()}</strong></div>
          </div>
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

      {shown.length === 0 ? (
        <div className="apx-empty">
          <Store size={18} />
          <strong>Nothing Matches</strong>
          <span>Try A Different Category Or Clear The Search.</span>
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
          onClose={() => setOpen(null)}
          onInstall={() => install(open)}
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

function ListingModal({ listing, installed, own, onClose, onInstall }: {
  listing: Listing;
  installed: boolean;
  own: boolean;
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
                ? `${listing.author.name} Receives $${split.authorNet.toLocaleString()}. Advisors Club Keeps $${split.platformFee.toLocaleString()}.`
                : "This Creator Lists It Free. No Revenue Share Applies."}
            </span>
          </div>
        </div>

        <div className="apx-modal-foot">
          <button className="apx-mini" onClick={onClose}>Close</button>
          {own ? (
            <button className="apx-primary-btn" disabled>This Is Your Listing</button>
          ) : installed ? (
            <button className="apx-primary-btn" disabled><Check size={14} /> Already Installed</button>
          ) : (
            <button className="apx-primary-btn" onClick={onInstall}>
              <Download size={14} /> {price > 0 ? `Install For $${price.toLocaleString()}` : "Install Free"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

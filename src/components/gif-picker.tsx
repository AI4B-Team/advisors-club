import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

type GifItem = { id: string; url: string; preview: string; title: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (gifUrl: string) => void;
};

// Tenor public demo key — works for low-volume demos.
const TENOR_KEY = "LIVDSRZULELA";

export function GifPicker({ open, onClose, onPick }: Props) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<GifItem[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      void fetchGifs(q);
    }, 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, open]);

  async function fetchGifs(query: string) {
    setLoading(true);
    try {
      const endpoint = query.trim()
        ? `https://g.tenor.com/v1/search?q=${encodeURIComponent(query.trim())}&key=${TENOR_KEY}&limit=24&media_filter=minimal&contentfilter=high`
        : `https://g.tenor.com/v1/trending?key=${TENOR_KEY}&limit=24&media_filter=minimal&contentfilter=high`;
      const res = await fetch(endpoint);
      const data = await res.json();
      const list: GifItem[] = (data.results || []).map((r: any) => {
        const media = (r.media && r.media[0]) || {};
        const tinygif = media.tinygif || media.nanogif || media.gif;
        const gif = media.gif || media.mediumgif || tinygif;
        return {
          id: r.id,
          url: gif?.url || "",
          preview: tinygif?.url || gif?.url || "",
          title: r.content_description || r.title || "",
        };
      }).filter((g: GifItem) => g.url && g.preview);
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="gif-picker-back" onClick={onClose}>
      <div className="gif-picker" onClick={e => e.stopPropagation()}>
        <div className="gif-picker-head">
          <div className="gif-picker-search">
            <Search size={16} />
            <input
              autoFocus
              placeholder="Search GIPHY"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
          <button type="button" className="gif-picker-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="gif-picker-grid">
          {loading && items.length === 0 && (
            <div className="gif-picker-empty">Loading…</div>
          )}
          {!loading && items.length === 0 && (
            <div className="gif-picker-empty">No GIFs found.</div>
          )}
          {items.map(g => (
            <button
              key={g.id}
              type="button"
              className="gif-picker-item"
              onClick={() => { onPick(g.url); onClose(); }}
              title={g.title}
            >
              <img src={g.preview} alt={g.title} loading="lazy" />
            </button>
          ))}
        </div>
        <div className="gif-picker-foot">Powered by Tenor</div>
      </div>
    </div>
  );
}

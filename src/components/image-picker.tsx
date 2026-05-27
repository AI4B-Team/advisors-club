import { useMemo, useRef, useState } from "react";
import { Search, Upload, X, Image as ImageIcon } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (url: string) => void;
};

type Stock = { url: string; thumb: string; tags: string; credit: string };

// Curated free Unsplash photos (direct CDN URLs, no API key required).
const STOCK: Stock[] = [
  { tags: "business meeting team office collaboration", credit: "Unsplash",
    url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=70" },
  { tags: "laptop desk workspace productivity work",
    url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=70", credit: "Unsplash" },
  { tags: "real estate house home property luxury",
    url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=70", credit: "Unsplash" },
  { tags: "city skyline buildings modern urban",
    url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&q=70", credit: "Unsplash" },
  { tags: "money finance dollars cash investment",
    url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=70", credit: "Unsplash" },
  { tags: "marketing analytics chart growth data",
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=70", credit: "Unsplash" },
  { tags: "team people group collaboration coworkers",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=70", credit: "Unsplash" },
  { tags: "coffee morning workspace desk lifestyle",
    url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=70", credit: "Unsplash" },
  { tags: "presentation conference speaker stage event",
    url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&q=70", credit: "Unsplash" },
  { tags: "nature mountains landscape sunset travel",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70", credit: "Unsplash" },
  { tags: "ocean beach waves nature travel",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=70", credit: "Unsplash" },
  { tags: "abstract gradient colors background art",
    url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&q=70", credit: "Unsplash" },
  { tags: "fitness workout gym health exercise",
    url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70", credit: "Unsplash" },
  { tags: "food restaurant cooking meal dining",
    url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=70", credit: "Unsplash" },
  { tags: "podcast microphone studio recording audio",
    url: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=70", credit: "Unsplash" },
  { tags: "education books learning study books",
    url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=70", credit: "Unsplash" },
  { tags: "celebration confetti party launch success",
    url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=70", credit: "Unsplash" },
  { tags: "technology code developer programming computer",
    url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=70", credit: "Unsplash" },
  { tags: "handshake deal partnership business",
    url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&q=70", credit: "Unsplash" },
  { tags: "creative design art portfolio inspiration",
    url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=70", credit: "Unsplash" },
  { tags: "writing notebook journal planning idea",
    url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=70", credit: "Unsplash" },
  { tags: "calendar planning schedule time productivity",
    url: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1600&q=80",
    thumb: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&q=70", credit: "Unsplash" },
];

export function ImagePicker({ open, onClose, onPick }: Props) {
  const [tab, setTab] = useState<"upload" | "stock">("upload");
  const [q, setQ] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return STOCK;
    return STOCK.filter(x => x.tags.includes(s));
  }, [q]);

  function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      if (url) {
        onPick(url);
        onClose();
      }
      setUploading(false);
    };
    reader.onerror = () => setUploading(false);
    reader.readAsDataURL(file);
  }

  if (!open) return null;

  return (
    <div className="gif-picker-back" onClick={onClose}>
      <div className="gif-picker" onClick={e => e.stopPropagation()}>
        <div className="gif-picker-head" style={{flexDirection:"column",alignItems:"stretch",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{display:"flex",gap:6,flex:1}}>
              <button type="button" className={`img-tab${tab==="upload"?" on":""}`} onClick={()=>setTab("upload")}>
                <Upload size={14}/> Upload
              </button>
              <button type="button" className={`img-tab${tab==="stock"?" on":""}`} onClick={()=>setTab("stock")}>
                <ImageIcon size={14}/> Stock Images
              </button>
            </div>
            <button type="button" className="gif-picker-close" onClick={onClose} aria-label="Close">
              <X size={16}/>
            </button>
          </div>
          {tab === "stock" && (
            <div className="gif-picker-search">
              <Search size={16}/>
              <input
                autoFocus
                placeholder="Search free stock photos (e.g. business, real estate, marketing)"
                value={q}
                onChange={e=>setQ(e.target.value)}
              />
            </div>
          )}
        </div>

        {tab === "upload" && (
          <div className="img-upload">
            <div
              className="img-dropzone"
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); }}
              onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
            >
              <Upload size={28}/>
              <div className="img-dropzone-t">{uploading ? "Uploading…" : "Click or drag an image here"}</div>
              <div className="img-dropzone-s">PNG, JPG, GIF, WEBP — up to 10 MB</div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={e => { handleFiles(e.target.files); e.target.value = ""; }}
            />
          </div>
        )}

        {tab === "stock" && (
          <div className="gif-picker-grid">
            {filtered.length === 0 && <div className="gif-picker-empty">No matching photos.</div>}
            {filtered.map(s => (
              <button
                key={s.url}
                type="button"
                className="gif-picker-item"
                onClick={() => { onPick(s.url); onClose(); }}
                title={s.tags}
              >
                <img src={s.thumb} alt="" loading="lazy"/>
              </button>
            ))}
          </div>
        )}

        <div className="gif-picker-foot">
          {tab === "stock" ? "Photos via Unsplash" : "Files stay private to your post"}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from "react";
import {
  Pilcrow, Heading2, Heading3, ListOrdered, List, Quote, Minus, Code2, Smile, AtSign,
  MousePointerClick, BarChart3, Image as ImageIcon, Paperclip, Music, Mic, Film, Video, FileText,
  Code, Youtube, Instagram, Facebook, Twitter, Github, MapPin, Globe,
} from "lucide-react";

export type SlashItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  run: () => void;
};

type Section = { title: string; items: SlashItem[] };

type Props = {
  onClose: () => void;
  insert: (text: string) => void;
  openPoll: () => void;
  openVideo: () => void;
  openEmoji: () => void;
  pickFile: (accept?: string) => void;
};

export function SlashMenu({ onClose, insert, openPoll, openVideo, openEmoji, pickFile }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function embed(name: string, hint?: string) {
    const url = prompt(`Paste ${name} URL${hint ? ` (${hint})` : ""}`);
    if (!url) return;
    insert(`\n[${name}] ${url.trim()}\n`);
  }
  function wrap(fn: () => void) { return () => { fn(); onClose(); }; }

  const sections: Section[] = [
    {
      title: "Basic",
      items: [
        { id: "p", label: "Paragraph", icon: <Pilcrow size={16}/>, run: wrap(() => insert("\n")) },
        { id: "h2", label: "Heading 2", icon: <Heading2 size={16}/>, run: wrap(() => insert("\n## ")) },
        { id: "h3", label: "Heading 3", icon: <Heading3 size={16}/>, run: wrap(() => insert("\n### ")) },
        { id: "ol", label: "Numbered list", icon: <ListOrdered size={16}/>, run: wrap(() => insert("\n1. ")) },
        { id: "ul", label: "Bulleted list", icon: <List size={16}/>, run: wrap(() => insert("\n- ")) },
        { id: "bq", label: "Blockquote", icon: <Quote size={16}/>, run: wrap(() => insert("\n> ")) },
        { id: "hr", label: "Divider", icon: <Minus size={16}/>, run: wrap(() => insert("\n---\n")) },
        { id: "code", label: "Code", icon: <Code2 size={16}/>, run: wrap(() => insert("\n```\n\n```\n")) },
        { id: "emoji", label: "Emoji", icon: <Smile size={16}/>, run: wrap(openEmoji) },
        { id: "mention", label: "Mention", icon: <AtSign size={16}/>, run: wrap(() => {
            const n = prompt("Mention who? (no @)"); if (n) insert(`@${n.trim().replace(/^@/,"")} `);
          }) },
        { id: "button", label: "Button", icon: <MousePointerClick size={16}/>, run: wrap(() => {
            const label = prompt("Button label"); if (!label) return;
            const url = prompt("Button URL (https://…)"); if (!url) return;
            insert(`\n[**${label}**](${url})\n`);
          }) },
      ],
    },
    {
      title: "Upload",
      items: [
        { id: "poll", label: "Poll", icon: <BarChart3 size={16}/>, run: wrap(openPoll) },
        { id: "image", label: "Image", icon: <ImageIcon size={16}/>, run: wrap(() => pickFile("image/*")) },
        { id: "file", label: "File", icon: <Paperclip size={16}/>, run: wrap(() => pickFile()) },
        { id: "audio", label: "Audio", icon: <Music size={16}/>, run: wrap(() => pickFile("audio/*")) },
        { id: "voice", label: "Voice message", icon: <Mic size={16}/>, run: wrap(() => insert("\n🎤 Voice message\n")) },
        { id: "vclip", label: "Video clip", icon: <Film size={16}/>, run: wrap(openVideo) },
        { id: "video", label: "Video", icon: <Video size={16}/>, run: wrap(openVideo) },
        { id: "pdf", label: "PDF", icon: <FileText size={16}/>, run: wrap(() => pickFile("application/pdf")) },
        { id: "gif", label: "Giphy", icon: <ImageIcon size={16}/>, run: wrap(() => embed("Giphy", "giphy.com/…")) },
      ],
    },
    {
      title: "Embed",
      items: [
        { id: "embed", label: "Embed", icon: <Code size={16}/>, run: wrap(() => embed("Embed", "any URL")) },
        { id: "yt", label: "YouTube", icon: <Youtube size={16}/>, run: wrap(() => embed("YouTube")) },
        { id: "wistia", label: "Wistia", icon: <Video size={16}/>, run: wrap(() => embed("Wistia")) },
        { id: "vimeo", label: "Vimeo", icon: <Video size={16}/>, run: wrap(() => embed("Vimeo")) },
        { id: "loom", label: "Loom", icon: <Video size={16}/>, run: wrap(() => embed("Loom")) },
        { id: "sc", label: "Soundcloud", icon: <Music size={16}/>, run: wrap(() => embed("Soundcloud")) },
        { id: "spot", label: "Spotify", icon: <Music size={16}/>, run: wrap(() => embed("Spotify")) },
        { id: "simple", label: "Simplecast", icon: <Music size={16}/>, run: wrap(() => embed("Simplecast")) },
        { id: "ig", label: "Instagram", icon: <Instagram size={16}/>, run: wrap(() => embed("Instagram")) },
        { id: "fb", label: "Facebook", icon: <Facebook size={16}/>, run: wrap(() => embed("Facebook")) },
        { id: "tw", label: "Twitter", icon: <Twitter size={16}/>, run: wrap(() => embed("Twitter")) },
        { id: "tf", label: "Typeform", icon: <Globe size={16}/>, run: wrap(() => embed("Typeform")) },
        { id: "at", label: "Airtable", icon: <Globe size={16}/>, run: wrap(() => embed("Airtable")) },
        { id: "gh", label: "GitHub", icon: <Github size={16}/>, run: wrap(() => embed("GitHub")) },
        { id: "gmap", label: "Google Maps", icon: <MapPin size={16}/>, run: wrap(() => embed("Google Maps")) },
        { id: "cp", label: "Codepen", icon: <Code size={16}/>, run: wrap(() => embed("Codepen")) },
      ],
    },
  ];

  return (
    <div className="slash-menu" ref={ref} role="menu">
      {sections.map(s => (
        <div key={s.title} className="slash-section">
          <div className="slash-section-title">{s.title}</div>
          {s.items.map(it => (
            <button key={it.id} type="button" className="slash-item" onClick={it.run}>
              <span className="slash-item-icon">{it.icon}</span>
              <span>{it.label}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

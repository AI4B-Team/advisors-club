import realestate from "@/assets/covers/realestate.jpg";
import startup from "@/assets/covers/startup.jpg";
import fitness from "@/assets/covers/fitness.jpg";
import ai from "@/assets/covers/ai.jpg";
import investing from "@/assets/covers/investing.jpg";
import marketing from "@/assets/covers/marketing.jpg";
import mindset from "@/assets/covers/mindset.jpg";
import crypto from "@/assets/covers/crypto.jpg";
import sales from "@/assets/covers/sales.jpg";
import wealth from "@/assets/covers/wealth.jpg";
import speaking from "@/assets/covers/speaking.jpg";
import brand from "@/assets/covers/brand.jpg";

export type Club = {
  id: string;
  name: string;
  tagline: string;
  category: string;
  advisor: string;
  rating: number;
  members: number;
  price: number;
  cover: string;
  trending?: boolean;
  featured?: boolean;
  tags: string[];
};

export const CATEGORIES = [
  "All", "Real Estate", "Business", "Fitness", "AI & Tech",
  "Finance", "Marketing", "Mindset", "Ecommerce", "Crypto",
  "Sales", "Speaking",
];

export const CLUBS: Club[] = [
  { id: "1", name: "Real Estate Empire", tagline: "Build wealth with rentals, flips & syndications.", category: "Real Estate", advisor: "Marcus King", rating: 4.9, members: 2840, price: 97, cover: realestate, trending: true, featured: true, tags: ["realestate","rentals","wealth"] },
  { id: "2", name: "Founder OS", tagline: "Operating system for first-time SaaS founders.", category: "Business", advisor: "Lena Park", rating: 4.8, members: 1920, price: 79, cover: startup, trending: true, featured: true, tags: ["business","saas","startup"] },
  { id: "3", name: "AI Builders Club", tagline: "Ship AI products weekly with hands-on builds.", category: "AI & Tech", advisor: "Devon Liu", rating: 4.9, members: 3210, price: 0, cover: ai, trending: true, featured: true, tags: ["ai","tech","builders"] },
  { id: "4", name: "Lean & Strong", tagline: "Hybrid training, nutrition & recovery for busy pros.", category: "Fitness", advisor: "Tasha Reyes", rating: 4.7, members: 1410, price: 49, cover: fitness, tags: ["fitness","training","health"] },
  { id: "5", name: "Compound Investor", tagline: "Long-term equities, options income, and tax strategy.", category: "Finance", advisor: "Eli Hart", rating: 4.8, members: 2105, price: 129, cover: investing, tags: ["finance","investing","stocks"] },
  { id: "6", name: "Inbound Engine", tagline: "SEO, content & paid funnels that actually convert.", category: "Marketing", advisor: "Priya Shah", rating: 4.8, members: 1670, price: 89, cover: marketing, trending: true, tags: ["marketing","seo","content"] },
  { id: "7", name: "The Mindset Lab", tagline: "Daily practices for high performers and creators.", category: "Mindset", advisor: "Sam Whitley", rating: 4.9, members: 980, price: 39, cover: mindset, tags: ["mindset","habits","focus"] },
  { id: "8", name: "Crypto Compass", tagline: "On-chain analysis, narratives, and risk-first plays.", category: "Crypto", advisor: "Nina Volkov", rating: 4.6, members: 2410, price: 0, cover: crypto, tags: ["crypto","onchain","trading"] },
  { id: "9", name: "Closer's Edge", tagline: "Outbound, discovery & closing for B2B reps.", category: "Sales", advisor: "Jordan Cole", rating: 4.8, members: 1280, price: 69, cover: sales, tags: ["sales","b2b","outbound"] },
  { id: "10", name: "Wealth Architects", tagline: "Family office playbooks for 7-figure operators.", category: "Finance", advisor: "Aisha Quinn", rating: 4.9, members: 720, price: 199, cover: wealth, tags: ["wealth","finance","family"] },
  { id: "11", name: "Stage Ready", tagline: "Keynotes, paid talks & TED-style storytelling.", category: "Speaking", advisor: "Brendan Holt", rating: 4.7, members: 540, price: 79, cover: speaking, tags: ["speaking","storytelling","stage"] },
  { id: "12", name: "Brand Beyond", tagline: "Personal brand, content systems & monetization.", category: "Business", advisor: "Mia Carter", rating: 4.8, members: 1830, price: 0, cover: brand, tags: ["brand","content","personal"] },
];

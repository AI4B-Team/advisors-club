import {
  Home, MessageSquare, BookOpen, UserCheck, Calendar, FolderOpen, LayoutGrid, Users,
  Sparkles, Settings2, Rocket, LayoutDashboard, Activity, Bookmark, Hash, Megaphone,
  MessagesSquare, Clock, CheckCircle2, User, CalendarDays, CalendarClock, CalendarCheck,
  Flame, Award, Library, FileText, Link2, Download, ShieldCheck, Terminal, Lightbulb,
  History, Palette, Globe, Settings, BarChart3, CreditCard, Hand, Book,
} from "lucide-react";
import type { NavIconKey } from "./config";

const MAP: Record<NavIconKey, React.ComponentType<{ size?: number }>> = {
  home: Home,
  community: MessageSquare,
  courses: BookOpen,
  coaching: UserCheck,
  events: Calendar,
  resources: FolderOpen,
  apps: LayoutGrid,
  members: Users,
  ai: Sparkles,
  manage: Settings2,
  rocket: Rocket,
  dashboard: LayoutDashboard,
  activity: Activity,
  bookmark: Bookmark,
  hash: Hash,
  megaphone: Megaphone,
  discussions: MessagesSquare,
  clock: Clock,
  check: CheckCircle2,
  users: Users,
  user: User,
  "calendar-days": CalendarDays,
  "calendar-clock": CalendarClock,
  "calendar-check": CalendarCheck,
  flame: Flame,
  award: Award,
  library: Library,
  file: FileText,
  link: Link2,
  download: Download,
  shield: ShieldCheck,
  terminal: Terminal,
  lightbulb: Lightbulb,
  history: History,
  palette: Palette,
  globe: Globe,
  grid: LayoutGrid,
  settings: Settings,
  chart: BarChart3,
  sparkles: Sparkles,
  "credit-card": CreditCard,
  hand: Hand,
  book: Book,
};

export function NavIcon({ name, size = 16 }: { name: NavIconKey; size?: number }) {
  const Cmp = MAP[name] ?? LayoutGrid;
  return <Cmp size={size} />;
}

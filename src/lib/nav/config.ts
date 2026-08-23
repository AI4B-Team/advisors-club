// Club navigation model.
//
// The sidebar is rendered from this data, NOT hard-coded JSX. DEFAULT_MEMBER_NAV
// is the navigation generated for a brand-new club; a future task will let admins
// rename / reorder / hide / add items by persisting NavOverride records and
// feeding them through resolveNav().

export type NavIconKey =
  | "home" | "community" | "courses" | "coaching" | "events" | "resources"
  | "apps" | "members" | "ai" | "manage" | "rocket"
  | "dashboard" | "activity" | "bookmark" | "hash" | "megaphone" | "discussions"
  | "clock" | "check" | "users" | "user" | "calendar-days" | "calendar-clock"
  | "calendar-check" | "flame" | "award" | "library" | "file" | "link" | "download"
  | "shield" | "terminal" | "lightbulb" | "history" | "palette" | "globe" | "grid"
  | "settings" | "chart" | "sparkles" | "credit-card" | "hand" | "book";

export type NavSection = "member" | "system";

/** A destination inside a nav item's expandable group. */
export type NavSubItem = {
  id: string;
  label: string;
  to: string;
  hash?: string;
  icon: NavIconKey;
};

export type NavItem = {
  id: string;
  label: string;
  /** Internal route today; later this may also be an external URL or custom page. */
  to: string;
  icon: NavIconKey;
  section: NavSection;
  exact?: boolean;
  pill?: boolean;
  hidden?: boolean;
  /** Reserved for future access rules ("everyone" | "members" | "admins"). */
  visibility?: "everyone" | "members" | "admins";
  subs: NavSubItem[];
  menu: string[];
};

/** Shape an admin edit will take in the next task. */
export type NavOverride = {
  id: string;
  label?: string;
  hidden?: boolean;
  order?: number;
  icon?: NavIconKey;
};

export const DEFAULT_ITEM_MENU = ["Pin To Top", "Mute Notifications", "Mark All Read", "Hide"];

/** Default member-facing navigation for a newly created club. */
export const DEFAULT_MEMBER_NAV: NavItem[] = [
  {
    id: "home", label: "Home", to: "/app", icon: "home", section: "member", exact: true, pill: true,
    subs: [
      { id: "home-dashboard", label: "Dashboard", to: "/app/dashboard", icon: "dashboard" },
      { id: "home-activity", label: "Activity", to: "/app", icon: "activity" },
      { id: "home-bookmarks", label: "Bookmarks", to: "/app/bookmarks", icon: "bookmark" },
    ],
    menu: DEFAULT_ITEM_MENU,
  },
  {
    id: "community", label: "Community", to: "/app/club/feed", icon: "community", section: "member",
    subs: [
      { id: "community-feed", label: "Feed", to: "/app/club/feed", icon: "hash" },
      { id: "community-announcements", label: "Announcements", to: "/app/club/feed", icon: "megaphone" },
      { id: "community-challenges", label: "Challenges", to: "/app/club/challenges", icon: "flame" },
      { id: "community-leaderboard", label: "Leaderboard", to: "/app/club/leaderboard", icon: "award" },
    ],
    menu: DEFAULT_ITEM_MENU,
  },
  {
    id: "courses", label: "Courses", to: "/app/club/courses", icon: "courses", section: "member",
    subs: [
      { id: "courses-all", label: "All Courses", to: "/app/club/courses", icon: "courses" },
      { id: "courses-progress", label: "In Progress", to: "/app/club/courses", icon: "clock" },
      { id: "courses-done", label: "Completed", to: "/app/club/courses", icon: "check" },
    ],
    menu: DEFAULT_ITEM_MENU,
  },
  {
    id: "coaching", label: "Coaching", to: "/app/club/coaching", icon: "coaching", section: "member",
    subs: [
      { id: "coaching-programs", label: "All Programs", to: "/app/club/coaching", icon: "users" },
      { id: "coaching-sessions", label: "1:1 Sessions", to: "/app/club/coaching", icon: "user" },
      { id: "coaching-bookings", label: "Bookings", to: "/app/calendar", icon: "calendar-days" },
    ],
    menu: DEFAULT_ITEM_MENU,
  },
  {
    id: "events", label: "Events", to: "/app/club/events", icon: "events", section: "member",
    subs: [
      { id: "events-upcoming", label: "Upcoming", to: "/app/club/events", icon: "calendar-clock" },
      { id: "events-past", label: "Past", to: "/app/club/events", icon: "calendar-check" },
    ],
    menu: DEFAULT_ITEM_MENU,
  },
  {
    id: "resources", label: "Resources", to: "/app/club/resources", icon: "resources", section: "member",
    subs: [
      { id: "resources-library", label: "Library", to: "/app/club/resources", icon: "library" },
      { id: "resources-templates", label: "Templates", to: "/app/club/resources", icon: "file" },
      { id: "resources-links", label: "Links", to: "/app/club/resources", icon: "link" },
      { id: "resources-downloads", label: "Downloads", to: "/app/club/resources", icon: "download" },
    ],
    menu: DEFAULT_ITEM_MENU,
  },
  {
    id: "apps", label: "Apps", to: "/app/apps", icon: "apps", section: "member",
    subs: [],
    menu: DEFAULT_ITEM_MENU,
  },
  {
    id: "members", label: "Members", to: "/app/club/members", icon: "members", section: "member",
    subs: [
      { id: "members-all", label: "All Members", to: "/app/club/members", icon: "users" },
      { id: "members-online", label: "Online", to: "/app/club/members", icon: "coaching" },
      { id: "members-admins", label: "Admins", to: "/app/club/members", icon: "shield" },
    ],
    menu: DEFAULT_ITEM_MENU,
  },
];

/** Advisors Club system tools. Not customizable member navigation. */
export const SYSTEM_NAV: NavItem[] = [
  {
    id: "ai", label: "AI", to: "/app/aiva", icon: "ai", section: "system",
    subs: [], menu: [],
  },
  {
    id: "manage", label: "Manage", to: "/app/manage", icon: "manage", section: "system",
    subs: [], menu: [],
  },
];

/** Onboarding item — surfaced only while setup is incomplete. */
export const ONBOARDING_NAV: NavItem = {
  id: "getting-started", label: "Getting Started", to: "/app/getting-started", icon: "rocket",
  section: "system", subs: [], menu: [],
};

/**
 * Apply admin overrides (rename / hide / reorder) to a nav list.
 * Overrides are empty today; the admin editor lands in the next task.
 */
export function resolveNav(items: NavItem[], overrides: NavOverride[] = []): NavItem[] {
  const byId = new Map(overrides.map(o => [o.id, o]));
  return items
    .map((item, index) => {
      const o = byId.get(item.id);
      return {
        ...item,
        label: o?.label ?? item.label,
        icon: o?.icon ?? item.icon,
        hidden: o?.hidden ?? item.hidden,
        _order: o?.order ?? index,
      };
    })
    .filter(i => !i.hidden)
    .sort((a, b) => a._order - b._order)
    .map(({ _order, ...item }) => item);
}

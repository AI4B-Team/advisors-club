// Shared leaderboard data — same members shown on the home right panel
// and on the full /app/club/leaderboard page so totals stay in sync.

export type LbMember = {
  id: string;
  name: string;
  handle: string;
  initials: string;
  color: string;
  photo: string;
  country: string;
  points: number;
  streak: number;
  courses: number;
  engagement: number;
  level: number;
  trend: "up" | "down" | "same";
  delta: number;
  badges: string[];
  // Period-specific deltas (points earned during the period)
  weekPoints: number;
  monthPoints: number;
};

export const LB_MEMBERS: LbMember[] = [
  { id:"esther", name:"Esther H.",      handle:"@esther",  initials:"EH", color:"#F5A623", photo:"https://i.pravatar.cc/120?img=47", country:"🇺🇸", points:680, streak:64, courses:14, engagement:96, level:22, trend:"up",   delta:3, badges:["🔥","⭐","👑","💎"], weekPoints:48, monthPoints:210 },
  { id:"robert", name:"Robert Fox",     handle:"@robert",  initials:"RF", color:"#7BA77B", photo:"https://i.pravatar.cc/120?img=12", country:"🇺🇸", points:530, streak:51, courses:12, engagement:92, level:19, trend:"up",   delta:2, badges:["🔥","⭐","👑"],      weekPoints:40, monthPoints:180 },
  { id:"jenny",  name:"Jenny W.",       handle:"@jenny",   initials:"JW", color:"#8B5A4A", photo:"https://i.pravatar.cc/120?img=45", country:"🇨🇦", points:420, streak:47, courses:10, engagement:88, level:17, trend:"same", delta:0, badges:["🔥","⭐","💎"],      weekPoints:32, monthPoints:150 },
  { id:"dustin", name:"Dustin Gedlich", handle:"@dustin",  initials:"DG", color:"#A85A3A", photo:"https://i.pravatar.cc/80?img=33",  country:"🇺🇸", points:400, streak:42, courses:9,  engagement:84, level:16, trend:"up",   delta:1, badges:["🔥","⭐"],            weekPoints:28, monthPoints:140 },
  { id:"arielle",name:"Arielle Mason",  handle:"@arielle", initials:"AM", color:"#D4A574", photo:"https://i.pravatar.cc/80?img=49",  country:"🇬🇧", points:350, streak:38, courses:8,  engagement:80, level:15, trend:"down", delta:1, badges:["🔥","⭐"],            weekPoints:24, monthPoints:120 },
  { id:"jasper", name:"Jasper Lin",     handle:"@jasper",  initials:"JL", color:"#5BA4D4", photo:"https://i.pravatar.cc/80?img=15",  country:"🇸🇬", points:345, streak:36, courses:8,  engagement:78, level:14, trend:"up",   delta:2, badges:["🔥","⭐"],            weekPoints:22, monthPoints:115 },
  { id:"camila", name:"Camila Ortiz",   handle:"@camila",  initials:"CO", color:"#9CA3AF", photo:"https://i.pravatar.cc/80?img=44",  country:"🇲🇽", points:320, streak:33, courses:7,  engagement:74, level:13, trend:"same", delta:0, badges:["🔥","⭐"],            weekPoints:20, monthPoints:105 },
  { id:"noor",   name:"Noor Hassan",    handle:"@noor",    initials:"NH", color:"#06B6D4", photo:"https://i.pravatar.cc/80?img=20",  country:"🇦🇪", points:295, streak:30, courses:7,  engagement:72, level:12, trend:"up",   delta:1, badges:["🔥","⭐"],            weekPoints:18, monthPoints:96  },
  { id:"yuki",   name:"Yuki Tanaka",    handle:"@yuki",    initials:"YT", color:"#EC4899", photo:"https://i.pravatar.cc/80?img=23",  country:"🇯🇵", points:270, streak:28, courses:6,  engagement:70, level:11, trend:"same", delta:0, badges:["🔥"],                weekPoints:16, monthPoints:88  },
  { id:"maya",   name:"Maya Patel",     handle:"@maya",    initials:"MP", color:"#8B5CF6", photo:"https://i.pravatar.cc/80?img=26",  country:"🇮🇳", points:245, streak:26, courses:6,  engagement:68, level:10, trend:"up",   delta:1, badges:["🔥"],                weekPoints:14, monthPoints:80  },
  { id:"jonas",  name:"Jonas Weber",    handle:"@jonas",   initials:"JW", color:"#F97316", photo:"https://i.pravatar.cc/80?img=14",  country:"🇩🇪", points:225, streak:24, courses:5,  engagement:65, level:9,  trend:"down", delta:1, badges:["🔥"],                weekPoints:12, monthPoints:72  },
  { id:"aria",   name:"Aria Kowalski",  handle:"@aria",    initials:"AK", color:"#10B981", photo:"https://i.pravatar.cc/80?img=29",  country:"🇵🇱", points:205, streak:22, courses:5,  engagement:62, level:8,  trend:"up",   delta:2, badges:["🔥"],                weekPoints:10, monthPoints:65  },
];

// "You" member used on the leaderboard page only
export const ME_MEMBER: LbMember = {
  id:"me", name:"You", handle:"@you", initials:"YO", color:"#0EA5E9",
  photo:"https://i.pravatar.cc/80?img=58", country:"🌍",
  points:284, streak:42, courses:11, engagement:76, level:7,
  trend:"up", delta:3, badges:["🔥","⭐"], weekPoints:18, monthPoints:84,
};

// Level distribution (Skool-style: % of members at each level)
export const LB_LEVELS = [
  { level:1, pct:83, label:"" },
  { level:2, pct:11, label:"" },
  { level:3, pct:3,  label:"" },
  { level:4, pct:1,  label:"" },
  { level:5, pct:1,  label:'Unlock "BONUS 🎁 Exclusive Strategies"' },
  { level:6, pct:1,  label:"Unlock Chat with members" },
  { level:7, pct:0,  label:"", locked:true },
  { level:8, pct:0,  label:"", locked:true },
  { level:9, pct:0,  label:"", locked:true },
];

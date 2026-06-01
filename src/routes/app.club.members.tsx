import { createFileRoute } from "@tanstack/react-router";
import { Users, List, Map as MapIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { ClubStub } from "@/components/ClubStub";
import { LEADERBOARD } from "@/lib/leaderboard-data";

export const Route = createFileRoute("/app/club/members")({
  head: () => ({ meta: [{ title: "Members — AdvisorsClub" }, { name: "description", content: "Your full member CRM — filter, message, export and view profiles." }] }),
  component: MembersPage,
});

type View = "list" | "map";

function MembersPage() {
  const [view, setView] = useState<View>("list");

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,gap:12,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"#F3F0FF",color:"#7C3AED",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Users size={20}/>
          </div>
          <div>
            <div style={{fontSize:18,fontWeight:800,color:"#111827",lineHeight:1.1}}>Members</div>
            <div style={{fontSize:12,color:"#6B7280"}}>Browse your community by list or location</div>
          </div>
        </div>
        <div style={{display:"inline-flex",background:"#F3F4F6",borderRadius:10,padding:4,gap:2}}>
          <TabBtn active={view==="list"} onClick={()=>setView("list")} icon={<List size={14}/>} label="List"/>
          <TabBtn active={view==="map"} onClick={()=>setView("map")} icon={<MapIcon size={14}/>} label="Map"/>
        </div>
      </div>

      {view === "list" ? (
        <ClubStub
          icon={<Users size={26}/>}
          title="Members"
          noun="member"
          blurb="Sortable member table, detail slide-out, level & badge display, direct messaging, CSV export, and bulk actions."
          features={["Sortable table","Detail slide-out","Levels & badges","Direct message","CSV export","Bulk actions"]}
          aivaPrompts={["Draft a welcome DM sequence","Segment my most engaged members","Write a re-engagement message"]}
        />
      ) : (
        <MembersMap/>
      )}
    </div>
  );
}

function TabBtn({active,onClick,icon,label}:{active:boolean;onClick:()=>void;icon:React.ReactNode;label:string}) {
  return (
    <button onClick={onClick} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,border:0,background:active?"#fff":"transparent",color:active?"#111827":"#6B7280",fontSize:13,fontWeight:600,cursor:"pointer",boxShadow:active?"0 1px 2px rgba(0,0,0,.06)":"none"}}>
      {icon} {label}
    </button>
  );
}

// Approximate country centroids (lat, lng)
const COUNTRY_COORDS: Record<string,{lat:number;lng:number;name:string}> = {
  "🇺🇸": { lat: 39.8,  lng: -98.6,  name: "United States" },
  "🇨🇦": { lat: 56.1,  lng: -106.3, name: "Canada" },
  "🇲🇽": { lat: 23.6,  lng: -102.6, name: "Mexico" },
  "🇬🇧": { lat: 54.0,  lng: -2.0,   name: "United Kingdom" },
  "🇩🇪": { lat: 51.2,  lng: 10.5,   name: "Germany" },
  "🇵🇱": { lat: 51.9,  lng: 19.1,   name: "Poland" },
  "🇦🇪": { lat: 23.4,  lng: 53.8,   name: "UAE" },
  "🇮🇳": { lat: 20.6,  lng: 78.9,   name: "India" },
  "🇸🇬": { lat: 1.35,  lng: 103.8,  name: "Singapore" },
  "🇯🇵": { lat: 36.2,  lng: 138.3,  name: "Japan" },
};

function MembersMap() {
  // Aggregate members by country
  const clusters = useMemo(() => {
    const byCountry = new Map<string, typeof LEADERBOARD>();
    LEADERBOARD.forEach(m => {
      if (!COUNTRY_COORDS[m.country]) return;
      const arr = byCountry.get(m.country) ?? [];
      arr.push(m);
      byCountry.set(m.country, arr);
    });
    return Array.from(byCountry.entries()).map(([flag, members]) => ({
      flag,
      members,
      ...COUNTRY_COORDS[flag],
    }));
  }, []);

  const [hovered, setHovered] = useState<string|null>(null);
  const totalPinned = clusters.reduce((a,c)=>a+c.members.length,0);

  return (
    <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:16,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{padding:"14px 18px",borderBottom:"1px solid #F3F4F6",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
        <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>Member Map</div>
        <div style={{fontSize:12,color:"#6B7280"}}>{totalPinned} members across {clusters.length} countries · Locations approximated for privacy</div>
      </div>
      <div style={{position:"relative",width:"100%",aspectRatio:"2 / 1",background:"linear-gradient(180deg,#E0F2FE 0%,#DBEAFE 100%)"}}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/2560px-World_map_-_low_resolution.svg.png"
          alt="World map"
          style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.55,filter:"saturate(.4) brightness(1.05)",pointerEvents:"none"}}
        />
        {clusters.map(c => {
          const left = ((c.lng + 180) / 360) * 100;
          const top = ((90 - c.lat) / 180) * 100;
          const count = c.members.length;
          const size = Math.min(56, 26 + count * 4);
          const isHover = hovered === c.flag;
          return (
            <button
              key={c.flag}
              onMouseEnter={()=>setHovered(c.flag)}
              onMouseLeave={()=>setHovered(null)}
              style={{position:"absolute",left:`${left}%`,top:`${top}%`,transform:"translate(-50%,-50%)",width:size,height:size,borderRadius:"50%",border:"2px solid #fff",background:"#111827",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:isHover?"0 8px 24px rgba(0,0,0,.35)":"0 4px 12px rgba(0,0,0,.25)",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform .15s, box-shadow .15s",zIndex:isHover?5:1,...(isHover?{transform:"translate(-50%,-50%) scale(1.1)"}:{}) }}
              aria-label={`${count} members in ${c.name}`}
            >
              {count}
            </button>
          );
        })}
        {hovered && (() => {
          const c = clusters.find(x => x.flag === hovered);
          if (!c) return null;
          const left = ((c.lng + 180) / 360) * 100;
          const top = ((90 - c.lat) / 180) * 100;
          return (
            <div style={{position:"absolute",left:`${left}%`,top:`calc(${top}% + 36px)`,transform:"translate(-50%,0)",background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,boxShadow:"0 10px 30px -10px rgba(0,0,0,.25)",padding:"10px 12px",minWidth:180,zIndex:10,pointerEvents:"none"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#111827",marginBottom:6,display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:16}}>{c.flag}</span> {c.name} · {c.members.length}
              </div>
              <div style={{display:"flex",gap:-4}}>
                {c.members.slice(0,5).map((m,i) => (
                  <img key={m.id} src={m.photo} alt={m.name} style={{width:24,height:24,borderRadius:"50%",border:"2px solid #fff",marginLeft:i===0?0:-6,objectFit:"cover"}}/>
                ))}
                {c.members.length > 5 && (
                  <div style={{width:24,height:24,borderRadius:"50%",background:"#F3F4F6",color:"#6B7280",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #fff",marginLeft:-6}}>+{c.members.length-5}</div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
      <div style={{padding:"12px 18px",borderTop:"1px solid #F3F4F6",display:"flex",gap:8,flexWrap:"wrap"}}>
        {clusters.sort((a,b)=>b.members.length-a.members.length).map(c => (
          <button
            key={c.flag}
            onMouseEnter={()=>setHovered(c.flag)}
            onMouseLeave={()=>setHovered(null)}
            style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 10px",borderRadius:999,background:hovered===c.flag?"#111827":"#F9FAFB",color:hovered===c.flag?"#fff":"#111827",border:"1px solid #E5E7EB",fontSize:12,fontWeight:600,cursor:"pointer"}}
          >
            <span style={{fontSize:14}}>{c.flag}</span> {c.name} <span style={{opacity:.6}}>· {c.members.length}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

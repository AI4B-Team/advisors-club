import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { Sparkles, Send, FileText, ListChecks, HelpCircle, Lightbulb, ClipboardList, Loader2 } from "lucide-react";
import { aivaLessonAssistant } from "@/lib/ai.functions";

type Action = "summarize" | "action_plan" | "quiz" | "explain_simpler" | "worksheet";
type Msg = { role: "user" | "assistant"; content: string };

const PRESETS: { key: Action; label: string; icon: React.ReactNode; userLabel: string }[] = [
  { key: "summarize", label: "Summarize", icon: <FileText size={13}/>, userLabel: "Summarize this lesson" },
  { key: "action_plan", label: "Create Action Plan", icon: <ListChecks size={13}/>, userLabel: "Create an action plan" },
  { key: "quiz", label: "Quiz Me", icon: <HelpCircle size={13}/>, userLabel: "Quiz me on this lesson" },
  { key: "explain_simpler", label: "Explain Simpler", icon: <Lightbulb size={13}/>, userLabel: "Explain this simpler" },
  { key: "worksheet", label: "Generate Worksheet", icon: <ClipboardList size={13}/>, userLabel: "Generate a worksheet" },
];

export function AivaLessonAssistant({
  courseTitle,
  moduleTitle,
  lessonTitle,
  lessonDescription = "",
}: {
  courseTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  lessonDescription?: string;
}) {
  const ask = useServerFn(aivaLessonAssistant);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: Action | "ask", question?: string, userBubble?: string) {
    if (loading) return;
    const bubble = userBubble ?? question ?? "";
    if (action === "ask" && !bubble.trim()) return;
    setError(null);
    const history = messages.slice(-10);
    const nextMsgs: Msg[] = [...messages, { role: "user", content: bubble }];
    setMessages(nextMsgs);
    setInput("");
    setLoading(true);
    try {
      const res = await ask({ data: {
        courseTitle, moduleTitle, lessonTitle, lessonDescription,
        action, question: question ?? "", history,
      }});
      if (res.error) {
        setError(res.error);
        setMessages(m => m.slice(0, -1));
      } else {
        setMessages(m => [...m, { role: "assistant", content: res.reply || "(no response)" }]);
      }
    } catch (e) {
      console.error(e);
      setError("AIVA is unavailable right now.");
      setMessages(m => m.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{marginTop:24,border:"1px solid #E5E7EB",borderRadius:14,overflow:"hidden",background:"#fff"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:"linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 60%, #FDF4FF 100%)",borderBottom:"1px solid #E5E7EB"}}>
        <div style={{width:30,height:30,borderRadius:8,background:"#111827",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}><Sparkles size={15}/></div>
        <div style={{minWidth:0}}>
          <div style={{fontSize:13.5,fontWeight:800,color:"#111827",display:"flex",alignItems:"center",gap:6}}>AIVA Lesson Assistant</div>
          <div style={{fontSize:11.5,color:"#6B7280"}}>Ask anything about <strong>{lessonTitle}</strong></div>
        </div>
      </div>

      {messages.length > 0 && (
        <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:12,maxHeight:520,overflowY:"auto"}}>
          {messages.map((m, i) => m.role === "user" ? (
            <div key={i} style={{alignSelf:"flex-end",maxWidth:"85%",background:"#111827",color:"#fff",padding:"8px 12px",borderRadius:12,fontSize:13.5,lineHeight:1.45,whiteSpace:"pre-wrap"}}>{m.content}</div>
          ) : (
            <div key={i} style={{alignSelf:"flex-start",maxWidth:"95%",background:"#F9FAFB",border:"1px solid #F3F4F6",padding:"10px 14px",borderRadius:12,fontSize:13.5,color:"#111827",lineHeight:1.55}}>
              <div className="aiva-md"><ReactMarkdown>{m.content}</ReactMarkdown></div>
            </div>
          ))}
          {loading && (
            <div style={{alignSelf:"flex-start",display:"inline-flex",alignItems:"center",gap:6,color:"#6B7280",fontSize:12.5,padding:"6px 10px"}}>
              <Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/> AIVA is thinking…
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{padding:"8px 16px",background:"#FEF2F2",borderTop:"1px solid #FECACA",color:"#991B1B",fontSize:12}}>{error}</div>
      )}

      <div style={{padding:"12px 16px",borderTop: messages.length > 0 ? "1px solid #F3F4F6" : "none"}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
          {PRESETS.map(p => (
            <button key={p.key} onClick={()=>run(p.key, undefined, p.userLabel)} disabled={loading}
              style={{display:"inline-flex",alignItems:"center",gap:5,padding:"6px 11px",borderRadius:999,border:"1px solid #E5E7EB",background:"#fff",color:"#374151",fontSize:12,fontWeight:600,cursor:loading?"wait":"pointer"}}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>
        <form onSubmit={(e)=>{e.preventDefault(); run("ask", input, input);}} style={{display:"flex",gap:8,alignItems:"center",background:"#F9FAFB",border:"1px solid #E5E7EB",borderRadius:10,padding:"6px 6px 6px 12px"}}>
          <input
            value={input}
            onChange={e=>setInput(e.target.value)}
            placeholder="Ask anything about this lesson…"
            disabled={loading}
            style={{flex:1,border:0,outline:"none",background:"transparent",fontSize:13.5,color:"#111827"}}
          />
          <button type="submit" disabled={loading || !input.trim()}
            style={{display:"inline-flex",alignItems:"center",gap:5,padding:"7px 12px",border:0,borderRadius:8,background:"#111827",color:"#fff",fontSize:12.5,fontWeight:700,cursor:loading||!input.trim()?"not-allowed":"pointer",opacity:loading||!input.trim()?.5:1}}>
            {loading ? <Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/> : <Send size={13}/>} Ask
          </button>
        </form>
      </div>
    </div>
  );
}

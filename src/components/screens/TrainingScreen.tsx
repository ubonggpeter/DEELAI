"use client";
import { useState, useEffect } from "react";
import {
  BookOpen, Square, Tag, CheckCircle, Monitor, Trophy, Microscope,
  Target, Zap, Lock, BarChart2, AlertTriangle, ChevronRight, Check,
  Frown, ArrowLeft, FileText, ExternalLink, Loader2, AlertCircle,
} from "lucide-react";
import { MODULES as STATIC_MODULES } from "@/lib/data";
import { User } from "@/lib/types";
import Bar from "@/components/atoms/Bar";
import Chip from "@/components/atoms/Chip";
import Spinner from "@/components/atoms/Spinner";

interface Props {
  user: User;
  setUser: (fn: (u: User) => User) => void;
}

interface QuizQuestion { id: string; q: string; opts: string[]; ans: number; }
interface TrainingDoc { id: string; title: string; url: string; type: string; addedAt: string; }
interface ModuleDoc { id: string; moduleId: number; title: string; url: string; type: string; }
interface DynModule { id: number; sortOrder: number; title: string; dur: string; lessons: number; desc: string; topics: string[]; content: string; }

type View = "list" | "module" | "quiz" | "cert" | "lens";

const moduleIcons: Record<number, React.ReactNode> = {
  1: <BookOpen size={20} />,
  2: <Square size={20} />,
  3: <Tag size={20} />,
  4: <CheckCircle size={20} />,
  5: <Monitor size={20} />,
};

function getIcon(id: number) {
  return moduleIcons[id] ?? <BookOpen size={20} />;
}

export default function TrainingScreen({ user, setUser }: Props) {
  const [view, setView]       = useState<View>("list");
  const [modId, setModId]     = useState<number | null>(null);
  const [qi, setQi]           = useState(0);
  const [sel, setSel]         = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ q: number; sel: number; ans: number }[]>([]);
  const [quizDone, setQuizDone] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [docs, setDocs]         = useState<TrainingDoc[]>([]);
  const [moduleDocs, setModuleDocs] = useState<ModuleDoc[]>([]);
  const [modules, setModules]   = useState<DynModule[]>([]);
  const [lensLink, setLensLink] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  // Track which docs the user has opened/downloaded this session
  const [openedDocIds, setOpenedDocIds] = useState<Set<string>>(new Set());
  // Warning dialog state when user tries to mark complete without opening resources
  const [showReadWarning, setShowReadWarning] = useState(false);
  const [pendingCompleteId, setPendingCompleteId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/training-content").then((r) => r.json()),
      user.channelId ? fetch(`/api/channel/${user.channelId}`).then((r) => r.json()) : Promise.resolve(null),
    ]).then(([trainingData, channelData]) => {
      setQuizQuestions(trainingData.quizQuestions ?? []);
      setDocs(trainingData.trainingDocs ?? []);
      setModuleDocs(trainingData.moduleDocs ?? []);
      // Use DB modules if available, fall back to static
      const dynMods: DynModule[] = trainingData.trainingModules ?? [];
      if (dynMods.length > 0) {
        setModules(dynMods);
      } else {
        setModules(STATIC_MODULES.map((m) => ({ ...m, content: "", sortOrder: m.id - 1 })));
      }
      if (channelData?.lensPaystackLink) setLensLink(channelData.lensPaystackLink);
    }).finally(() => setLoadingData(false));
  }, [user.channelId]);

  const done = user.completedModules || [];
  const pct = modules.length > 0 ? Math.round((done.length / modules.length) * 100) : 0;
  const allDone = modules.length > 0 && done.length >= modules.length;
  const activeQuiz = quizQuestions.length > 0 ? quizQuestions : [];

  async function persistTraining(data: Partial<{ quizPassed: boolean; lensActivated: boolean; trainingDone: boolean; completedModules: number[] }>) {
    await fetch("/api/auth/training", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  function completeModule(id: number) {
    if (done.includes(id)) return;
    const newModules = [...done, id];
    setUser(u => ({ ...u, completedModules: newModules }));
    persistTraining({ completedModules: newModules });
    setView("list");
  }

  function handleMarkComplete(id: number) {
    // Warn if there are general docs OR module-specific docs and none have been opened
    const thisModuleDocs = moduleDocs.filter(d => d.moduleId === id);
    const hasResources = docs.length > 0 || thisModuleDocs.length > 0;
    if (hasResources && openedDocIds.size === 0) {
      setPendingCompleteId(id);
      setShowReadWarning(true);
      return;
    }
    completeModule(id);
  }

  function confirmCompleteAnyway() {
    setShowReadWarning(false);
    if (pendingCompleteId !== null) completeModule(pendingCompleteId);
    setPendingCompleteId(null);
  }

  function handleDocOpen(docId: string) {
    setOpenedDocIds((prev) => new Set([...Array.from(prev), docId]));
  }

  function handleAnswer(i: number) {
    if (sel !== null || activeQuiz.length === 0) return;
    setSel(i);
    setTimeout(() => {
      const newA = [...answers, { q: qi, sel: i, ans: activeQuiz[qi].ans }];
      setAnswers(newA);
      if (qi < activeQuiz.length - 1) {
        setQi(qi + 1);
        setSel(null);
      } else {
        const score = newA.filter(a => a.sel === a.ans).length;
        setQuizDone(true);
        if (score >= Math.ceil(activeQuiz.length * 0.8)) {
          setUser(u => ({ ...u, quizPassed: true }));
          persistTraining({ quizPassed: true });
          setView("cert");
        }
      }
    }, 650);
  }

  function activateLens() {
    if (lensLink) {
      window.open(lensLink, "_blank");
      setUser(u => ({ ...u, lensActivated: true, trainingDone: true }));
      persistTraining({ lensActivated: true, trainingDone: true });
      setView("list");
    } else {
      setUser(u => ({ ...u, lensActivated: true, trainingDone: true }));
      persistTraining({ lensActivated: true, trainingDone: true });
      setView("list");
    }
  }

  if (loadingData) {
    return (
      <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"100vh", background:"var(--bg)" }}>
        <Loader2 size={28} color="var(--cyan)" style={{ animation:"spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Read-warning overlay ──────────────────────────────────────────────
  const ReadWarningOverlay = showReadWarning ? (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"rgba(6,10,18,0.88)", display:"flex", alignItems:"center", justifyContent:"center", padding:20,
    }}>
      <div style={{
        background:"var(--s1)", border:"1px solid rgba(255,184,0,.4)", borderRadius:18,
        padding:"28px 24px", maxWidth:420, width:"100%",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:"rgba(255,184,0,.12)", border:"1px solid rgba(255,184,0,.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <AlertTriangle size={22} color="#FFB800" />
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:16, color:"var(--txt)", fontFamily:"system-ui" }}>Haven&apos;t Read the Resources?</div>
            <div style={{ fontSize:12, color:"var(--txt3)", marginTop:2 }}>This may affect your work quality</div>
          </div>
        </div>
        <div style={{ color:"var(--txt2)", fontSize:13, lineHeight:1.7, marginBottom:20 }}>
          You haven&apos;t opened any of the training resources for this module yet. These materials contain critical instructions and guidelines.<br /><br />
          <strong style={{ color:"var(--txt)" }}>Skipping them risks:</strong>
          <ul style={{ margin:"8px 0 0 16px", paddingLeft:4, color:"var(--txt2)" }}>
            <li>Failing annotation quality checks</li>
            <li>Rejected job submissions</li>
            <li>Accuracy penalties that reduce your earnings</li>
          </ul>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <button
            onClick={() => setShowReadWarning(false)}
            style={{ background:"linear-gradient(135deg,#00D4FF,#0055DD)", color:"#fff", border:"none", borderRadius:10, padding:"13px", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"system-ui" }}
          >
            Go Back &amp; Read Resources First
          </button>
          <button
            onClick={confirmCompleteAnyway}
            style={{ background:"none", color:"var(--txt3)", border:"1px solid var(--b1)", borderRadius:10, padding:"11px", fontWeight:500, fontSize:13, cursor:"pointer" }}
          >
            Continue Anyway (I understand the risk)
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (view === "cert") return (
    <>
      {ReadWarningOverlay}
      <div className="animate-certIn min-h-screen" style={{ background: "var(--bg)" }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div
            className="relative overflow-hidden text-center mb-5 rounded-2xl sm:rounded-3xl"
            style={{
              background: "linear-gradient(145deg,#0C1A32,#101E3A)",
              border: "1px solid rgba(255,184,0,.35)",
              padding: "28px 22px",
            }}
          >
            <div
              className="absolute pointer-events-none"
              style={{
                top: -50, left: "50%", transform: "translateX(-50%)",
                width: 200, height: 200,
                background: "radial-gradient(circle,rgba(255,184,0,.15) 0%,transparent 70%)",
              }}
            />
            <Trophy size={44} color="#FFB800" className="mx-auto mb-3" />
            <div className="text-[10px] font-mono tracking-[2px] mb-2" style={{ color: "#FFB800", letterSpacing: 2 }}>
              CERTIFICATE OF COMPLETION
            </div>
            <div className="font-black text-xl sm:text-2xl leading-snug mb-2 text-white" style={{ fontFamily: "system-ui,sans-serif" }}>
              DEELAi Certified<br />Image Annotator
            </div>
            <div style={{ width: 60, height: 2, background: "linear-gradient(90deg,#FFB800,#FF8C00)", margin: "14px auto", borderRadius: 2 }} />
            <div className="text-sm mb-1" style={{ color: "var(--txt2)" }}>This certifies that</div>
            <div className="font-bold text-lg sm:text-xl mb-1" style={{ color: "#FFB800", fontFamily: "system-ui,sans-serif" }}>
              {user.name}
            </div>
            <div className="text-sm mb-4" style={{ color: "var(--txt2)" }}>
              has successfully completed the DEELAi Image Annotation Certification with a passing score.
            </div>
            <div
              className="flex justify-between font-mono text-[10px]"
              style={{ color: "var(--txt3)", borderTop: "1px solid var(--b2)", paddingTop: 14 }}
            >
              <span>CERT-{Date.now().toString().slice(-8)}</span>
              <span>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}</span>
            </div>
          </div>

          <div
            className="rounded-2xl p-5 sm:p-6"
            style={{
              background: "linear-gradient(145deg,rgba(0,212,255,.07),rgba(0,212,255,.02))",
              border: "1px solid rgba(0,212,255,.25)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Microscope size={30} color="var(--cyan)" />
              <div>
                <div className="font-black text-base sm:text-lg text-white" style={{ fontFamily: "system-ui,sans-serif" }}>
                  Activate Your Annotation Lens
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--txt2)" }}>One-time $3 · Required to go live</div>
              </div>
            </div>
            <div className="text-sm leading-relaxed mb-5" style={{ color: "var(--txt2)" }}>
              Your <strong className="text-white">Virtual Annotation Lens</strong> calibrates your visual precision to match AI model standards. Every certified annotator activates one before their first job.
            </div>
            <button
              onClick={() => setView("lens")}
              className="w-full flex items-center justify-center gap-2 font-bold text-white min-h-[52px] rounded-xl text-sm sm:text-base"
              style={{
                border: "none", cursor: "pointer",
                background: "linear-gradient(135deg,#00D4FF,#0055DD)",
                fontFamily: "system-ui,sans-serif",
                boxShadow: "0 8px 28px rgba(0,212,255,.3)",
              }}
            >
              <Microscope size={18} />
              Activate Annotation Lens — $3
              <ChevronRight size={16} />
            </button>
            <div className="text-center font-mono text-[10px] mt-2" style={{ color: "var(--txt3)" }}>
              One-time · Non-refundable · Instant activation
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (view === "lens") return (
    <>
      {ReadWarningOverlay}
      <div className="animate-fadeUp min-h-screen" style={{ background: "var(--bg)" }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <button
            onClick={() => setView("cert")}
            className="flex items-center gap-1.5 mb-6 text-sm min-h-[44px]"
            style={{ background: "none", border: "none", color: "var(--txt2)", cursor: "pointer" }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="text-center mb-7">
            <div className="relative inline-block">
              <div
                className="flex items-center justify-center mx-auto animate-lensGlow"
                style={{
                  width: 120, height: 120, borderRadius: "50%",
                  background: "linear-gradient(135deg,rgba(0,212,255,.15),rgba(0,85,221,.15))",
                  border: "2px solid rgba(0,212,255,.5)",
                }}
              >
                <Microscope size={52} color="var(--cyan)" />
              </div>
              <div className="absolute animate-lensRipple" style={{ inset: -10, borderRadius: "50%", border: "1px solid rgba(0,212,255,.2)" }} />
              <div className="absolute animate-lensRipple2" style={{ inset: -22, borderRadius: "50%", border: "1px solid rgba(0,212,255,.1)" }} />
            </div>
            <div className="font-black mt-5 text-xl sm:text-2xl text-white" style={{ fontFamily: "system-ui,sans-serif" }}>
              Virtual Annotation Lens
            </div>
            <div className="font-black mt-3 text-5xl sm:text-6xl" style={{ color: "var(--cyan)", fontFamily: "system-ui,sans-serif" }}>
              $3
            </div>
            <div className="font-mono text-[10px] tracking-[2px]" style={{ color: "var(--txt3)" }}>ONE-TIME ACTIVATION FEE</div>
          </div>

          <div className="rounded-2xl p-4 sm:p-5 mb-4" style={{ background: "var(--s1)", border: "1px solid var(--b2)" }}>
            {[
              { Icon: Target, t: "Precision Targeting", d: "AI-calibrated grid overlay for exact bounding boxes" },
              { Icon: Zap, t: "Priority Job Queue", d: "Faster batch delivery for Lens-activated workers" },
              { Icon: Lock, t: "Permanent Access", d: "Pay once — your Lens is yours forever" },
              { Icon: BarChart2, t: "Live Accuracy Dashboard", d: "Real-time quality feedback on every annotation" },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="flex gap-3 items-start mb-4 last:mb-0">
                <Icon size={20} color="var(--cyan)" className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-white">{t}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--txt2)" }}>{d}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={activateLens}
            className="w-full flex items-center justify-center gap-2.5 font-bold text-white min-h-[52px] rounded-xl text-base"
            style={{
              border: "none", cursor: "pointer",
              background: "linear-gradient(135deg,#00D4FF,#0055DD)",
              fontFamily: "system-ui,sans-serif",
              boxShadow: "0 8px 32px rgba(0,212,255,.3)",
            }}
          >
            <Microscope size={18} /> Pay $3 &amp; Activate <ChevronRight size={16} />
          </button>
          {lensLink && (
            <p className="text-center text-[11px] mt-2" style={{ color: "var(--txt3)" }}>
              You will be redirected to your channel&apos;s secure payment page.
            </p>
          )}
        </div>
      </div>
    </>
  );

  if (view === "quiz") {
    if (quizDone) {
      const score = answers.filter(a => a.sel === a.ans).length;
      const passScore = Math.ceil(activeQuiz.length * 0.8);
      return (
        <>
          {ReadWarningOverlay}
          <div className="animate-fadeUp min-h-screen" style={{ background: "var(--bg)" }}>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-center">
              {score >= passScore
                ? <Trophy size={64} color="#FFB800" className="mx-auto" />
                : <Frown size={64} color="#FF4D6D" className="mx-auto" />
              }
              <div
                className="font-black mt-4 text-2xl sm:text-3xl"
                style={{ color: score >= passScore ? "#00E5A0" : "#FF4D6D", fontFamily: "system-ui,sans-serif" }}
              >
                {score >= passScore ? "You're Certified!" : "Not Quite"}
              </div>
              <div className="text-sm mt-2" style={{ color: "var(--txt2)" }}>
                Score: <strong className="text-white">{score}/{activeQuiz.length}</strong> · Pass: {passScore}/{activeQuiz.length}
              </div>
              {score < passScore && (
                <button
                  onClick={() => { setQi(0); setSel(null); setAnswers([]); setQuizDone(false); }}
                  className="mt-6 font-bold text-black min-h-[52px] px-10 rounded-xl"
                  style={{ background: "var(--cyan)", border: "none", cursor: "pointer", fontFamily: "system-ui,sans-serif", fontSize: 15 }}
                >
                  Retake Quiz
                </button>
              )}
            </div>
          </div>
        </>
      );
    }
    if (activeQuiz.length === 0) {
      return (
        <>
          {ReadWarningOverlay}
          <div className="animate-fadeUp min-h-screen" style={{ background: "var(--bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ textAlign:"center", color:"var(--txt2)" }}>No quiz questions available yet. Check back soon.</div>
          </div>
        </>
      );
    }
    const q = activeQuiz[qi];
    return (
      <>
        {ReadWarningOverlay}
        <div className="animate-fadeUp min-h-screen" style={{ background: "var(--bg)" }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <button
              onClick={() => setView("list")}
              className="flex items-center gap-1.5 mb-5 text-sm min-h-[44px]"
              style={{ background: "none", border: "none", color: "var(--txt2)", cursor: "pointer" }}
            >
              <ArrowLeft size={14} /> Back
            </button>
            <div className="font-mono text-[10px] tracking-[1px] mb-2" style={{ color: "var(--cyan)" }}>
              CERTIFICATION QUIZ · {qi + 1}/{activeQuiz.length}
            </div>
            <Bar pct={(qi / activeQuiz.length) * 100} color="var(--cyan)" h={3} />
            <div className="font-bold text-lg sm:text-xl leading-snug my-5 sm:my-6 text-white" style={{ fontFamily: "system-ui,sans-serif" }}>
              {q.q}
            </div>
            {q.opts.map((o, i) => (
              <div
                key={i}
                onClick={() => sel === null && handleAnswer(i)}
                className="transition-all duration-200 rounded-xl mb-3 px-4 py-3.5 text-sm font-medium min-h-[52px] flex items-center"
                style={{
                  cursor: sel === null ? "pointer" : "default",
                  border: `1px solid ${sel === i ? (i === q.ans ? "#00E5A0" : "#FF4D6D") : "var(--b2)"}`,
                  background: sel === i ? (i === q.ans ? "rgba(0,229,160,.1)" : "rgba(255,77,109,.1)") : "var(--s1)",
                }}
              >
                {o}
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (view === "module") {
    const m = modules.find(x => x.id === modId);
    if (!m) { setView("list"); return null; }
    const isDone = done.includes(m.id);

    // Module-specific resource docs
    const thisModuleDocs = moduleDocs.filter(d => d.moduleId === m.id);
    const ModuleResourcesBlock = thisModuleDocs.length > 0 ? (
      <div style={{ marginTop:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <FileText size={15} color="var(--cyan)" />
          <span className="font-bold text-sm text-white" style={{ fontFamily:"system-ui" }}>Module Resources</span>
          <span style={{ fontSize:11, color:"var(--txt3)" }}>— files specific to this module</span>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {thisModuleDocs.map((doc) => {
            const ext = doc.url.split(".").pop()?.toLowerCase() ?? "pdf";
            const href = `/api/auth/download?url=${encodeURIComponent(doc.url)}`;
            const opened = openedDocIds.has(doc.id);
            return (
              <a
                key={doc.id}
                href={href}
                target="_self"
                rel="noopener noreferrer"
                download
                onClick={() => handleDocOpen(doc.id)}
                style={{
                  background: opened ? "rgba(0,212,255,.06)" : "var(--s2)",
                  border: `1px solid ${opened ? "rgba(0,212,255,.25)" : "var(--b1)"}`,
                  borderRadius:12, padding:"12px 14px",
                  display:"flex", alignItems:"center", gap:12, textDecoration:"none",
                }}
              >
                <FileText size={18} color={opened ? "var(--cyan)" : "var(--cyan)"} style={{ flexShrink:0, opacity: opened ? 1 : 0.7 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:"var(--txt)", fontSize:13, fontWeight:600 }}>{doc.title}</div>
                  <div style={{ color:"var(--txt3)", fontSize:11, textTransform:"uppercase", marginTop:2 }}>{ext}</div>
                </div>
                {opened
                  ? <Check size={14} color="var(--cyan)" style={{ flexShrink:0 }} />
                  : <ExternalLink size={14} color="var(--txt3)" style={{ flexShrink:0 }} />
                }
              </a>
            );
          })}
        </div>
      </div>
    ) : null;

    // General Training Resources block (reused below the button)
    const ResourcesBlock = docs.length > 0 ? (
      <div style={{ marginTop:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <FileText size={15} color="var(--gold)" />
          <span className="font-bold text-sm text-white" style={{ fontFamily:"system-ui" }}>Training Resources</span>
          <span style={{ fontSize:11, color:"var(--txt3)" }}>— open before marking complete</span>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {docs.map((doc) => {
            const isFile = doc.type === "pdf" || doc.type === "doc";
            const href = isFile ? `/api/auth/download?url=${encodeURIComponent(doc.url)}` : doc.url;
            const opened = openedDocIds.has(doc.id);
            return (
              <a
                key={doc.id}
                href={href}
                target={isFile ? "_self" : "_blank"}
                rel="noopener noreferrer"
                download={isFile ? true : undefined}
                onClick={() => handleDocOpen(doc.id)}
                style={{
                  background: opened ? "rgba(0,229,160,.06)" : "var(--s2)",
                  border: `1px solid ${opened ? "rgba(0,229,160,.25)" : "var(--b1)"}`,
                  borderRadius:12, padding:"12px 14px",
                  display:"flex", alignItems:"center", gap:12, textDecoration:"none",
                }}
              >
                <FileText size={18} color={opened ? "#00E5A0" : "var(--gold)"} style={{ flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:"var(--txt)", fontSize:13, fontWeight:600 }}>{doc.title}</div>
                  <div style={{ color:"var(--txt3)", fontSize:11, textTransform:"uppercase", marginTop:2 }}>{doc.type}</div>
                </div>
                {opened
                  ? <Check size={14} color="#00E5A0" style={{ flexShrink:0 }} />
                  : <ExternalLink size={14} color="var(--txt3)" style={{ flexShrink:0 }} />
                }
              </a>
            );
          })}
        </div>
      </div>
    ) : null;

    return (
      <>
        {ReadWarningOverlay}
        <div className="animate-fadeUp min-h-screen" style={{ background: "var(--bg)" }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <button
              onClick={() => setView("list")}
              className="flex items-center gap-1.5 mb-5 text-sm min-h-[44px]"
              style={{ background: "none", border: "none", color: "var(--txt2)", cursor: "pointer" }}
            >
              <ArrowLeft size={14} /> Back
            </button>
            <div
              className="flex items-center justify-center mb-3 rounded-2xl"
              style={{
                width: 56, height: 56,
                background: isDone ? "rgba(0,229,160,.1)" : "var(--s2)",
                border: `1px solid ${isDone ? "rgba(0,229,160,.28)" : "var(--b1)"}`,
                color: isDone ? "#00E5A0" : "var(--txt2)",
              }}
            >
              {isDone ? <CheckCircle size={24} color="#00E5A0" /> : getIcon(m.id)}
            </div>
            <div className="font-black text-xl sm:text-2xl mb-1.5 text-white" style={{ fontFamily: "system-ui,sans-serif" }}>
              {m.title}
            </div>
            <div className="text-sm leading-relaxed mb-4" style={{ color: "var(--txt2)" }}>{m.desc}</div>
            <div className="flex gap-2 mb-5">
              <Chip label={`${m.lessons} lessons`} color="var(--cyan)" />
              <Chip label={m.dur} color="#8B5CF6" />
            </div>

            {/* Topic list */}
            <div className="rounded-2xl p-4 mb-5" style={{ background: "var(--s2)" }}>
              {m.topics.map((t, i) => (
                <div
                  key={i}
                  className="flex gap-2.5 items-center py-2.5"
                  style={{ borderBottom: i < m.topics.length - 1 ? "1px solid var(--b1)" : "none" }}
                >
                  {isDone
                    ? <Check size={12} color="#00E5A0" />
                    : <div className="shrink-0" style={{ width: 8, height: 8, borderRadius: "50%", border: "1px solid var(--txt3)" }} />
                  }
                  <span className="text-sm">{t}</span>
                </div>
              ))}
            </div>

            {/* Rich content (if set by admin) */}
            {m.content && (
              <div
                className="rounded-2xl p-4 mb-5 text-sm leading-relaxed"
                style={{ background:"var(--s1)", border:"1px solid var(--b1)", color:"var(--txt2)", whiteSpace:"pre-wrap" }}
              >
                {m.content}
              </div>
            )}

            {/* Mark Complete / Done button */}
            {!isDone ? (
              <button
                onClick={() => handleMarkComplete(m.id)}
                className="w-full flex items-center justify-center gap-2 font-bold text-white min-h-[52px] rounded-xl text-base"
                style={{
                  border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg,#00D4FF,#0055DD)",
                  fontFamily: "system-ui,sans-serif",
                }}
              >
                Mark Complete <Check size={16} />
              </button>
            ) : (
              <div
                className="text-center font-semibold flex items-center justify-center gap-2 min-h-[52px] rounded-xl text-sm"
                style={{ color: "#00E5A0", background: "rgba(0,229,160,.08)", border: "1px solid rgba(0,229,160,.2)" }}
              >
                <CheckCircle size={16} /> Module Completed
              </div>
            )}

            {/* Module-specific resources (shown first, more relevant) */}
            {ModuleResourcesBlock}
            {/* General Training Resources BELOW the complete button */}
            {ResourcesBlock}
          </div>
        </div>
      </>
    );
  }

  // ── List view ────────────────────────────────────────────────────────
  return (
    <>
      {ReadWarningOverlay}
      <div className="animate-fadeUp min-h-screen" style={{ background: "var(--bg)" }}>
        {/* Header */}
        <div
          className="relative"
          style={{
            background: "linear-gradient(145deg,#081428,#0C1E40)",
            borderRadius: "0 0 24px 24px",
            marginBottom: 20,
          }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
            <div className="font-black text-2xl sm:text-3xl text-white mb-1" style={{ fontFamily: "system-ui,sans-serif" }}>
              Training Center
            </div>
            <div className="text-sm mb-4" style={{ color: "var(--txt2)" }}>Free · Mandatory · Self-paced · 6–7 hours</div>
            <div className="flex justify-between mb-1.5">
              <span className="font-mono text-[11px]" style={{ color: "var(--txt2)" }}>PROGRESS</span>
              <span className="font-mono font-semibold text-[11px]" style={{ color: "var(--cyan)" }}>{done.length}/{modules.length} Modules</span>
            </div>
            <Bar pct={pct} color="var(--cyan)" />
            {user.lensActivated && (
              <div
                className="flex items-center gap-2 mt-3 rounded-xl px-3 py-2"
                style={{ background: "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.22)" }}
              >
                <Microscope size={16} color="var(--cyan)" />
                <span className="font-semibold text-xs" style={{ color: "var(--cyan)" }}>Annotation Lens Active · You are live!</span>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 pb-8">
          {!user.lensActivated && (
            <div
              className="flex gap-2.5 items-start mb-5 rounded-xl px-4 py-3"
              style={{ background: "rgba(255,184,0,.08)", border: "1px solid rgba(255,184,0,.2)" }}
            >
              <AlertTriangle size={18} color="#FFB800" className="shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-sm mb-0.5" style={{ color: "#FFB800" }}>Mandatory Before You Earn</div>
                <div className="text-xs leading-relaxed" style={{ color: "var(--txt2)" }}>
                  Training is 100% free. Complete all modules, pass the quiz, then activate your Annotation Lens ($3) to go live.
                </div>
              </div>
            </div>
          )}

          {/* Module list */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
            {modules.map((m, i) => {
              const isDone = done.includes(m.id);
              const locked = i > 0 && !done.includes(modules[i - 1].id);
              return (
                <div
                  key={m.id}
                  onClick={() => !locked && (setModId(m.id), setView("module"))}
                  className="rounded-2xl px-4 py-3.5 transition-all"
                  style={{
                    background: "var(--s1)",
                    border: `1px solid ${isDone ? "rgba(0,229,160,.28)" : "var(--b1)"}`,
                    cursor: locked ? "not-allowed" : "pointer",
                    opacity: locked ? 0.4 : 1,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center shrink-0 rounded-xl"
                      style={{
                        width: 44, height: 44,
                        background: isDone ? "rgba(0,229,160,.1)" : "var(--s2)",
                        border: `1px solid ${isDone ? "rgba(0,229,160,.28)" : "var(--b1)"}`,
                        color: isDone ? "#00E5A0" : "var(--txt2)",
                      }}
                    >
                      {isDone ? <Check size={20} color="#00E5A0" /> : getIcon(m.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-white">{m.title}</div>
                      <div className="font-mono text-[11px] mt-0.5" style={{ color: "var(--txt2)" }}>
                        {m.lessons} lessons · {m.dur}
                      </div>
                    </div>
                    {isDone
                      ? <span className="font-semibold text-xs shrink-0" style={{ color: "#00E5A0" }}>Done</span>
                      : locked
                        ? <Lock size={15} color="var(--txt3)" className="shrink-0" />
                        : <ChevronRight size={14} color="var(--cyan)" className="shrink-0" />
                    }
                  </div>
                </div>
              );
            })}
          </div>

          {/* Certification quiz */}
          <div className="mb-6">
            <div className="font-bold text-base text-white mb-3" style={{ fontFamily: "system-ui,sans-serif" }}>
              Certification Quiz
            </div>
            <div
              className="rounded-2xl p-4 sm:p-5"
              style={{
                background: user.quizPassed ? "rgba(0,229,160,.07)" : "var(--s1)",
                border: `1px solid ${user.quizPassed ? "rgba(0,229,160,.28)" : "rgba(139,92,246,.28)"}`,
              }}
            >
              <div className="flex gap-3 items-center mb-4">
                {user.quizPassed ? <Trophy size={28} color="#FFB800" /> : <CheckCircle size={28} color="#8B5CF6" />}
                <div>
                  <div className="font-semibold text-sm text-white">DEELAi Annotator Certification</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--txt2)" }}>
                    {activeQuiz.length} questions · Pass: {Math.ceil(activeQuiz.length * 0.8)}/{activeQuiz.length} · Free retakes
                  </div>
                </div>
              </div>
              {user.quizPassed ? (
                <>
                  <div className="font-semibold text-xs mb-3" style={{ color: "#00E5A0" }}>
                    Certified — {user.lensActivated ? "Lens active · You are live!" : "Activate your Lens to go live →"}
                  </div>
                  {!user.lensActivated && (
                    <button
                      onClick={() => setView("cert")}
                      className="w-full flex items-center justify-center gap-2 font-bold text-white min-h-[48px] rounded-xl text-sm"
                      style={{
                        border: "none", cursor: "pointer",
                        background: "linear-gradient(135deg,#00D4FF,#0055DD)",
                        fontFamily: "system-ui,sans-serif",
                      }}
                    >
                      <Microscope size={16} /> View Certificate &amp; Activate <ChevronRight size={14} />
                    </button>
                  )}
                </>
              ) : (
                <button
                  disabled={!allDone || activeQuiz.length === 0}
                  onClick={() => { setQi(0); setSel(null); setAnswers([]); setQuizDone(false); setView("quiz"); }}
                  className="w-full font-bold text-white min-h-[48px] rounded-xl text-sm"
                  style={{
                    border: "none",
                    background: (allDone && activeQuiz.length > 0) ? "linear-gradient(135deg,#8B5CF6,#6D28D9)" : "var(--s3)",
                    fontFamily: "system-ui,sans-serif",
                    cursor: (allDone && activeQuiz.length > 0) ? "pointer" : "not-allowed",
                    opacity: (allDone && activeQuiz.length > 0) ? 1 : 0.5,
                  }}
                >
                  {!allDone ? "Complete all modules first" : activeQuiz.length === 0 ? "Quiz not available yet" : "Take Certification Quiz →"}
                </button>
              )}
            </div>
          </div>

          {/* Training documents — list view */}
          {docs.length > 0 && (
            <div>
              <div className="font-bold text-base text-white mb-3" style={{ fontFamily: "system-ui,sans-serif" }}>
                Training Resources
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {docs.map((doc) => {
                  const isFile = doc.type === "pdf" || doc.type === "doc";
                  const href = isFile
                    ? `/api/auth/download?url=${encodeURIComponent(doc.url)}`
                    : doc.url;
                  const opened = openedDocIds.has(doc.id);
                  return (
                    <a
                      key={doc.id}
                      href={href}
                      target={isFile ? "_self" : "_blank"}
                      rel="noopener noreferrer"
                      download={isFile ? true : undefined}
                      onClick={() => handleDocOpen(doc.id)}
                      style={{
                        background: opened ? "rgba(0,229,160,.06)" : "var(--s1)",
                        border: `1px solid ${opened ? "rgba(0,229,160,.2)" : "var(--b1)"}`,
                        borderRadius:12, padding:"12px 14px",
                        display:"flex", alignItems:"center", gap:12, textDecoration:"none",
                      }}
                    >
                      <FileText size={18} color={opened ? "#00E5A0" : "var(--gold)"} style={{ flexShrink:0 }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ color:"var(--txt)", fontSize:13, fontWeight:600 }}>{doc.title}</div>
                        <div style={{ color:"var(--txt3)", fontSize:11, textTransform:"uppercase", marginTop:2 }}>{doc.type}</div>
                      </div>
                      {opened
                        ? <Check size={14} color="#00E5A0" style={{ flexShrink:0 }} />
                        : <ExternalLink size={14} color="var(--txt3)" style={{ flexShrink:0 }} />
                      }
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

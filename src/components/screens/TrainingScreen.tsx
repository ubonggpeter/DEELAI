"use client";
import { useState } from "react";
import {
  BookOpen, Square, Tag, CheckCircle, Monitor, Trophy, Microscope,
  Target, Zap, Lock, BarChart2, AlertTriangle, ChevronRight, Check,
  Frown, ArrowLeft,
} from "lucide-react";
import { MODULES, QUIZ } from "@/lib/data";
import { User } from "@/lib/types";
import Bar from "@/components/atoms/Bar";
import Chip from "@/components/atoms/Chip";
import Spinner from "@/components/atoms/Spinner";

interface Props {
  user: User;
  setUser: (fn: (u: User) => User) => void;
}

type View = "list" | "module" | "quiz" | "cert" | "lens";

const moduleIcons: Record<number, React.ReactNode> = {
  1: <BookOpen size={20} />,
  2: <Square size={20} />,
  3: <Tag size={20} />,
  4: <CheckCircle size={20} />,
  5: <Monitor size={20} />,
};

export default function TrainingScreen({ user, setUser }: Props) {
  const [view, setView] = useState<View>("list");
  const [modId, setModId] = useState<number | null>(null);
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ q: number; sel: number; ans: number }[]>([]);
  const [quizDone, setQuizDone] = useState(false);
  const [paying, setPaying] = useState(false);

  const done = user.completedModules || [];
  const pct = Math.round((done.length / MODULES.length) * 100);
  const allDone = done.length >= MODULES.length;

  function completeModule(id: number) {
    if (done.includes(id)) return;
    setUser(u => ({ ...u, completedModules: [...(u.completedModules || []), id] }));
    setView("list");
  }

  function handleAnswer(i: number) {
    if (sel !== null) return;
    setSel(i);
    setTimeout(() => {
      const newA = [...answers, { q: qi, sel: i, ans: QUIZ[qi].ans }];
      setAnswers(newA);
      if (qi < QUIZ.length - 1) {
        setQi(qi + 1);
        setSel(null);
      } else {
        const score = newA.filter(a => a.sel === a.ans).length;
        setQuizDone(true);
        if (score >= 5) {
          setUser(u => ({ ...u, quizPassed: true }));
          setView("cert");
        }
      }
    }, 650);
  }

  function activateLens() {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setUser(u => ({ ...u, lensActivated: true, trainingDone: true, salary: Math.max(0, u.salary - 3.8) }));
      setView("list");
    }, 2200);
  }

  if (view === "cert") return (
    <div style={{ padding: "26px 18px" }} className="animate-certIn">
      <div
        className="relative overflow-hidden text-center mb-5"
        style={{
          background: "linear-gradient(145deg,#0C1A32,#101E3A)",
          border: "1px solid rgba(255,184,0,.35)",
          borderRadius: 20,
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
        <div style={{ fontSize: 10, color: "#FFB800", fontFamily: "monospace", letterSpacing: 2, marginBottom: 8 }}>
          CERTIFICATE OF COMPLETION
        </div>
        <div
          className="font-black"
          style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 21, lineHeight: 1.3, marginBottom: 6 }}
        >
          DEELAi Certified<br />Image Annotator
        </div>
        <div style={{ width: 60, height: 2, background: "linear-gradient(90deg,#FFB800,#FF8C00)", margin: "14px auto", borderRadius: 2 }} />
        <div style={{ fontSize: 13, color: "var(--txt2)", marginBottom: 4 }}>This certifies that</div>
        <div
          className="font-bold"
          style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 18, color: "#FFB800", marginBottom: 4 }}
        >
          {user.name}
        </div>
        <div style={{ fontSize: 12, color: "var(--txt2)", marginBottom: 16 }}>
          has successfully completed the DEELAi Image Annotation Certification with a passing score.
        </div>
        <div
          className="flex justify-between font-mono"
          style={{ fontSize: 10, color: "var(--txt3)", borderTop: "1px solid var(--b2)", paddingTop: 14 }}
        >
          <span>CERT-{Date.now().toString().slice(-8)}</span>
          <span>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}</span>
        </div>
      </div>

      <div
        style={{
          background: "linear-gradient(145deg,rgba(0,212,255,.07),rgba(0,212,255,.02))",
          border: "1px solid rgba(0,212,255,.25)",
          borderRadius: 20,
          padding: "22px 18px",
        }}
      >
        <div className="flex items-center gap-2.5 mb-3.5">
          <Microscope size={30} color="var(--cyan)" />
          <div>
            <div className="font-black" style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 17 }}>
              Activate Your Annotation Lens
            </div>
            <div style={{ fontSize: 12, color: "var(--txt2)", marginTop: 2 }}>One-time $3.80 · Required to go live</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: "var(--txt2)", lineHeight: 1.7, marginBottom: 16 }}>
          Your <strong style={{ color: "#fff" }}>Virtual Annotation Lens</strong> calibrates your visual precision to match AI model standards. Every certified annotator activates one before their first job.
        </div>
        <button
          onClick={() => setView("lens")}
          className="w-full flex items-center justify-center gap-2 font-bold"
          style={{
            padding: "15px", borderRadius: 12, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg,#00D4FF,#0055DD)", color: "#fff",
            fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 15,
            boxShadow: "0 8px 28px rgba(0,212,255,.3)",
          }}
        >
          <Microscope size={18} />
          Activate Annotation Lens — $3.80
          <ChevronRight size={16} />
        </button>
        <div className="text-center font-mono mt-2" style={{ fontSize: 11, color: "var(--txt3)" }}>
          One-time · Non-refundable · Instant activation
        </div>
      </div>
    </div>
  );

  if (view === "lens") return (
    <div style={{ padding: "26px 18px" }} className="animate-fadeUp">
      <button
        onClick={() => setView("cert")}
        className="flex items-center gap-1 mb-[22px]"
        style={{ background: "none", border: "none", color: "var(--txt2)", cursor: "pointer", fontSize: 13 }}
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
        <div
          className="font-black mt-[18px]"
          style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 22 }}
        >
          Virtual Annotation Lens
        </div>
        <div
          className="font-black mt-3"
          style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 40, color: "var(--cyan)" }}
        >
          $3.80
        </div>
        <div className="font-mono" style={{ fontSize: 10, color: "var(--txt3)" }}>ONE-TIME ACTIVATION FEE</div>
      </div>

      <div style={{ background: "var(--s1)", border: "1px solid var(--b2)", borderRadius: 16, padding: "18px", marginBottom: 18 }}>
        {[
          { Icon: Target, t: "Precision Targeting", d: "AI-calibrated grid overlay for exact bounding boxes" },
          { Icon: Zap, t: "Priority Job Queue", d: "Faster batch delivery for Lens-activated workers" },
          { Icon: Lock, t: "Permanent Access", d: "Pay once — your Lens is yours forever" },
          { Icon: BarChart2, t: "Live Accuracy Dashboard", d: "Real-time quality feedback on every annotation" },
        ].map(({ Icon, t, d }) => (
          <div key={t} className="flex gap-3 items-start mb-3.5">
            <Icon size={20} color="var(--cyan)" className="flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold" style={{ fontSize: 14 }}>{t}</div>
              <div style={{ fontSize: 12, color: "var(--txt2)", marginTop: 2 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="flex justify-between items-center mb-4"
        style={{ background: "var(--s1)", border: "1px solid var(--b2)", borderRadius: 12, padding: "12px 16px" }}
      >
        <span style={{ fontSize: 13, color: "var(--txt2)" }}>Deducted from wallet balance</span>
        <span className="font-mono font-semibold" style={{ color: "#00E5A0", fontSize: 13 }}>${user.salary.toFixed(2)} available</span>
      </div>

      <button
        onClick={activateLens}
        disabled={paying}
        className="w-full flex items-center justify-center gap-2.5 font-bold"
        style={{
          padding: "16px", borderRadius: 12, border: "none",
          cursor: paying ? "not-allowed" : "pointer",
          background: paying ? "var(--s3)" : "linear-gradient(135deg,#00D4FF,#0055DD)",
          color: "#fff",
          fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 16,
          boxShadow: paying ? "none" : "0 8px 32px rgba(0,212,255,.3)",
        }}
      >
        {paying ? (
          <><Spinner /> Activating…</>
        ) : (
          <><Microscope size={18} /> Pay $3.80 & Activate <ChevronRight size={16} /></>
        )}
      </button>
    </div>
  );

  if (view === "quiz") {
    if (quizDone) {
      const score = answers.filter(a => a.sel === a.ans).length;
      return (
        <div style={{ padding: "28px 18px", textAlign: "center" }} className="animate-fadeUp">
          {score >= 5
            ? <Trophy size={60} color="#FFB800" className="mx-auto" />
            : <Frown size={60} color="#FF4D6D" className="mx-auto" />
          }
          <div
            className="font-black mt-4"
            style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 24, color: score >= 5 ? "#00E5A0" : "#FF4D6D" }}
          >
            {score >= 5 ? "You're Certified!" : "Not Quite"}
          </div>
          <div style={{ color: "var(--txt2)", fontSize: 14, marginTop: 8 }}>
            Score: <strong style={{ color: "#fff" }}>{score}/{QUIZ.length}</strong> · Pass: 5/6
          </div>
          {score < 5 && (
            <button
              onClick={() => { setQi(0); setSel(null); setAnswers([]); setQuizDone(false); }}
              style={{
                marginTop: 24, padding: "14px 36px", borderRadius: 12, border: "none",
                background: "var(--cyan)", color: "#000",
                fontFamily: "-apple-system-ui-serif,sans-serif", fontWeight: 700, cursor: "pointer", fontSize: 15,
              }}
            >
              Retake Quiz
            </button>
          )}
        </div>
      );
    }
    const q = QUIZ[qi];
    return (
      <div style={{ padding: "24px 18px" }} className="animate-fadeUp">
        <button
          onClick={() => setView("list")}
          className="flex items-center gap-1 mb-5"
          style={{ background: "none", border: "none", color: "var(--txt2)", cursor: "pointer", fontSize: 13 }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="font-mono" style={{ fontSize: 10, color: "var(--cyan)", letterSpacing: 1, marginBottom: 8 }}>
          CERTIFICATION QUIZ · {qi + 1}/{QUIZ.length}
        </div>
        <Bar pct={(qi / QUIZ.length) * 100} color="var(--cyan)" h={3} />
        <div
          className="font-bold"
          style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 18, lineHeight: 1.5, margin: "20px 0 22px" }}
        >
          {q.q}
        </div>
        {q.opts.map((o, i) => (
          <div
            key={i}
            onClick={() => sel === null && handleAnswer(i)}
            className="transition-all duration-200"
            style={{
              padding: "14px 16px",
              borderRadius: 12,
              marginBottom: 10,
              cursor: sel === null ? "pointer" : "default",
              border: `1px solid ${sel === i ? (i === q.ans ? "#00E5A0" : "#FF4D6D") : "var(--b2)"}`,
              background: sel === i ? (i === q.ans ? "rgba(0,229,160,.1)" : "rgba(255,77,109,.1)") : "var(--s1)",
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            {o}
          </div>
        ))}
      </div>
    );
  }

  if (view === "module") {
    const m = MODULES.find(x => x.id === modId)!;
    const isDone = done.includes(m.id);
    return (
      <div style={{ padding: "24px 18px" }} className="animate-fadeUp">
        <button
          onClick={() => setView("list")}
          className="flex items-center gap-1 mb-5"
          style={{ background: "none", border: "none", color: "var(--txt2)", cursor: "pointer", fontSize: 13 }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div
          className="flex items-center justify-center mb-2.5"
          style={{
            width: 52, height: 52, borderRadius: 14,
            background: isDone ? "rgba(0,229,160,.1)" : "var(--s2)",
            border: `1px solid ${isDone ? "rgba(0,229,160,.28)" : "var(--b1)"}`,
            color: isDone ? "#00E5A0" : "var(--txt2)",
          }}
        >
          {isDone ? <CheckCircle size={24} color="#00E5A0" /> : moduleIcons[m.id]}
        </div>
        <div
          className="font-black mb-1.5"
          style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 20 }}
        >
          {m.title}
        </div>
        <div style={{ fontSize: 13, color: "var(--txt2)", marginBottom: 14, lineHeight: 1.6 }}>{m.desc}</div>
        <div className="flex gap-2 mb-[18px]">
          <Chip label={`${m.lessons} lessons`} color="var(--cyan)" />
          <Chip label={m.dur} color="#8B5CF6" />
        </div>
        <div style={{ background: "var(--s2)", borderRadius: 14, padding: "16px", marginBottom: 20 }}>
          {m.topics.map((t, i) => (
            <div
              key={i}
              className="flex gap-2.5 items-center py-2"
              style={{ borderBottom: i < m.topics.length - 1 ? "1px solid var(--b1)" : "none" }}
            >
              {isDone
                ? <Check size={12} color="#00E5A0" />
                : <div style={{ width: 8, height: 8, borderRadius: "50%", border: "1px solid var(--txt3)", flexShrink: 0 }} />
              }
              <span style={{ fontSize: 13 }}>{t}</span>
            </div>
          ))}
        </div>
        {!isDone ? (
          <button
            onClick={() => completeModule(m.id)}
            className="w-full flex items-center justify-center gap-2 font-bold"
            style={{
              padding: "15px", borderRadius: 12, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg,#00D4FF,#0055DD)", color: "#fff",
              fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 15,
            }}
          >
            Mark Complete <Check size={16} />
          </button>
        ) : (
          <div
            className="text-center font-semibold flex items-center justify-center gap-2"
            style={{ color: "#00E5A0", padding: "14px", background: "rgba(0,229,160,.08)", borderRadius: 12, border: "1px solid rgba(0,229,160,.2)" }}
          >
            <CheckCircle size={16} /> Module Completed
          </div>
        )}
      </div>
    );
  }

  // list view
  return (
    <div className="animate-fadeUp">
      <div
        style={{
          background: "linear-gradient(145deg,#081428,#0C1E40)",
          padding: "26px 18px 22px",
          borderRadius: "0 0 24px 24px",
          marginBottom: 20,
        }}
      >
        <div
          className="font-black mb-1"
          style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 22 }}
        >
          Training Center
        </div>
        <div style={{ fontSize: 13, color: "var(--txt2)", marginBottom: 16 }}>Free · Mandatory · Self-paced · 6–7 hours</div>
        <div className="flex justify-between mb-1.5">
          <span className="font-mono" style={{ fontSize: 11, color: "var(--txt2)" }}>PROGRESS</span>
          <span className="font-mono font-semibold" style={{ fontSize: 11, color: "var(--cyan)" }}>
            {done.length}/{MODULES.length} Modules
          </span>
        </div>
        <Bar pct={pct} color="var(--cyan)" />
        {user.lensActivated && (
          <div
            className="flex items-center gap-2 mt-3"
            style={{ background: "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.22)", borderRadius: 10, padding: "8px 12px" }}
          >
            <Microscope size={16} color="var(--cyan)" />
            <span className="font-semibold" style={{ fontSize: 12, color: "var(--cyan)" }}>Annotation Lens Active · You are live!</span>
          </div>
        )}
      </div>

      <div style={{ padding: "0 18px" }}>
        <div
          className="flex gap-2.5 items-start mb-[18px]"
          style={{
            background: "rgba(255,184,0,.08)", border: "1px solid rgba(255,184,0,.2)",
            borderRadius: 12, padding: "12px 14px",
          }}
        >
          <AlertTriangle size={18} color="#FFB800" className="flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold mb-0.5" style={{ fontSize: 13, color: "#FFB800" }}>Mandatory Before You Earn</div>
            <div style={{ fontSize: 12, color: "var(--txt2)" }}>
              Training is 100% free. Complete all modules, pass the quiz, then activate your Annotation Lens ($3.80) to go live.
            </div>
          </div>
        </div>

        {MODULES.map((m, i) => {
          const isDone = done.includes(m.id);
          const locked = i > 0 && !done.includes(MODULES[i - 1].id);
          return (
            <div
              key={m.id}
              onClick={() => !locked && (setModId(m.id), setView("module"))}
              style={{
                background: "var(--s1)",
                border: `1px solid ${isDone ? "rgba(0,229,160,.28)" : "var(--b1)"}`,
                borderRadius: 14, padding: "14px 16px", marginBottom: 8,
                cursor: locked ? "not-allowed" : "pointer",
                opacity: locked ? 0.4 : 1,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: isDone ? "rgba(0,229,160,.1)" : "var(--s2)",
                    border: `1px solid ${isDone ? "rgba(0,229,160,.28)" : "var(--b1)"}`,
                    color: isDone ? "#00E5A0" : "var(--txt2)",
                  }}
                >
                  {isDone ? <Check size={20} color="#00E5A0" /> : moduleIcons[m.id]}
                </div>
                <div className="flex-1">
                  <div className="font-semibold" style={{ fontSize: 14 }}>{m.title}</div>
                  <div className="font-mono" style={{ fontSize: 11, color: "var(--txt2)", marginTop: 2 }}>
                    {m.lessons} lessons · {m.dur}
                  </div>
                </div>
                {isDone
                  ? <span className="font-semibold" style={{ color: "#00E5A0", fontSize: 12 }}>Done</span>
                  : locked
                    ? <Lock size={15} color="var(--txt3)" />
                    : <ChevronRight size={14} color="var(--cyan)" />
                }
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: 18, marginBottom: 30 }}>
          <div
            className="font-bold mb-2.5"
            style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 15 }}
          >
            Certification Quiz
          </div>
          <div
            style={{
              background: user.quizPassed ? "rgba(0,229,160,.07)" : "var(--s1)",
              border: `1px solid ${user.quizPassed ? "rgba(0,229,160,.28)" : "rgba(139,92,246,.28)"}`,
              borderRadius: 14, padding: "16px",
            }}
          >
            <div className="flex gap-3 items-center mb-3">
              {user.quizPassed
                ? <Trophy size={26} color="#FFB800" />
                : <CheckCircle size={26} color="#8B5CF6" />
              }
              <div>
                <div className="font-semibold" style={{ fontSize: 14 }}>DEELAi Annotator Certification</div>
                <div style={{ fontSize: 12, color: "var(--txt2)" }}>6 questions · Pass: 5/6 · Free retakes</div>
              </div>
            </div>
            {user.quizPassed ? (
              <>
                <div className="font-semibold mb-2.5" style={{ fontSize: 12, color: "#00E5A0" }}>
                  ✓ Certified — {user.lensActivated ? "Lens active · You are live!" : "Activate your Lens to go live →"}
                </div>
                {!user.lensActivated && (
                  <button
                    onClick={() => setView("cert")}
                    className="w-full flex items-center justify-center gap-2 font-bold"
                    style={{
                      padding: "12px", borderRadius: 10, border: "none", cursor: "pointer",
                      background: "linear-gradient(135deg,#00D4FF,#0055DD)", color: "#fff",
                      fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 14,
                    }}
                  >
                    <Microscope size={16} /> View Certificate & Activate <ChevronRight size={14} />
                  </button>
                )}
              </>
            ) : (
              <button
                disabled={!allDone}
                onClick={() => { setQi(0); setSel(null); setAnswers([]); setQuizDone(false); setView("quiz"); }}
                className="w-full font-bold"
                style={{
                  padding: "13px", borderRadius: 10, border: "none",
                  background: allDone ? "linear-gradient(135deg,#8B5CF6,#6D28D9)" : "var(--s3)",
                  color: "#fff",
                  fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 14,
                  cursor: allDone ? "pointer" : "not-allowed",
                  opacity: allDone ? 1 : 0.5,
                }}
              >
                {allDone ? "Take Certification Quiz →" : "Complete all modules first"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

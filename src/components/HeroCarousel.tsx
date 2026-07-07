"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Zap, Shield, Star, Users } from "lucide-react";
import GlobeBackground from "./GlobeBackground";

const C = {
  bg: "#060A12", s1: "#0C1220", s2: "#101829", s3: "#162035",
  cyan: "#00D4FF", green: "#00E5A0", gold: "#FFB800",
  txt: "#EEF2FF", txt2: "#7D8BAA", txt3: "#4A5470",
};

const STATS = [
  { value: "2,400+", label: "Active Workers"  },
  { value: "$1.2M+", label: "Total Paid Out"  },
  { value: "99.2%",  label: "Accuracy Rate"   },
  { value: "24 hrs", label: "Max Review Time" },
];

const PERKS = [
  { icon: Zap,    color: "#00D4FF", label: "Daily Payouts",      desc: "Get paid every day you work — no long waits."       },
  { icon: Shield, color: "#8B5CF6", label: "Secure Platform",    desc: "Bank-grade encryption protects your data and funds." },
  { icon: Star,   color: "#FFB800", label: "Skill Certificates", desc: "Earn verifiable certs as you level up your skills."  },
  { icon: Users,  color: "#00E5A0", label: "Global Community",   desc: "Join thousands of remote workers across 6 continents." },
];

const STEPS = [
  { n: "01", title: "Pick a Channel",  desc: "Find a regional agent channel that matches your schedule and goals."  },
  { n: "02", title: "Register",        desc: "Fill in your details, get your job pass, and upload your CV."         },
  { n: "03", title: "Get Approved",    desc: "Your channel admin reviews and approves your account within 24 hrs."  },
  { n: "04", title: "Start Earning",   desc: "Log in, complete annotation tasks, and get paid daily — from home."   },
];

const SLIDE_COUNT  = 3;
const AUTO_DELAY   = 5000;

export default function HeroCarousel() {
  const [cur, setCur]             = useState(0);
  const pausedRef                 = useRef(false);
  const intervalRef               = useRef<ReturnType<typeof setInterval>  | null>(null);
  const resumeTimerRef            = useRef<ReturnType<typeof setTimeout>   | null>(null);
  const touchStartRef             = useRef(0);
  const mouseStartRef             = useRef(0);
  const isDraggingRef             = useRef(false);

  // Auto-scroll: starts after initial delay, skips when paused
  useEffect(() => {
    const init = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (!pausedRef.current) setCur((c) => (c + 1) % SLIDE_COUNT);
      }, AUTO_DELAY);
    }, AUTO_DELAY);

    return () => {
      clearTimeout(init);
      if (intervalRef.current)   clearInterval(intervalRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const pauseAndResumeLater = useCallback(() => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => { pausedRef.current = false; }, AUTO_DELAY);
  }, []);

  function navigate(n: number) {
    setCur(((n % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);
    pauseAndResumeLater();
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartRef.current = e.touches[0].clientX;
    pauseAndResumeLater();
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) navigate(cur + (diff > 0 ? 1 : -1));
  }

  function handleMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("a,button")) return;
    mouseStartRef.current = e.clientX;
    isDraggingRef.current = true;
  }
  function handleMouseUp(e: React.MouseEvent) {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const diff = mouseStartRef.current - e.clientX;
    if (Math.abs(diff) > 60) navigate(cur + (diff > 0 ? 1 : -1));
  }

  return (
    <>
      <section
        className="hc-root"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={{ position: "relative", overflow: "hidden" }}
      >
        {/* Globe — desktop: right side; mobile: hidden */}
        <div className="hc-globe" aria-hidden="true">
          <GlobeBackground />
        </div>

        {/* Slides track */}
        <div
          style={{
            display: "flex",
            transform: `translateX(-${cur * 100}%)`,
            transition: "transform 0.55s cubic-bezier(0.4,0,0.2,1)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Slide0 />
          <Slide1 />
          <Slide2 />
        </div>

        {/* Arrow nav */}
        <button className="hc-arrow hc-arrow-l" onClick={() => navigate(cur - 1)} aria-label="Previous">
          <ChevronLeft size={18} />
        </button>
        <button className="hc-arrow hc-arrow-r" onClick={() => navigate(cur + 1)} aria-label="Next">
          <ChevronRight size={18} />
        </button>

        {/* Dot indicators */}
        <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 8, zIndex: 10 }}>
          {Array.from({ length: SLIDE_COUNT }, (_, i) => (
            <button
              key={i}
              onClick={() => navigate(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                width: cur === i ? 24 : 8, height: 8, borderRadius: 4,
                background: cur === i ? C.cyan : C.s3,
                border: "none", padding: 0, cursor: "pointer",
                transition: "width 0.3s ease, background 0.3s ease",
              }}
            />
          ))}
        </div>
      </section>

      <style>{`
        .hc-root {
          min-height: 88vh;
          user-select: none;
        }
        .hc-globe {
          position: absolute;
          top: 50%; right: -6%;
          transform: translateY(-50%);
          width: min(50%, 500px);
          aspect-ratio: 1;
          opacity: 0.28;
          pointer-events: none;
          z-index: 0;
        }
        .hc-arrow {
          position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
          background: rgba(12,18,32,0.82); border: 1px solid #162035;
          border-radius: 10px; width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #7D8BAA;
          transition: background 0.15s, border-color 0.15s;
        }
        .hc-arrow:hover { background: rgba(0,212,255,0.12); border-color: rgba(0,212,255,0.35); color: #00D4FF; }
        .hc-arrow-l { left: 12px; }
        .hc-arrow-r { right: 12px; }
        .hc-slide {
          width: 100%; flex-shrink: 0;
          display: flex; align-items: center;
          min-height: 88vh;
        }
        .hc-inner {
          max-width: 1100px; margin: 0 auto;
          padding: 60px 16px 90px;
          width: 100%;
        }

        @keyframes hc-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        .hc-badge-dot { animation: hc-pulse 2s infinite; }

        @media (max-width: 640px) {
          .hc-arrow { display: none; }
          .hc-globe { right: 50%; transform: translate(50%, -50%); width: min(82vw, 260px); opacity: 0.06; }
          .hc-inner { padding: 44px 16px 80px; }
        }
      `}</style>
    </>
  );
}

/* ── Slide 0 — Hero ───────────────────────────────────────────────────────── */
function Slide0() {
  return (
    <div className="hc-slide">
      <div className="hc-inner">
        {/* Active badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: `${C.cyan}15`, border: `1px solid ${C.cyan}30`,
          borderRadius: 20, padding: "4px 12px", marginBottom: 20,
        }}>
          <span className="hc-badge-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block" }} />
          <span style={{ color: C.cyan, fontSize: 12, fontWeight: 700 }}>Actively hiring • Remote positions available</span>
        </div>

        <h1 style={{
          fontSize: "clamp(30px, 7vw, 64px)", fontWeight: 900,
          lineHeight: 1.08, margin: "0 0 18px", letterSpacing: "-0.02em",
          maxWidth: 600,
        }}>
          Earn From Anywhere<br />With{" "}
          <span style={{
            background: `linear-gradient(135deg, ${C.cyan}, #0099BB)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            DEELAI
          </span>
        </h1>

        <p style={{ color: C.txt2, fontSize: "clamp(14px, 2.5vw, 17px)", maxWidth: 480, margin: "0 0 32px", lineHeight: 1.7 }}>
          Join our global network of remote data annotators. Work on your schedule,
          earn a real salary, and grow your career — all from home.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 48 }}>
          <a href="#channels" style={{
            background: `linear-gradient(135deg, ${C.cyan}, #0099BB)`,
            color: "#060A12", fontWeight: 800, fontSize: 15,
            padding: "12px 24px", borderRadius: 10, textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            Choose Your Channel <ArrowRight size={17} />
          </a>
          <a href="/login" style={{
            background: C.s1, border: `1px solid ${C.s3}`,
            color: C.txt2, fontSize: 14,
            padding: "12px 20px", borderRadius: 10, textDecoration: "none",
          }}>
            I have an account
          </a>
        </div>

        {/* Stats strip */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4,1fr)",
          borderTop: `1px solid ${C.s3}`, paddingTop: 24, maxWidth: 560, gap: 0,
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              textAlign: i === 0 ? "left" : "center",
              borderLeft: i > 0 ? `1px solid ${C.s3}` : "none",
              paddingLeft: i > 0 ? 16 : 0,
            }}>
              <div style={{ color: C.cyan, fontSize: "clamp(16px, 3.5vw, 22px)", fontWeight: 800 }}>{s.value}</div>
              <div style={{ color: C.txt3, fontSize: 10, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Slide 1 — Why DEELAI ─────────────────────────────────────────────────── */
function Slide1() {
  return (
    <div className="hc-slide">
      <div className="hc-inner" style={{ textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: `${C.cyan}12`, border: `1px solid ${C.cyan}25`,
          borderRadius: 20, padding: "4px 14px", marginBottom: 16,
        }}>
          <span style={{ color: C.cyan, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>WHY DEELAI</span>
        </div>

        <h2 style={{
          fontSize: "clamp(24px, 5vw, 48px)", fontWeight: 900,
          margin: "0 0 12px", letterSpacing: "-0.02em", lineHeight: 1.1,
        }}>
          Built for Remote<br />Workers Like You
        </h2>
        <p style={{ color: C.txt2, fontSize: "clamp(13px, 2vw, 16px)", maxWidth: 440, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Everything you need to earn remotely — in one secure, fair platform.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: 16, maxWidth: 860, margin: "0 auto", textAlign: "left",
        }}>
          {PERKS.map(({ icon: Icon, color, label, desc }) => (
            <div key={label} style={{
              background: C.s1, border: `1px solid ${C.s3}`, borderRadius: 14,
              padding: "22px 20px", display: "flex", flexDirection: "column", gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                background: `${color}14`, border: `1px solid ${color}28`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={17} color={color} />
              </div>
              <div>
                <div style={{ color: C.txt, fontSize: 14, fontWeight: 700, marginBottom: 5 }}>{label}</div>
                <div style={{ color: C.txt3, fontSize: 12, lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Slide 2 — How It Works ───────────────────────────────────────────────── */
function Slide2() {
  return (
    <div className="hc-slide">
      <div className="hc-inner" style={{ textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: `${C.cyan}12`, border: `1px solid ${C.cyan}25`,
          borderRadius: 20, padding: "4px 14px", marginBottom: 16,
        }}>
          <span style={{ color: C.cyan, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>HOW IT WORKS</span>
        </div>

        <h2 style={{
          fontSize: "clamp(24px, 5vw, 48px)", fontWeight: 900,
          margin: "0 0 12px", letterSpacing: "-0.02em", lineHeight: 1.1,
        }}>
          Start Earning in<br />Four Simple Steps
        </h2>
        <p style={{ color: C.txt2, fontSize: "clamp(13px, 2vw, 16px)", maxWidth: 440, margin: "0 auto 40px", lineHeight: 1.7 }}>
          From sign-up to first paycheck — here&apos;s how it works.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 16, maxWidth: 860, margin: "0 auto", textAlign: "left",
        }}>
          {STEPS.map(({ n, title, desc }) => (
            <div key={n} style={{
              background: C.s1, border: `1px solid ${C.s3}`, borderRadius: 14,
              padding: "22px 20px", position: "relative", overflow: "hidden",
            }}>
              {/* Ghost number */}
              <div style={{
                position: "absolute", top: 6, right: 14,
                color: `${C.cyan}14`, fontFamily: "monospace",
                fontWeight: 900, fontSize: 38, lineHeight: 1,
                pointerEvents: "none", userSelect: "none",
              }}>
                {n}
              </div>
              <div style={{
                width: 30, height: 30, borderRadius: 8, marginBottom: 14,
                background: `${C.cyan}14`, border: `1px solid ${C.cyan}28`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: C.cyan, fontWeight: 800, fontSize: 11, fontFamily: "monospace" }}>{n}</span>
              </div>
              <div style={{ color: C.txt, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{title}</div>
              <div style={{ color: C.txt3, fontSize: 12, lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>

        <a href="#channels" style={{
          display: "inline-flex", alignItems: "center", gap: 8, marginTop: 36,
          background: `linear-gradient(135deg, ${C.cyan}, #0099BB)`,
          color: "#060A12", fontWeight: 800, fontSize: 15,
          padding: "12px 28px", borderRadius: 10, textDecoration: "none",
        }}>
          Get Started Now <ArrowRight size={17} />
        </a>
      </div>
    </div>
  );
}

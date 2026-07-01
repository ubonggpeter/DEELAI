"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Clock, Users, Shield, Star, Zap,
  CheckCircle2, Loader2, ChevronRight,
} from "lucide-react";

const C = {
  bg: "#060A12", s1: "#0C1220", s2: "#101829", s3: "#162035",
  cyan: "#00D4FF", green: "#00E5A0", gold: "#FFB800",
  txt: "#EEF2FF", txt2: "#7D8BAA", txt3: "#4A5470",
};

interface Channel {
  id: string;
  channelName: string;
  description: string;
  estTime: string;
  jobPassFee: number;
}

const CHANNEL_COLORS = ["#00D4FF", "#00E5A0", "#FFB800", "#8B5CF6", "#FF4D6D"];
const PERKS = [
  { icon: Zap,    label: "Daily Payouts",      desc: "Get paid every day you work"         },
  { icon: Shield, label: "Secure Platform",    desc: "Bank-grade data security"            },
  { icon: Star,   label: "Skill Certificates", desc: "Earn certificates as you progress"   },
  { icon: Users,  label: "Global Community",   desc: "Join thousands of remote workers"    },
];
const STATS = [
  { value: "2,400+", label: "Active Workers" },
  { value: "$1.2M+", label: "Total Paid Out" },
  { value: "99.2%",  label: "Accuracy Rate"  },
  { value: "24 hrs", label: "Max Review Time" },
];

export default function LandingPage() {
  const router   = useRouter();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/channels")
      .then((r) => r.json())
      .then((d) => setChannels(d.channels ?? []))
      .finally(() => setLoading(false));
  }, []);

  function selectChannel(id: string) {
    setSelected(id);
    router.push(`/register?channel=${id}`);
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.txt }}>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: `${C.bg}e8`, backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.s3}`,
        padding: "0 16px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", height: 56, gap: 10, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: "linear-gradient(135deg,#00D4FF,#0055DD)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, color: "#fff", fontSize: 14, fontFamily: "system-ui",
            }}>D</div>
            <span style={{ fontWeight: 900, fontSize: 17, fontFamily: "system-ui", whiteSpace: "nowrap" }}>
              DEEL<span style={{ color: C.cyan }}>Ai</span>
            </span>
          </div>
          <div style={{ flex: 1 }} />
          <a href="/login" className="nav-signin" style={{
            color: C.txt2, fontSize: 13, textDecoration: "none",
            padding: "6px 12px", borderRadius: 7, border: `1px solid ${C.s3}`,
            whiteSpace: "nowrap", flexShrink: 0,
          }}>
            Sign In
          </a>
          <a href="#channels" style={{
            background: C.cyan, color: "#060A12",
            fontSize: 13, fontWeight: 700, textDecoration: "none",
            padding: "7px 14px", borderRadius: 7, whiteSpace: "nowrap", flexShrink: 0,
          }}>
            Join Now
          </a>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 16px 48px", textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: `${C.cyan}15`, border: `1px solid ${C.cyan}30`,
          borderRadius: 20, padding: "4px 12px", marginBottom: 20,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} className="pulse-dot" />
          <span style={{ color: C.cyan, fontSize: 12, fontWeight: 700 }}>Actively hiring • Remote positions available</span>
        </div>

        <h1 style={{
          fontSize: "clamp(28px, 7vw, 60px)", fontWeight: 900, lineHeight: 1.1,
          margin: "0 0 18px", letterSpacing: "-0.02em",
        }}>
          Earn From Anywhere With<br />
          <span style={{
            background: `linear-gradient(135deg, ${C.cyan}, #0099BB)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            DEELAI
          </span>
        </h1>

        <p style={{
          color: C.txt2, fontSize: "clamp(14px, 2.5vw, 17px)",
          maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.7,
        }}>
          Join our global network of remote data annotators. Work on your schedule,
          earn a real salary, and grow your career — all from home.
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
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

        {/* Stats */}
        <div className="lp-stats" style={{ marginTop: 48, borderTop: `1px solid ${C.s3}`, paddingTop: 32 }}>
          {STATS.map((s, i) => (
            <div key={i} className={`lp-stat${i < STATS.length - 1 ? " lp-stat-divider" : ""}`}>
              <div style={{ color: C.cyan, fontSize: "clamp(18px, 4vw, 26px)", fontWeight: 800 }}>{s.value}</div>
              <div style={{ color: C.txt3, fontSize: 11, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Perks ────────────────────────────────────────────────────── */}
      <div style={{ background: C.s1, borderTop: `1px solid ${C.s3}`, borderBottom: `1px solid ${C.s3}`, padding: "32px 16px" }}>
        <div className="lp-perks" style={{ maxWidth: 1100, margin: "0 auto" }}>
          {PERKS.map(({ icon: Icon, label, desc }) => (
            <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: `${C.cyan}15`, border: `1px solid ${C.cyan}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={16} color={C.cyan} />
              </div>
              <div>
                <div style={{ color: C.txt, fontSize: 13, fontWeight: 700 }}>{label}</div>
                <div style={{ color: C.txt3, fontSize: 11, marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Channel selection ─────────────────────────────────────────── */}
      <div id="channels" style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 style={{ fontSize: "clamp(22px, 5vw, 38px)", fontWeight: 800, margin: "0 0 10px" }}>
            Choose Your Channel
          </h2>
          <p style={{ color: C.txt2, fontSize: 14, maxWidth: 440, margin: "0 auto" }}>
            Each channel is managed by a dedicated sub-admin. Select the one that fits your goals.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Loader2 size={30} color={C.cyan} className="spin-icon" />
          </div>
        ) : channels.length === 0 ? (
          <div style={{ textAlign: "center", color: C.txt3, padding: "40px 0" }}>
            No channels are currently open for registration. Check back soon.
          </div>
        ) : (
          <div className="channel-grid">
            {channels.map((ch, i) => {
              const color = CHANNEL_COLORS[i % CHANNEL_COLORS.length];
              const isSel = selected === ch.id;
              return (
                <div
                  key={ch.id}
                  onClick={() => selectChannel(ch.id)}
                  className="channel-card"
                  style={{
                    background: C.s1,
                    border: `1.5px solid ${isSel ? color : C.s3}`,
                    borderRadius: 16, padding: "22px",
                    cursor: "pointer", position: "relative", overflow: "hidden",
                  }}
                >
                  <div style={{
                    position: "absolute", top: -40, left: -40,
                    width: 110, height: 110, borderRadius: "50%",
                    background: `${color}10`, pointerEvents: "none",
                  }} />

                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 11,
                      background: `${color}18`, border: `1.5px solid ${color}40`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, fontWeight: 900, color, fontFamily: "system-ui", flexShrink: 0,
                    }}>
                      {ch.channelName}
                    </div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 5,
                      background: `${C.green}12`, border: `1px solid ${C.green}30`,
                      borderRadius: 20, padding: "3px 8px", flexShrink: 0,
                    }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.green }} />
                      <span style={{ color: C.green, fontSize: 10, fontWeight: 700 }}>OPEN</span>
                    </div>
                  </div>

                  <h3 style={{ color: C.txt, fontSize: 16, fontWeight: 700, margin: "0 0 7px", wordBreak: "break-word" }}>
                    Channel {ch.channelName}
                  </h3>
                  <p style={{ color: C.txt2, fontSize: 13, lineHeight: 1.6, margin: "0 0 16px", wordBreak: "break-word" }}>
                    {ch.description}
                  </p>

                  <div style={{ display: "flex", gap: 7, marginBottom: 18, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 5,
                      background: `${C.gold}12`, border: `1px solid ${C.gold}30`, color: C.gold,
                      display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
                    }}>
                      <Clock size={10} /> {ch.estTime} review
                    </span>
                    {ch.jobPassFee > 0 && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 5,
                        background: `${color}12`, border: `1px solid ${color}30`, color,
                        whiteSpace: "nowrap",
                      }}>
                        ₦{ch.jobPassFee.toLocaleString()} job pass
                      </span>
                    )}
                  </div>

                  <button style={{
                    width: "100%", background: `${color}15`,
                    border: `1px solid ${color}40`, borderRadius: 9,
                    padding: "10px", color, fontWeight: 700, fontSize: 14,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>
                    {isSel
                      ? <><CheckCircle2 size={14} /> Selected</>
                      : <>Join Channel {ch.channelName} <ChevronRight size={14} /></>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <div style={{ background: C.s1, borderTop: `1px solid ${C.s3}`, padding: "48px 16px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(18px, 4vw, 30px)", fontWeight: 800, marginBottom: 36 }}>
            How It Works
          </h2>
          <div className="lp-steps">
            {[
              { step: "01", title: "Pick a Channel",  desc: "Select the channel that matches your schedule and goals." },
              { step: "02", title: "Register",         desc: "Fill in your details, get your job pass, and upload your CV." },
              { step: "03", title: "Get Approved",     desc: "Channel admin reviews and approves your account within 24 hrs." },
              { step: "04", title: "Start Earning",    desc: "Log in, complete annotation tasks, and get paid daily." },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ textAlign: "center" }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, margin: "0 auto 10px",
                  background: `${C.cyan}15`, border: `1px solid ${C.cyan}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: C.cyan, fontWeight: 800, fontFamily: "monospace", fontSize: 13,
                }}>
                  {step}
                </div>
                <div style={{ color: C.txt, fontWeight: 700, fontSize: 13, marginBottom: 5 }}>{title}</div>
                <div style={{ color: C.txt3, fontSize: 12, lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${C.s3}`, padding: "20px 16px", textAlign: "center" }}>
        <div style={{ color: C.txt3, fontSize: 12 }}>
          © 2026 DEELAI · Remote Work Platform ·{" "}
          <a href="/login" style={{ color: C.txt2, textDecoration: "none" }}>Sign In</a>
          {" · "}
          <a href="/admin" style={{ color: C.txt2, textDecoration: "none" }}>Admin</a>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        @keyframes spin-anim { to { transform: rotate(360deg); } }
        .spin-icon { animation: spin-anim 1s linear infinite; }
        .pulse-dot { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        /* Stats grid */
        .lp-stats { display: grid; grid-template-columns: repeat(2,1fr); padding-top: 32px; border-top: 1px solid ${C.s3}; margin-top: 48px; }
        .lp-stat { padding: 12px 8px; text-align: center; }
        .lp-stat-divider { border-right: 1px solid ${C.s3}; }
        @media (min-width:600px) {
          .lp-stats { grid-template-columns: repeat(4,1fr); }
          .lp-stat-divider { border-right: 1px solid ${C.s3}; }
          .lp-stat:nth-child(2) { border-right: 1px solid ${C.s3}; }
        }
        @media (max-width:599px) {
          .lp-stat:nth-child(2) { border-right: none; }
          .lp-stat:nth-child(1), .lp-stat:nth-child(2) { border-bottom: 1px solid ${C.s3}; padding-bottom: 14px; }
        }

        /* Perks grid */
        .lp-perks { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (min-width:768px) { .lp-perks { grid-template-columns: repeat(4,1fr); gap: 20px; } }

        /* Channel cards grid: 1 col mobile → 2 col tablet → 3 col desktop */
        .channel-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width:560px)  { .channel-grid { grid-template-columns: repeat(2,1fr); } }
        @media (min-width:960px)  { .channel-grid { grid-template-columns: repeat(3,1fr); } }

        /* Channel card hover */
        .channel-card { transition: border-color 0.2s, transform 0.15s; }
        .channel-card:hover { transform: translateY(-2px); }

        /* How it works steps */
        .lp-steps { display: grid; grid-template-columns: repeat(2,1fr); gap: 24px; }
        @media (min-width:640px) { .lp-steps { grid-template-columns: repeat(4,1fr); } }

        /* Nav sign-in button hide on very small */
        @media (max-width:340px) { .nav-signin { display: none; } }
      `}</style>
    </div>
  );
}

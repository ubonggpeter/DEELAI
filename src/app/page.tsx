"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Clock, Users, Shield, Star, Zap,
  CheckCircle2, Loader2, ChevronRight, Globe2, MapPin,
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
  region: string;
}

const CHANNEL_COLORS = ["#00D4FF", "#00E5A0", "#FFB800", "#8B5CF6", "#FF4D6D"];

const PERKS = [
  { icon: Zap,    label: "Daily Payouts",      desc: "Get paid every day you work"        },
  { icon: Shield, label: "Secure Platform",    desc: "Bank-grade data security"           },
  { icon: Star,   label: "Skill Certificates", desc: "Earn certificates as you progress"  },
  { icon: Users,  label: "Global Community",   desc: "Join thousands of remote workers"   },
];

const STATS = [
  { value: "2,400+", label: "Active Workers" },
  { value: "$1.2M+", label: "Total Paid Out" },
  { value: "99.2%",  label: "Accuracy Rate"  },
  { value: "24 hrs", label: "Max Review Time" },
];

// Map sub-admin region strings → display continent
const REGION_TO_CONTINENT: Record<string, string> = {
  "West Africa":    "Africa",    "East Africa":   "Africa",
  "South Africa":   "Africa",    "North Africa":  "Africa",    "Central Africa": "Africa",
  "North America":  "Americas",  "South America": "Americas",
  "Latin America":  "Americas",  "Central America": "Americas",
  "Europe":         "Europe",    "Western Europe": "Europe",
  "Eastern Europe": "Europe",    "Southern Europe": "Europe",
  "Asia":           "Asia Pacific", "South East Asia": "Asia Pacific",
  "South Asia":     "Asia Pacific", "East Asia":       "Asia Pacific",
  "Oceania":        "Asia Pacific", "Pacific":         "Asia Pacific",
  "Middle East":    "Middle East",  "MENA":            "Middle East",
};

const CONTINENT_ORDER = ["Africa", "Americas", "Europe", "Asia Pacific", "Middle East", "Global"];

const CONTINENT_COLOR: Record<string, string> = {
  "Africa":       "#00E5A0",
  "Americas":     "#00D4FF",
  "Europe":       "#8B5CF6",
  "Asia Pacific": "#FFB800",
  "Middle East":  "#FF4D6D",
  "Global":       "#7D8BAA",
};

export default function LandingPage() {
  const router     = useRouter();
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

  // Group channels continent → [channels]
  const grouped: Record<string, Channel[]> = {};
  for (const ch of channels) {
    const continent = REGION_TO_CONTINENT[ch.region] ?? ch.region ?? "Global";
    (grouped[continent] ??= []).push(ch);
  }
  const visibleContinents = [
    ...CONTINENT_ORDER.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !CONTINENT_ORDER.includes(c)),
  ];

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
          }}>Sign In</a>
          <a href="#channels" style={{
            background: C.cyan, color: "#060A12",
            fontSize: 13, fontWeight: 700, textDecoration: "none",
            padding: "7px 14px", borderRadius: 7, whiteSpace: "nowrap", flexShrink: 0,
          }}>Join Now</a>
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
          <span style={{ background: `linear-gradient(135deg, ${C.cyan}, #0099BB)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            DEELAI
          </span>
        </h1>

        <p style={{ color: C.txt2, fontSize: "clamp(14px, 2.5vw, 17px)", maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.7 }}>
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
          }}>I have an account</a>
        </div>

        {/* Stats — CSS grid handles responsive */}
        <div className="lp-stats">
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

      {/* ── Channel selection — continent → agent rows ────────────────── */}
      <div id="channels" style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: "clamp(22px, 5vw, 38px)", fontWeight: 800, margin: "0 0 10px" }}>
            Choose Your Channel
          </h2>
          <p style={{ color: C.txt2, fontSize: 14, maxWidth: 480, margin: "0 auto" }}>
            Channels are managed by regional agents. Find your region and click Join to register.
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
          <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
            {visibleContinents.map((continent) => {
              const cColor = CONTINENT_COLOR[continent] ?? C.txt2;
              const agents = grouped[continent];
              return (
                <div key={continent}>
                  {/* ── Continent header ── */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: `${cColor}18`, border: `1px solid ${cColor}35`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Globe2 size={13} color={cColor} />
                    </div>
                    <span style={{ color: C.txt, fontSize: 15, fontWeight: 800, whiteSpace: "nowrap" }}>
                      {continent}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 10, flexShrink: 0,
                      background: `${cColor}14`, border: `1px solid ${cColor}30`, color: cColor,
                    }}>
                      {agents.length} agent{agents.length !== 1 ? "s" : ""}
                    </span>
                    <div style={{ flex: 1, height: 1, background: C.s3 }} />
                  </div>

                  {/* ── Agent rows ── */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {agents.map((ch, idx) => {
                      const color = CHANNEL_COLORS[(CONTINENT_ORDER.indexOf(continent) * 3 + idx) % CHANNEL_COLORS.length];
                      const isSel = selected === ch.id;
                      return (
                        <div
                          key={ch.id}
                          onClick={() => selectChannel(ch.id)}
                          className="agent-row"
                          style={{
                            background: isSel ? `${color}0c` : C.s1,
                            border: `1.5px solid ${isSel ? color : C.s3}`,
                            borderRadius: 12, padding: "14px 14px",
                            cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                          }}
                        >
                          {/* Avatar */}
                          <div style={{
                            width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                            background: `${color}18`, border: `1.5px solid ${color}40`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 18, fontWeight: 900, color, fontFamily: "system-ui",
                            overflow: "hidden",
                          }}>
                            {ch.channelName.charAt(0).toUpperCase()}
                          </div>

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 6 }}>
                              <span style={{ color: C.txt, fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>
                                Channel {ch.channelName}
                              </span>
                              <span style={{
                                display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0,
                                fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10,
                                background: `${C.green}12`, border: `1px solid ${C.green}30`, color: C.green,
                              }}>
                                <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.green, display: "inline-block" }} />
                                OPEN
                              </span>
                              <span style={{ color: C.txt3, fontSize: 11, display: "inline-flex", alignItems: "center", gap: 3 }}>
                                <MapPin size={9} color={C.txt3} style={{ flexShrink: 0 }} />
                                {ch.region}
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              <span style={{
                                fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                                background: `${C.gold}12`, border: `1px solid ${C.gold}28`, color: C.gold,
                                display: "inline-flex", alignItems: "center", gap: 3, whiteSpace: "nowrap",
                              }}>
                                <Clock size={9} /> {ch.estTime} review
                              </span>
                              {ch.jobPassFee > 0 && (
                                <span style={{
                                  fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                                  background: `${color}12`, border: `1px solid ${color}28`, color,
                                  whiteSpace: "nowrap",
                                }}>
                                  ₦{ch.jobPassFee.toLocaleString()} fee
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Join button */}
                          <button className="agent-join-btn" style={{
                            background: isSel ? color : `${color}18`,
                            border: `1.5px solid ${color}50`, borderRadius: 8,
                            color: isSel ? "#060A12" : color,
                            fontWeight: 700, fontSize: 13, cursor: "pointer",
                            display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0,
                            padding: "8px 14px", whiteSpace: "nowrap",
                          }}>
                            {isSel
                              ? <><CheckCircle2 size={13} /> Joined</>
                              : <>Join <ChevronRight size={13} /></>}
                          </button>
                        </div>
                      );
                    })}
                  </div>
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
              { step: "01", title: "Pick a Channel",  desc: "Find a regional agent channel that matches your schedule and goals." },
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
        </div>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        /* body only — do NOT set overflow-x:hidden on html or iOS kills vertical scroll */
        body { overflow-x: hidden; }

        @keyframes spin-anim { to { transform: rotate(360deg); } }
        .spin-icon { animation: spin-anim 1s linear infinite; }
        .pulse-dot { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        /* Stats grid: 2×2 mobile → 4×1 desktop */
        .lp-stats {
          display: grid; grid-template-columns: repeat(2,1fr);
          padding-top: 32px; border-top: 1px solid ${C.s3}; margin-top: 48px;
        }
        .lp-stat { padding: 12px 8px; text-align: center; }
        .lp-stat-divider { border-right: 1px solid ${C.s3}; }
        @media (min-width:600px) { .lp-stats { grid-template-columns: repeat(4,1fr); } }
        @media (max-width:599px) {
          .lp-stat:nth-child(2) { border-right: none; }
          .lp-stat:nth-child(1), .lp-stat:nth-child(2) { border-bottom: 1px solid ${C.s3}; padding-bottom: 14px; }
        }

        /* Perks grid: 1 col → 2 col 480px → 4 col 768px */
        .lp-perks { display: grid; grid-template-columns: 1fr; gap: 14px; }
        @media (min-width:480px) { .lp-perks { grid-template-columns: 1fr 1fr; gap: 16px; } }
        @media (min-width:768px) { .lp-perks { grid-template-columns: repeat(4,1fr); gap: 20px; } }

        /* How it works steps: 2 col → 4 col */
        .lp-steps { display: grid; grid-template-columns: repeat(2,1fr); gap: 24px; }
        @media (min-width:640px) { .lp-steps { grid-template-columns: repeat(4,1fr); } }

        /* Nav hide sign-in on very narrow */
        @media (max-width:340px) { .nav-signin { display: none; } }

        /* Agent row hover */
        .agent-row { transition: border-color 0.15s, background 0.15s; }
        .agent-row:hover { border-color: ${C.cyan}60 !important; }

        /* Hide join button text label on very narrow, show icon only */
        @media (max-width:380px) { .agent-join-btn { padding: 8px 10px; } }
      `}</style>
    </div>
  );
}

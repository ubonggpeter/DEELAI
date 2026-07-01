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
  { icon: Zap,         label: "Daily Payouts",        desc: "Get paid every day you work"         },
  { icon: Shield,      label: "Secure Platform",      desc: "Bank-grade data security"            },
  { icon: Star,        label: "Skill Certificates",   desc: "Earn certificates as you progress"   },
  { icon: Users,       label: "Global Community",     desc: "Join thousands of remote workers"    },
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
        padding: "0 20px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", height: 60, gap: 12 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg,#00D4FF,#0055DD)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, color: "#fff", fontSize: 15, fontFamily: "system-ui",
            }}>D</div>
            <span style={{ fontWeight: 900, fontSize: 18, fontFamily: "system-ui" }}>
              DEEL<span style={{ color: C.cyan }}>Ai</span>
            </span>
          </div>
          <div style={{ flex: 1 }} />
          <a href="/login" style={{
            color: C.txt2, fontSize: 14, textDecoration: "none",
            padding: "6px 14px", borderRadius: 7, border: `1px solid ${C.s3}`,
            transition: "all 0.15s",
          }}>
            Sign In
          </a>
          <a href="#channels" style={{
            background: C.cyan, color: "#060A12",
            fontSize: 14, fontWeight: 700, textDecoration: "none",
            padding: "7px 16px", borderRadius: 7,
          }}>
            Join Now
          </a>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "72px 20px 56px",
        textAlign: "center",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: `${C.cyan}15`, border: `1px solid ${C.cyan}30`,
          borderRadius: 20, padding: "4px 12px", marginBottom: 24,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, animation: "pulse 2s infinite" }} />
          <span style={{ color: C.cyan, fontSize: 12, fontWeight: 700 }}>Actively hiring • Remote positions available</span>
        </div>

        <h1 style={{
          fontSize: "clamp(32px, 7vw, 64px)", fontWeight: 900, lineHeight: 1.1,
          margin: "0 0 20px", letterSpacing: "-0.02em",
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
          color: C.txt2, fontSize: "clamp(15px, 2.5vw, 18px)",
          maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.7,
        }}>
          Join our global network of remote data annotators. Work on your schedule,
          earn a real salary, and grow your career — all from home.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#channels" style={{
            background: `linear-gradient(135deg, ${C.cyan}, #0099BB)`,
            color: "#060A12", fontWeight: 800, fontSize: 16,
            padding: "13px 28px", borderRadius: 10, textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            Choose Your Channel <ArrowRight size={18} />
          </a>
          <a href="/login" style={{
            background: C.s1, border: `1px solid ${C.s3}`,
            color: C.txt2, fontSize: 15,
            padding: "13px 24px", borderRadius: 10, textDecoration: "none",
          }}>
            I have an account
          </a>
        </div>

        {/* Stats */}
        <div style={{
          display: "flex", gap: 0, justifyContent: "center", flexWrap: "wrap",
          marginTop: 56, borderTop: `1px solid ${C.s3}`, paddingTop: 36,
        }}>
          {[
            { value: "2,400+", label: "Active Workers" },
            { value: "$1.2M+", label: "Total Paid Out" },
            { value: "99.2%", label: "Accuracy Rate" },
            { value: "24 hrs", label: "Max Review Time" },
          ].map((s, i) => (
            <div key={i} style={{ flex: "1 1 120px", padding: "12px 20px", borderRight: i < 3 ? `1px solid ${C.s3}` : undefined }}>
              <div style={{ color: C.cyan, fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 800 }}>{s.value}</div>
              <div style={{ color: C.txt3, fontSize: 12, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Perks ────────────────────────────────────────────────────── */}
      <div style={{ background: C.s1, borderTop: `1px solid ${C.s3}`, borderBottom: `1px solid ${C.s3}`, padding: "40px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20 }}>
          {PERKS.map(({ icon: Icon, label, desc }) => (
            <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                background: `${C.cyan}15`, border: `1px solid ${C.cyan}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={17} color={C.cyan} />
              </div>
              <div>
                <div style={{ color: C.txt, fontSize: 14, fontWeight: 700 }}>{label}</div>
                <div style={{ color: C.txt3, fontSize: 12, marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Channel selection ─────────────────────────────────────────── */}
      <div id="channels" style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: "clamp(24px, 5vw, 40px)", fontWeight: 800, margin: "0 0 12px" }}>
            Choose Your Channel
          </h2>
          <p style={{ color: C.txt2, fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
            Each channel is managed by a dedicated sub-admin. Select the one that fits your goals.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Loader2 size={32} color={C.cyan} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : channels.length === 0 ? (
          <div style={{ textAlign: "center", color: C.txt3, padding: "40px 0" }}>
            No channels are currently open for registration. Check back soon.
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
            gap: 20,
          }}>
            {channels.map((ch, i) => {
              const color = CHANNEL_COLORS[i % CHANNEL_COLORS.length];
              const isSelected = selected === ch.id;
              return (
                <div
                  key={ch.id}
                  onClick={() => selectChannel(ch.id)}
                  style={{
                    background: C.s1,
                    border: `1.5px solid ${isSelected ? color : C.s3}`,
                    borderRadius: 16, padding: "24px",
                    cursor: "pointer", transition: "all 0.2s",
                    position: "relative", overflow: "hidden",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = color + "80")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = isSelected ? color : C.s3)}
                >
                  {/* Glow top-left */}
                  <div style={{
                    position: "absolute", top: -40, left: -40,
                    width: 120, height: 120, borderRadius: "50%",
                    background: `${color}10`, pointerEvents: "none",
                  }} />

                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: `${color}18`, border: `1.5px solid ${color}40`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, fontWeight: 900, color, fontFamily: "system-ui",
                    }}>
                      {ch.channelName}
                    </div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 5,
                      background: `${C.green}12`, border: `1px solid ${C.green}30`,
                      borderRadius: 20, padding: "3px 9px",
                    }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.green }} />
                      <span style={{ color: C.green, fontSize: 10, fontWeight: 700 }}>OPEN</span>
                    </div>
                  </div>

                  <h3 style={{ color: C.txt, fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>
                    Channel {ch.channelName}
                  </h3>
                  <p style={{ color: C.txt2, fontSize: 13, lineHeight: 1.6, margin: "0 0 18px" }}>
                    {ch.description}
                  </p>

                  <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 5,
                      background: `${C.gold}12`, border: `1px solid ${C.gold}30`, color: C.gold,
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                      <Clock size={10} /> {ch.estTime} review
                    </span>
                    {ch.jobPassFee > 0 && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 5,
                        background: `${color}12`, border: `1px solid ${color}30`, color,
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
                    transition: "background 0.15s",
                  }}>
                    {isSelected ? <><CheckCircle2 size={15} /> Selected</> : <>Join Channel {ch.channelName} <ChevronRight size={15} /></>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <div style={{ background: C.s1, borderTop: `1px solid ${C.s3}`, padding: "56px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(20px, 4vw, 32px)", fontWeight: 800, marginBottom: 40 }}>
            How It Works
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 24 }}>
            {[
              { step:"01", title:"Pick a Channel",  desc:"Select the channel that matches your schedule and goals." },
              { step:"02", title:"Register",         desc:"Fill in your details, get your job pass, and upload your CV." },
              { step:"03", title:"Get Approved",     desc:"Channel admin reviews and approves your account within 24 hrs." },
              { step:"04", title:"Start Earning",    desc:"Log in, complete annotation tasks, and get paid daily." },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ textAlign: "center" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, margin: "0 auto 12px",
                  background: `${C.cyan}15`, border: `1px solid ${C.cyan}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: C.cyan, fontWeight: 800, fontFamily: "monospace", fontSize: 14,
                }}>
                  {step}
                </div>
                <div style={{ color: C.txt, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{title}</div>
                <div style={{ color: C.txt3, fontSize: 12, lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${C.s3}`, padding: "24px 20px", textAlign: "center" }}>
        <div style={{ color: C.txt3, fontSize: 12 }}>
          © 2026 DEELAI · Remote Work Platform ·{" "}
          <a href="/login"   style={{ color: C.txt2, textDecoration: "none" }}>Sign In</a>
          {" · "}
          <a href="/admin"   style={{ color: C.txt2, textDecoration: "none" }}>Admin</a>
        </div>
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}

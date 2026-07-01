"use client";
import { Bell, Flame, Star, Tag, Mic, Shield, DollarSign, ChevronRight, Users, Timer } from "lucide-react";
import { JOBS } from "@/lib/data";
import { User } from "@/lib/types";
import Bar from "@/components/atoms/Bar";
import Stars from "@/components/atoms/Stars";

interface Props {
  user: User;
  setScreen: (s: any) => void;
  notifCount: number;
  setMenuOpen: (v: boolean) => void;
}

const jobIconMap: Record<string, React.ReactNode> = {
  annotation: <Tag size={24} color="#00D4FF" />,
  transcription: <Mic size={24} color="#8B5CF6" />,
  moderation: <Shield size={24} color="#FFB800" />,
};

const feedIconMap: Record<string, React.ReactNode> = {
  Tag: <Tag size={18} color="#7D8BAA" />,
  Users: <Users size={18} color="#7D8BAA" />,
};

const feed = [
  { icon: "Tag", text: "Annotation job #A-2291 completed", time: "2 mins ago", amt: "+$12.50", c: "#00E5A0" },
  { icon: "Tag", text: "Annotation job #A-2290 completed", time: "16 mins ago", amt: "+$12.50", c: "#00E5A0" },
  { icon: "Users", text: "Recruit bonus — Chukwudi Eze active", time: "1 hr ago", amt: "+$40.00", c: "#00D4FF" },
  { icon: "Tag", text: "Annotation job #A-2289 completed", time: "3 hrs ago", amt: "+$12.50", c: "#00E5A0" },
  { icon: "Tag", text: "Annotation job #A-2287 completed", time: "Yesterday", amt: "+$12.50", c: "#00E5A0" },
];

export default function ActivityScreen({ user, setScreen, notifCount, setMenuOpen }: Props) {
  return (
    <div className="animate-fadeUp" style={{ background: "var(--bg)" }}>
      <div className="relative">
        {/* HERO */}
        <div
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(175deg,#1448D0 0%,#0E38B0 40%,#0A2888 100%)",
            padding: "26px 18px 72px",
          }}
        >
          <div
            className="absolute pointer-events-none"
            style={{
              top: -80, right: -80, width: 260, height: 260,
              background: "radial-gradient(circle,rgba(130,180,255,.2) 0%,transparent 70%)",
            }}
          />

          {/* Top bar */}
          <div className="flex justify-between items-center mb-[22px]">
            <div className="flex items-center gap-[9px]">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(255,255,255,.14)",
                  border: "1px solid rgba(255,255,255,.22)",
                }}
              >
                <Star size={17} fill="#FFD700" stroke="#FFD700" />
              </div>
              <span
                className="font-bold text-[21px] tracking-tight text-white"
                style={{ fontFamily: "-apple-system-ui-serif,'SF Pro Display','Segoe UI','Helvetica Neue',Arial,sans-serif" }}
              >
                DEEL<span style={{ color: "#7DDDFF" }}>Ai</span>
              </span>
            </div>
            <div className="flex items-center gap-[10px]">
              <div
                className="relative cursor-pointer flex items-center justify-center"
                style={{
                  width: 38, height: 38, borderRadius: 11,
                  background: "rgba(255,255,255,.12)",
                  border: "1px solid rgba(255,255,255,.2)",
                }}
                onClick={() => setScreen("notifications")}
              >
                <Bell size={18} color="#fff" />
                {notifCount > 0 && (
                  <div
                    className="absolute flex items-center justify-center font-mono font-bold text-white"
                    style={{
                      top: -4, right: -4, width: 18, height: 18,
                      borderRadius: "50%", background: "#FF4D6D",
                      fontSize: 9, border: "2px solid #0A1830",
                    }}
                  >
                    {notifCount}
                  </div>
                )}
              </div>
              <button
                className="flex flex-col items-center justify-center gap-1 cursor-pointer"
                style={{
                  width: 38, height: 38, borderRadius: 11,
                  background: "rgba(255,255,255,.12)",
                  border: "1px solid rgba(255,255,255,.2)",
                }}
                onClick={() => setMenuOpen(true)}
              >
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 16, height: 2, background: "#fff", borderRadius: 2 }} />
                ))}
              </button>
            </div>
          </div>

          {/* User row */}
          <div className="flex items-center gap-[13px] mb-[22px]">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 56, height: 56, borderRadius: 16,
                background: "rgba(0,0,0,.28)",
                border: "2px solid rgba(255,255,255,.18)",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.58)", marginBottom: 2 }}>Welcome back,</div>
              <div
                className="font-bold text-white"
                style={{
                  fontFamily: "-apple-system-ui-serif,'SF Pro Display',sans-serif",
                  fontSize: 23, lineHeight: 1.1,
                }}
              >
                {user.name}
              </div>
              <div className="flex items-center gap-[6px] mt-1" style={{ fontSize: 11, color: "rgba(255,255,255,.48)", fontFamily: "monospace", letterSpacing: 1 }}>
                {user.level}
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00E5A0", display: "inline-block" }} />
              </div>
            </div>
            <div className="text-right">
              <div
                className="text-white font-bold font-mono mb-1.5"
                style={{
                  background: "rgba(255,255,255,.1)",
                  border: "1px solid rgba(255,255,255,.22)",
                  borderRadius: 8, padding: "5px 13px", fontSize: 10, letterSpacing: 1,
                }}
              >
                ACTIVE
              </div>
              <div className="flex items-center gap-1 justify-end" style={{ fontSize: 11, color: "#FFB800", fontFamily: "monospace", fontWeight: 600 }}>
                <Flame size={12} fill="#FFB800" stroke="#FFB800" className="animate-streak" />
                {user.streak} day streak
              </div>
            </div>
          </div>

          {/* Salary */}
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.52)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 5, fontFamily: "monospace" }}>
            Your Current Salary
          </div>
          <div
            className="font-black text-white"
            style={{
              fontFamily: "-apple-system-ui-serif,'SF Pro Display',sans-serif",
              fontSize: 48, letterSpacing: -1.5, lineHeight: 1,
            }}
          >
            <span style={{ fontSize: 22, verticalAlign: "top", marginTop: 11, display: "inline-block" }}>$</span>
            {Math.floor(user.salary).toLocaleString()}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.48)", marginTop: 8 }}>
            May 2026 · Monthly salary · Keep pushing
          </div>

          {!user.isPermanent && (
            <div style={{ marginTop: 14, background: "rgba(0,0,0,.2)", borderRadius: 10, padding: "10px 12px" }}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="flex items-center gap-1.5" style={{ fontSize: 11, color: "rgba(255,255,255,.55)" }}>
                  <Timer size={12} />
                  Daily job limit
                </span>
                <span style={{ fontSize: 11, color: "#FFB800", fontFamily: "monospace", fontWeight: 600 }}>
                  {user.jobsToday}/15 jobs
                </span>
              </div>
              <Bar pct={Math.round((user.jobsToday / 15) * 100)} color="#FFB800" h={5} />
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginTop: 4 }}>
                Upgrade to Permanent for unlimited jobs
              </div>
            </div>
          )}
        </div>

        {/* FLOATING CARD */}
        <div
          className="relative"
          style={{
            marginTop: -58, marginLeft: 12, marginRight: 12,
            background: "#111B2E",
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 -2px 0 rgba(255,255,255,.04),0 20px 60px rgba(0,0,0,.6)",
            zIndex: 2,
          }}
        >
          <div style={{ padding: "22px 18px 8px" }}>
            <div
              className="font-bold text-white mb-2"
              style={{
                fontFamily: "-apple-system-ui-serif,'SF Pro Display',sans-serif",
                fontSize: 16, lineHeight: 1.5,
              }}
            >
              At <span style={{ color: "#60CCFF" }}>DEELAi</span>, every job you complete
              <br />puts real money in your wallet.
            </div>
            <div style={{ fontSize: 13, color: "var(--txt2)", lineHeight: 1.65, marginBottom: 18 }}>
              We have identified 3 high-impact AI jobs our top earners stack daily. The more streams you activate, the faster your income scales.
            </div>

            {JOBS.map((j, idx) => (
              <div
                key={j.id}
                className="flex items-center gap-[14px]"
                style={{
                  padding: "15px 0",
                  borderBottom: idx < JOBS.length - 1 ? "1px solid rgba(255,255,255,.07)" : "none",
                  cursor: j.locked ? "not-allowed" : "pointer",
                  opacity: j.locked ? 0.5 : 1,
                }}
                onClick={() => !j.locked && setScreen("workspace")}
              >
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: j.dim,
                    border: `1px solid ${j.color}25`,
                  }}
                >
                  {jobIconMap[j.id]}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-bold text-white mb-[3px]"
                    style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 15 }}
                  >
                    {j.title}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--txt2)", marginBottom: 6, lineHeight: 1.4 }}>{j.sub}</div>
                  <div className="flex items-center gap-1.5">
                    <Stars n={j.stars} />
                    <span style={{ fontSize: 11, color: j.tagC, fontWeight: 700 }}>{j.tag}</span>
                  </div>
                </div>
                <div
                  className="flex-shrink-0 text-center"
                  style={{
                    background: j.color, borderRadius: 12, padding: "10px 14px",
                    boxShadow: `0 4px 18px ${j.color}44`, minWidth: 72,
                  }}
                >
                  <div
                    className="font-black text-white"
                    style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 17, lineHeight: 1 }}
                  >
                    {j.rate}
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,.65)", fontFamily: "monospace", marginTop: 2 }}>
                    {j.rateUnit}
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => setScreen("workspace")}
              className="w-full flex items-center justify-center gap-3 font-bold text-white"
              style={{
                margin: "18px 0 4px",
                padding: "17px 20px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                background: "linear-gradient(135deg,#00D68A,#00B872)",
                fontSize: 17,
                boxShadow: "0 6px 24px rgba(0,214,138,.35)",
                fontFamily: "-apple-system-ui-serif,sans-serif",
              }}
            >
              <DollarSign size={20} />
              Start Earning Now
              <div
                className="flex items-center justify-center ml-auto"
                style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,.2)", fontSize: 15 }}
              >
                <ChevronRight size={16} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Streak banner */}
      {user.streak >= 3 && (
        <div
          className="flex items-center gap-3 mx-4 mt-4"
          style={{
            background: "linear-gradient(135deg,rgba(255,184,0,.1),rgba(255,77,109,.1))",
            border: "1px solid rgba(255,184,0,.25)",
            borderRadius: 14,
            padding: "12px 16px",
          }}
        >
          <Flame size={24} fill="#FFB800" stroke="#FFB800" className="animate-streak flex-shrink-0" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#FFB800" }}>{user.streak}-Day Streak! +10% Bonus Active</div>
            <div style={{ fontSize: 11, color: "var(--txt2)", marginTop: 2 }}>Keep working daily to maintain your streak bonus</div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div style={{ padding: "22px 18px 0" }}>
        <div
          className="font-bold text-white mb-3.5"
          style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 16 }}
        >
          Recent Activity
        </div>
        {feed.map((f, i) => (
          <div
            key={i}
            className="flex items-center gap-3"
            style={{
              padding: "13px 16px",
              background: "var(--s1)",
              borderRadius: 14,
              marginBottom: 8,
              border: "1px solid var(--b1)",
            }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: 42, height: 42, borderRadius: 12, background: "var(--s2)", border: "1px solid var(--b1)" }}
            >
              {feedIconMap[f.icon]}
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>{f.text}</div>
              <div style={{ fontSize: 11, color: "var(--txt2)", marginTop: 2 }}>{f.time}</div>
            </div>
            <div style={{ fontFamily: "monospace", fontWeight: 700, color: f.c, fontSize: 14 }}>{f.amt}</div>
          </div>
        ))}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

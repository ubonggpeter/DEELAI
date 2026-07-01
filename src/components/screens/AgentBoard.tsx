"use client";
import { useState, useEffect } from "react";
import { Globe, AlertTriangle, ChevronDown, Rocket, User } from "lucide-react";
import { LargeGlobe } from "@/components/atoms/Globe";
import Spinner from "@/components/atoms/Spinner";
import { REGIONS, TICKER } from "@/lib/data";

const statusColor = (s: string) =>
  s === "active" ? "#00E5A0" : s === "duty" ? "#FFB800" : "#4A5470";

export default function AgentBoard({ onActivate }: { onActivate: () => void }) {
  const [openRegion, setOpenRegion] = useState<string | null>(null);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [spotsLeft, setSpotsLeft] = useState(47);
  const [activating, setActivating] = useState(false);

  const totalAgents = REGIONS.reduce((s, r) => s + r.agents.length, 0);
  const activeCount = REGIONS.reduce(
    (s, r) => s + r.agents.filter((a) => a.status === "active").length,
    0
  );

  useEffect(() => {
    const t = setInterval(() => setTickerIdx((i) => (i + 1) % TICKER.length), 2800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSpotsLeft((n) => (n > 38 ? n - 1 : n)), 14000);
    return () => clearInterval(t);
  }, []);

  function handleActivate() {
    setActivating(true);
    setTimeout(() => { setActivating(false); onActivate(); }, 2400);
  }

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: "#040810" }}>
      {/* Glow blob */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: -120, left: "50%", transform: "translateX(-50%)",
          width: 600, height: 400,
          background: "radial-gradient(ellipse,rgba(0,212,255,.15) 0%,transparent 70%)",
        }}
      />

      <div className="relative z-[1]">
        {/* ── Header ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-6 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div
              className="flex items-center justify-center rounded-[11px] font-extrabold text-white text-xl shrink-0"
              style={{
                width: 42, height: 42,
                background: "linear-gradient(135deg,#00D4FF,#0055DD)",
                boxShadow: "0 4px 20px rgba(0,212,255,.4)",
              }}
            >
              D
            </div>
            <span className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              DEEL<span style={{ color: "#00D4FF" }}>Ai</span>
            </span>
          </div>

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4"
            style={{ background: "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.25)" }}
          >
            <span className="inline-block w-2 h-2 rounded-full animate-boardPulse" style={{ background: "#00E5A0" }} />
            <span className="text-[11px] sm:text-xs font-semibold tracking-widest font-mono" style={{ color: "#00E5A0" }}>
              AGENTS ONLINE NOW
            </span>
          </div>

          {/* Title */}
          <h1 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl leading-tight text-white mb-3">
            Global Agent<br />
            <span style={{ background: "linear-gradient(135deg,#00D4FF,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Job Pass Board
            </span>
          </h1>
          <p className="text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-6" style={{ color: "var(--txt2)" }}>
            Our certified regional agents are standing by to deliver your Job Pass, walk you through training,
            and get you earning within 24 hours. Select your region to connect.
          </p>
        </div>

        {/* ── Desktop split / Mobile single column ── */}
        <div className="lg:flex lg:gap-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Left: Globe + Stats + Ticker */}
          <div className="lg:w-80 lg:shrink-0">
            <LargeGlobe />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { Icon: Globe, label: "TOTAL AGENTS", value: totalAgents, color: "#00D4FF" },
                { Icon: User, label: "ACTIVE NOW", value: activeCount, color: "#00E5A0" },
                { Icon: AlertTriangle, label: "SPOTS LEFT", value: spotsLeft, color: "#FFB800" },
              ].map(({ Icon, label, value, color }) => (
                <div
                  key={label}
                  className="rounded-2xl p-3 text-center"
                  style={{ background: "rgba(255,255,255,.04)", border: `1px solid ${color}22` }}
                >
                  <div className="flex justify-center mb-1"><Icon size={15} color={color} /></div>
                  <div className="font-extrabold text-lg sm:text-xl" style={{ color }}>{value}</div>
                  <div className="text-[9px] mt-0.5 tracking-wide font-mono" style={{ color: "var(--txt2)" }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Ticker */}
            <div
              className="rounded-xl px-3.5 flex items-center gap-2.5 overflow-hidden mb-1"
              style={{ background: "rgba(0,0,0,.3)", border: "1px solid rgba(255,255,255,.06)", height: 42 }}
            >
              <span className="text-[10px] font-bold shrink-0 tracking-widest font-mono" style={{ color: "#FF4D6D" }}>LIVE</span>
              <div
                key={tickerIdx}
                className="text-[12px] whitespace-nowrap overflow-hidden text-ellipsis animate-tickerSlide font-mono"
                style={{ color: "var(--txt2)" }}
              >
                <span style={{ color: "#00E5A0" }}>✓ </span>{TICKER[tickerIdx]}
              </div>
            </div>
            <p className="text-[11px] mb-6 font-mono" style={{ color: "var(--txt3)" }}>
              Live agent activity — updating every few seconds
            </p>
          </div>

          {/* Right: Regions + CTA */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold mb-4 tracking-wider font-mono" style={{ color: "var(--txt2)" }}>
              FIND YOUR REGIONAL AGENT
            </p>

            {REGIONS.map((region) => {
              const isOpen = openRegion === region.id;
              const active = region.agents.filter((a) => a.status === "active").length;
              return (
                <div
                  key={region.id}
                  className="mb-2.5 rounded-[18px] overflow-hidden transition-[border-color] duration-300"
                  style={{
                    border: `1px solid ${isOpen ? region.color + "44" : "rgba(255,255,255,.07)"}`,
                    background: "rgba(255,255,255,.02)",
                  }}
                >
                  <div
                    className="flex items-center gap-3 px-4 py-4 cursor-pointer"
                    onClick={() => setOpenRegion(isOpen ? null : region.id)}
                  >
                    <div
                      className="flex items-center justify-center rounded-xl shrink-0"
                      style={{ width: 42, height: 42, background: `${region.color}12`, border: `1px solid ${region.color}30` }}
                    >
                      <Globe size={20} color={region.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm sm:text-base text-white">{region.name}</div>
                      <div className="flex items-center gap-1.5 text-[11px] mt-0.5" style={{ color: "var(--txt2)" }}>
                        <span style={{ color: "#00E5A0", fontWeight: 600 }}>● {active} available</span>
                        <span>·</span>
                        <span>{region.agents.length} agents</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 mr-2">
                      <div className="text-xs font-semibold font-mono" style={{ color: "#00E5A0" }}>{active} online</div>
                      <div className="text-[9px] mt-0.5 font-mono" style={{ color: "var(--txt3)" }}>RIGHT NOW</div>
                    </div>
                    <div
                      className="flex items-center justify-center rounded-lg transition-transform duration-300 shrink-0"
                      style={{
                        width: 28, height: 28,
                        background: `${region.color}14`, border: `1px solid ${region.color}28`,
                        color: region.color, transform: isOpen ? "rotate(180deg)" : "none",
                      }}
                    >
                      <ChevronDown size={14} />
                    </div>
                  </div>

                  {isOpen && (
                    <div className="pb-3" style={{ borderTop: `1px solid ${region.color}20` }}>
                      {region.agents.map((agent, ai) => (
                        <div
                          key={ai}
                          className="agent-row flex items-center gap-3 px-4 py-2.5 transition-[background] duration-150 animate-rowFade"
                          style={{ animationDelay: `${ai * 0.06}s` }}
                        >
                          <div
                            className="flex items-center justify-center rounded-lg shrink-0 font-bold text-xs"
                            style={{
                              width: 28, height: 28,
                              background: ai === 0 ? `${region.color}22` : "rgba(255,255,255,.04)",
                              border: `1px solid ${ai === 0 ? region.color + "44" : "rgba(255,255,255,.06)"}`,
                              color: ai === 0 ? region.color : "var(--txt3)",
                            }}
                          >
                            {ai === 0 ? "★" : ai + 1}
                          </div>
                          <div
                            className="relative flex items-center justify-center rounded-xl shrink-0"
                            style={{ width: 36, height: 36, background: `${region.color}0E`, border: `1px solid ${region.color}20` }}
                          >
                            <User size={16} color={region.color} />
                            <span
                              className="absolute bottom-[-2px] right-[-2px] w-[9px] h-[9px] rounded-full"
                              style={{ background: statusColor(agent.status), border: "1.5px solid #040810" }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white">{agent.name}</div>
                            <div className="text-[11px] mt-0.5 truncate" style={{ color: "var(--txt2)" }}>{agent.city}</div>
                          </div>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="shrink-0 text-[11px] font-semibold font-mono tracking-wide whitespace-nowrap rounded-full cursor-pointer min-h-[36px] px-4"
                            style={{ border: `1px solid ${region.color}55`, background: `${region.color}12`, color: region.color }}
                          >
                            Contact
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Urgency */}
            <div
              className="my-5 rounded-2xl p-4 sm:p-5 flex gap-3 items-start"
              style={{
                background: "linear-gradient(135deg,rgba(255,184,0,.08),rgba(255,77,109,.08))",
                border: "1px solid rgba(255,184,0,.25)",
              }}
            >
              <AlertTriangle size={22} color="#FFB800" className="shrink-0 mt-0.5" />
              <div>
                <div className="text-sm sm:text-base font-bold mb-1" style={{ color: "#FFB800" }}>
                  Only {spotsLeft} Job Pass slots remaining
                </div>
                <div className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--txt2)" }}>
                  Our agents are actively onboarding new members. Secure your Job Pass now before your regional slots are filled.
                </div>
              </div>
            </div>

            {/* Activate */}
            <button
              onClick={handleActivate}
              disabled={activating}
              className="w-full rounded-2xl border-none text-white font-black text-lg sm:text-xl flex items-center justify-center gap-3 min-h-[56px] transition-all duration-300 mb-3"
              style={{
                padding: "18px 24px",
                cursor: activating ? "wait" : "pointer",
                background: activating ? "var(--s3)" : "linear-gradient(135deg,#00D4FF 0%,#0066FF 100%)",
                boxShadow: activating ? "none" : "0 8px 40px rgba(0,212,255,.45)",
              }}
            >
              {activating ? (
                <><Spinner />Activating Your Pass…</>
              ) : (
                <><Rocket size={22} />Activate My Job Pass <span style={{ opacity: 0.7 }}>→</span></>
              )}
            </button>
            <p className="text-center text-[11px] leading-relaxed font-mono" style={{ color: "var(--txt3)" }}>
              Free to activate. Your regional agent will contact you within minutes to begin your onboarding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

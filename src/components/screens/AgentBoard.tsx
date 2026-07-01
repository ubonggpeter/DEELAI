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
    const t = setInterval(
      () => setSpotsLeft((n) => (n > 38 ? n - 1 : n)),
      14000
    );
    return () => clearInterval(t);
  }, []);

  function handleActivate() {
    setActivating(true);
    setTimeout(() => {
      setActivating(false);
      onActivate();
    }, 2400);
  }

  return (
    <div
      className="fixed inset-0 z-[900] overflow-y-auto"
      style={{ background: "#040810" }}
    >
      {/* Glow */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: -120,
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 340,
          background: "radial-gradient(ellipse,rgba(0,212,255,.18) 0%,transparent 70%)",
        }}
      />

      <div className="relative z-[1] max-w-[430px] mx-auto">
        <div className="px-5 pt-12 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div
              className="flex items-center justify-center rounded-[11px] font-extrabold text-white text-xl"
              style={{
                width: 40,
                height: 40,
                background: "linear-gradient(135deg,#00D4FF,#0055DD)",
                boxShadow: "0 4px 20px rgba(0,212,255,.4)",
                fontFamily: "-apple-system-ui-serif,'SF Pro Display','Segoe UI',sans-serif",
              }}
            >
              D
            </div>
            <span
              className="font-extrabold text-[26px] text-white tracking-[-1px]"
              style={{ fontFamily: "-apple-system-ui-serif,'SF Pro Display','Segoe UI',sans-serif" }}
            >
              DEEL<span style={{ color: "#00D4FF" }}>Ai</span>
            </span>
          </div>

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-[20px] px-3.5 py-[5px] mb-4"
            style={{
              background: "rgba(0,212,255,.08)",
              border: "1px solid rgba(0,212,255,.25)",
            }}
          >
            <span
              className="inline-block w-[7px] h-[7px] rounded-full animate-boardPulse"
              style={{ background: "#00E5A0" }}
            />
            <span
              className="text-[11px] font-semibold tracking-[1px]"
              style={{ color: "#00E5A0", fontFamily: "var(--fm,'SF Mono',monospace)" }}
            >
              AGENTS ONLINE NOW
            </span>
          </div>

          {/* Title */}
          <h1
            className="font-extrabold text-[28px] leading-tight text-white mb-2.5"
            style={{ fontFamily: "-apple-system-ui-serif,'SF Pro Display','Segoe UI',sans-serif" }}
          >
            Global Agent
            <br />
            <span
              style={{
                background: "linear-gradient(135deg,#00D4FF,#8B5CF6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Job Pass Board
            </span>
          </h1>

          <p className="text-[13px] leading-relaxed mb-5" style={{ color: "var(--txt2)" }}>
            Our certified regional agents are standing by to deliver your Job Pass, walk you
            through training, and get you earning within 24 hours. Select your region to connect.
          </p>

          <LargeGlobe />

          {/* Stats */}
          <div className="flex gap-2 mb-5">
            {[
              { Icon: Globe, label: "TOTAL AGENTS", value: totalAgents, color: "#00D4FF" },
              { Icon: User, label: "ACTIVE NOW", value: activeCount, color: "#00E5A0" },
              { Icon: AlertTriangle, label: "SPOTS LEFT", value: spotsLeft, color: "#FFB800" },
            ].map(({ Icon, label, value, color }) => (
              <div
                key={label}
                className="flex-1 rounded-[14px] px-2 py-3 text-center"
                style={{
                  background: "rgba(255,255,255,.04)",
                  border: `1px solid ${color}22`,
                }}
              >
                <div className="flex justify-center mb-1">
                  <Icon size={16} color={color} />
                </div>
                <div
                  className="font-extrabold text-xl"
                  style={{
                    color,
                    fontFamily: "-apple-system-ui-serif,'SF Pro Display','Segoe UI',sans-serif",
                  }}
                >
                  {value}
                </div>
                <div
                  className="text-[9px] mt-0.5 tracking-[0.5px]"
                  style={{ color: "var(--txt2)", fontFamily: "monospace" }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Ticker */}
          <div
            className="rounded-[10px] px-3.5 py-2.5 mb-1.5 text-left overflow-hidden flex items-center gap-2.5"
            style={{
              background: "rgba(0,0,0,.3)",
              border: "1px solid rgba(255,255,255,.06)",
              height: 42,
            }}
          >
            <span
              className="text-[10px] font-bold shrink-0 tracking-[1px]"
              style={{ color: "#FF4D6D", fontFamily: "monospace" }}
            >
              LIVE
            </span>
            <div
              key={tickerIdx}
              className="text-[12px] whitespace-nowrap overflow-hidden text-ellipsis animate-tickerSlide"
              style={{ color: "var(--txt2)", fontFamily: "monospace" }}
            >
              <span style={{ color: "#00E5A0" }}>✓ </span>
              {TICKER[tickerIdx]}
            </div>
          </div>
          <p
            className="text-[11px] mb-6 text-left"
            style={{ color: "var(--txt3)", fontFamily: "monospace" }}
          >
            Live agent activity — updating every few seconds
          </p>
        </div>

        {/* Regions */}
        <div className="px-4">
          <p
            className="text-[14px] font-bold mb-3.5 tracking-[0.5px]"
            style={{
              color: "var(--txt2)",
              fontFamily: "-apple-system-ui-serif,'SF Pro Display','Segoe UI',sans-serif",
            }}
          >
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
                  className="flex items-center gap-3 px-[18px] py-4 cursor-pointer"
                  onClick={() => setOpenRegion(isOpen ? null : region.id)}
                >
                  <div
                    className="flex items-center justify-center rounded-[12px] shrink-0"
                    style={{
                      width: 42,
                      height: 42,
                      background: `${region.color}12`,
                      border: `1px solid ${region.color}30`,
                    }}
                  >
                    <Globe size={20} color={region.color} />
                  </div>
                  <div className="flex-1">
                    <div
                      className="font-bold text-[15px] text-white"
                      style={{ fontFamily: "-apple-system-ui-serif,'SF Pro Display','Segoe UI',sans-serif" }}
                    >
                      {region.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] mt-0.5" style={{ color: "var(--txt2)" }}>
                      <span style={{ color: "#00E5A0", fontWeight: 600 }}>● {active} available</span>
                      <span>·</span>
                      <span>{region.agents.length} agents</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] font-semibold" style={{ color: "#00E5A0", fontFamily: "monospace" }}>
                      {active} online
                    </div>
                    <div className="text-[9px] mt-0.5" style={{ color: "var(--txt3)", fontFamily: "monospace" }}>
                      RIGHT NOW
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-center rounded-[8px] ml-1 transition-transform duration-300"
                    style={{
                      width: 28,
                      height: 28,
                      background: `${region.color}14`,
                      border: `1px solid ${region.color}28`,
                      color: region.color,
                      transform: isOpen ? "rotate(180deg)" : "none",
                    }}
                  >
                    <ChevronDown size={14} />
                  </div>
                </div>

                {isOpen && (
                  <div
                    className="pb-3"
                    style={{ borderTop: `1px solid ${region.color}20` }}
                  >
                    {region.agents.map((agent, ai) => (
                      <div
                        key={ai}
                        className="agent-row flex items-center gap-3 px-[18px] py-[11px] transition-[background] duration-150 animate-rowFade"
                        style={{ animationDelay: `${ai * 0.06}s` }}
                      >
                        <div
                          className="flex items-center justify-center rounded-[8px] shrink-0 font-bold text-[12px]"
                          style={{
                            width: 28,
                            height: 28,
                            background: ai === 0 ? `${region.color}22` : "rgba(255,255,255,.04)",
                            border: `1px solid ${ai === 0 ? region.color + "44" : "rgba(255,255,255,.06)"}`,
                            color: ai === 0 ? region.color : "var(--txt3)",
                          }}
                        >
                          {ai === 0 ? "★" : ai + 1}
                        </div>

                        <div
                          className="relative flex items-center justify-center rounded-[10px] shrink-0"
                          style={{
                            width: 36,
                            height: 36,
                            background: `${region.color}0E`,
                            border: `1px solid ${region.color}20`,
                          }}
                        >
                          <User size={16} color={region.color} />
                          <span
                            className="absolute bottom-[-2px] right-[-2px] w-[9px] h-[9px] rounded-full"
                            style={{
                              background: statusColor(agent.status),
                              border: "1.5px solid #040810",
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-white">{agent.name}</div>
                          <div
                            className="text-[11px] mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap"
                            style={{ color: "var(--txt2)" }}
                          >
                            {agent.city}
                          </div>
                        </div>

                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 text-[11px] font-semibold tracking-[0.3px] whitespace-nowrap rounded-[20px] cursor-pointer"
                          style={{
                            padding: "8px 16px",
                            border: `1px solid ${region.color}55`,
                            background: `${region.color}12`,
                            color: region.color,
                            fontFamily: "monospace",
                          }}
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

          {/* Urgency banner */}
          <div
            className="my-5 rounded-[16px] p-[18px] flex gap-3 items-center"
            style={{
              background: "linear-gradient(135deg,rgba(255,184,0,.08),rgba(255,77,109,.08))",
              border: "1px solid rgba(255,184,0,.25)",
            }}
          >
            <AlertTriangle size={24} color="#FFB800" className="shrink-0" />
            <div>
              <div className="text-[14px] font-bold mb-0.5" style={{ color: "#FFB800" }}>
                Only {spotsLeft} Job Pass slots remaining
              </div>
              <div className="text-[12px] leading-relaxed" style={{ color: "var(--txt2)" }}>
                Our agents are actively onboarding new members. Secure your Job Pass now before
                your regional slots are filled.
              </div>
            </div>
          </div>

          {/* Activate button */}
          <button
            onClick={handleActivate}
            disabled={activating}
            className="w-full rounded-[16px] border-none text-white font-black text-[18px] flex items-center justify-center gap-3 mb-3 transition-all duration-300"
            style={{
              padding: 18,
              cursor: activating ? "wait" : "pointer",
              background: activating
                ? "var(--s3)"
                : "linear-gradient(135deg,#00D4FF 0%,#0066FF 100%)",
              boxShadow: activating ? "none" : "0 8px 40px rgba(0,212,255,.45)",
              fontFamily: "-apple-system-ui-serif,'SF Pro Display','Segoe UI',sans-serif",
            }}
          >
            {activating ? (
              <>
                <Spinner />
                Activating Your Pass…
              </>
            ) : (
              <>
                <Rocket size={22} />
                Activate My Job Pass
                <span style={{ opacity: 0.7 }}>→</span>
              </>
            )}
          </button>

          <p
            className="text-center text-[11px] mb-10 leading-relaxed"
            style={{ color: "var(--txt3)", fontFamily: "monospace" }}
          >
            Free to activate. Your regional agent will contact you within minutes to begin your
            onboarding.
          </p>
        </div>
      </div>
    </div>
  );
}

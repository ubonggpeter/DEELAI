"use client";
import { ArrowLeft, Trophy, User } from "lucide-react";
import { LEADERBOARD } from "@/lib/data";

interface Props { onBack: () => void; }

const podiumColors  = ["#C0C0C0", "#FFD700", "#CD7F32"];
const podiumHeights = [80, 100, 70];
const podiumOrder   = [1, 0, 2];

const countryFlags: Record<string, string> = { NG: "🇳🇬", GH: "🇬🇭", GB: "🇬🇧" };

export default function LeaderboardScreen({ onBack }: Props) {
  return (
    <div className="animate-fadeUp w-full" style={{ background: "var(--bg)", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(145deg,#0A1230,#0E1845)" }} className="rounded-b-3xl mb-5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={onBack}
              className="flex items-center justify-center w-9 h-9 rounded-xl min-h-[44px] min-w-[44px]"
              style={{ background: "var(--b1)", color: "var(--txt2)", border: "none", cursor: "pointer" }}>
              <ArrowLeft size={18} />
            </button>
            <div className="text-xl sm:text-2xl font-black flex-1 text-white">Leaderboard</div>
            <div className="rounded-lg px-3 py-1 text-[11px] font-mono font-semibold"
              style={{ color: "#FFB800", background: "rgba(255,184,0,.1)", border: "1px solid rgba(255,184,0,.2)" }}>
              Jul 2026
            </div>
          </div>

          {/* Podium */}
          <div className="max-w-xs sm:max-w-sm mx-auto flex items-end justify-center gap-3 mt-2">
            {podiumOrder.map((idx, pi) => {
              const p = LEADERBOARD[idx];
              const color = podiumColors[pi];
              const height = podiumHeights[pi];
              return (
                <div key={p.rank} className="text-center flex-1">
                  <div className="flex justify-center mb-1">
                    <Trophy size={pi === 1 ? 28 : 20} style={{ color }} />
                  </div>
                  <div className="text-[11px] sm:text-xs font-semibold mb-1.5"
                    style={{ color: pi === 1 ? "#FFD700" : "var(--txt)" }}>
                    {p.name.split(" ")[0]}
                  </div>
                  <div className="flex flex-col items-center justify-end rounded-t-[10px]"
                    style={{ height, background: `${color}22`, border: `1px solid ${color}55`, padding: "8px 4px" }}>
                    <div className="text-[11px] font-mono font-semibold" style={{ color }}>{p.salary}</div>
                    <div className="text-[9px] font-mono mt-1" style={{ color: "var(--txt2)" }}>#{p.rank}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full List */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex flex-col gap-2">
          {LEADERBOARD.map((p, i) => (
            <div key={p.rank}
              className="flex items-center gap-3 rounded-2xl p-4 sm:p-5"
              style={{
                background: (p as any).isMe ? "rgba(0,212,255,.07)" : "var(--s1)",
                border: `1px solid ${(p as any).isMe ? "rgba(0,212,255,.25)" : "var(--b1)"}`,
              }}>
              {/* Rank Badge */}
              <div className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{ width: 34, height: 34, background: i < 3 ? "rgba(255,215,0,.1)" : "var(--s2)", fontWeight: 700, fontSize: 13 }}>
                {i < 3
                  ? <Trophy size={16} style={{ color: podiumColors[i] }} />
                  : <span style={{ color: "var(--txt2)" }}>{p.rank}</span>}
              </div>
              {/* Avatar */}
              <div className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{ width: 38, height: 38, background: "var(--s2)", color: "var(--txt3)" }}>
                <User size={18} />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm sm:text-base font-semibold truncate">
                  {p.name}{" "}
                  {(p as any).isMe && <span className="text-[10px] font-mono" style={{ color: "var(--cyan)" }}>(You)</span>}
                </div>
                <div className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--txt2)" }}>
                  {countryFlags[p.country] ?? p.country} · {p.tier} · {p.jobs.toLocaleString()} jobs
                </div>
              </div>
              {/* Salary */}
              <div className="text-right flex-shrink-0">
                <div className="text-sm sm:text-base font-mono font-semibold" style={{ color: "#00E5A0" }}>{p.salary}</div>
                <div className="text-[9px] font-mono mt-0.5" style={{ color: p.tier === "Permanent" ? "#00E5A0" : "#FFB800" }}>
                  {p.tier}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="h-8" />
      </div>
    </div>
  );
}

"use client";
import { ArrowLeft, Trophy, User } from "lucide-react";
import { LEADERBOARD } from "@/lib/data";

interface Props {
  onBack: () => void;
}

const podiumColors = ["#C0C0C0", "#FFD700", "#CD7F32"];
const podiumHeights = [80, 100, 70];
const podiumOrder = [1, 0, 2]; // indices into LEADERBOARD for 2nd, 1st, 3rd

const countryFlags: Record<string, string> = {
  NG: "🇳🇬",
  GH: "🇬🇭",
  GB: "🇬🇧",
};

export default function LeaderboardScreen({ onBack }: Props) {
  return (
    <div className="animate-fadeUp" style={{ background: "var(--bg)", minHeight: "100%" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(145deg,#0A1230,#0E1845)",
          padding: "24px 18px 20px",
          borderRadius: "0 0 24px 24px",
          marginBottom: 20,
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: "var(--b1)", color: "var(--txt2)", border: "none", cursor: "pointer" }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ fontWeight: 800, fontSize: 20, flex: 1 }}>Leaderboard</div>
          <div
            className="rounded-lg px-3 py-1 text-[11px] font-mono font-semibold"
            style={{ color: "#FFB800", background: "rgba(255,184,0,.1)", border: "1px solid rgba(255,184,0,.2)" }}
          >
            Jul 2026
          </div>
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-2 mt-2">
          {podiumOrder.map((idx, pi) => {
            const p = LEADERBOARD[idx];
            const color = podiumColors[pi];
            const height = podiumHeights[pi];
            return (
              <div key={p.rank} className="text-center flex-1">
                <div className="flex justify-center mb-1">
                  <Trophy size={pi === 1 ? 28 : 22} style={{ color }} />
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    marginBottom: 6,
                    color: pi === 1 ? "#FFD700" : "var(--txt)",
                  }}
                >
                  {p.name.split(" ")[0]}
                </div>
                <div
                  className="flex flex-col items-center justify-end"
                  style={{
                    height,
                    background: `${color}22`,
                    border: `1px solid ${color}55`,
                    borderRadius: "10px 10px 0 0",
                    padding: "8px 4px",
                  }}
                >
                  <div style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 600, color }}>{p.salary}</div>
                  <div style={{ fontSize: 9, color: "var(--txt2)", fontFamily: "monospace", marginTop: 2 }}>
                    #{p.rank}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full List */}
      <div style={{ padding: "0 16px" }}>
        {LEADERBOARD.map((p, i) => (
          <div
            key={p.rank}
            className="flex items-center gap-3 rounded-2xl mb-2"
            style={{
              padding: "13px 14px",
              background: (p as any).isMe ? "rgba(0,212,255,.07)" : "var(--s1)",
              border: `1px solid ${(p as any).isMe ? "rgba(0,212,255,.25)" : "var(--b1)"}`,
            }}
          >
            {/* Rank Badge */}
            <div
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{
                width: 32,
                height: 32,
                background: i < 3 ? "rgba(255,215,0,.1)" : "var(--s2)",
                color: i < 3 ? "#FFD700" : "var(--txt2)",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {i < 3 ? <Trophy size={16} style={{ color: podiumColors[i] }} /> : `#${p.rank}`}
            </div>

            {/* Avatar */}
            <div
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ width: 36, height: 36, background: "var(--s2)", color: "var(--txt3)" }}
            >
              <User size={18} />
            </div>

            {/* Name / Info */}
            <div className="flex-1">
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {p.name}{" "}
                {(p as any).isMe && (
                  <span style={{ fontSize: 10, color: "var(--cyan)", fontFamily: "monospace" }}>(You)</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: "var(--txt2)", marginTop: 1 }}>
                {countryFlags[p.country] ?? p.country} · {p.tier} · {p.jobs.toLocaleString()} jobs
              </div>
            </div>

            {/* Salary */}
            <div className="text-right">
              <div style={{ fontFamily: "monospace", fontWeight: 600, color: "#00E5A0", fontSize: 13 }}>
                {p.salary}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: p.tier === "Permanent" ? "#00E5A0" : "#FFB800",
                  fontFamily: "monospace",
                  marginTop: 2,
                }}
              >
                {p.tier}
              </div>
            </div>
          </div>
        ))}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

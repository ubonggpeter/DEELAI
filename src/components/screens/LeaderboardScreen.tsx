"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Trophy, User } from "lucide-react";
import Image from "next/image";

interface Props { onBack: () => void; }

interface LeaderEntry {
  id: string; name: string; country: string; salary: number;
  jobsDone: number; tier: string; avatarUrl?: string; adminAvatarUrl?: string;
}

const podiumColors  = ["#C0C0C0", "#FFD700", "#CD7F32"];
const podiumHeights = [80, 100, 70];
const podiumOrder   = [1, 0, 2];

const MONTH = new Date().toLocaleString("en-US", { month: "short", year: "numeric" });

export default function LeaderboardScreen({ onBack }: Props) {
  const [entries,   setEntries]   = useState<LeaderEntry[]>([]);
  const [threshold, setThreshold] = useState(0);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/auth/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        setEntries(d.users ?? []);
        setThreshold(d.threshold ?? 0);
      })
      .finally(() => setLoading(false));
  }, []);

  const top3 = entries.slice(0, 3);

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
              {MONTH}
            </div>
          </div>

          {/* Podium */}
          {top3.length >= 3 && (
            <div className="max-w-xs sm:max-w-sm mx-auto flex items-end justify-center gap-3 mt-2">
              {podiumOrder.map((idx, pi) => {
                const p = top3[idx];
                if (!p) return null;
                const color = podiumColors[pi];
                const height = podiumHeights[pi];
                const avatar = p.adminAvatarUrl ?? p.avatarUrl;
                return (
                  <div key={idx} className="text-center flex-1">
                    <div className="flex justify-center mb-1">
                      {avatar
                        ? <Image src={avatar} alt={p.name} width={pi===1?36:28} height={pi===1?36:28} style={{ borderRadius:"50%", objectFit:"cover", border:`2px solid ${color}` }} unoptimized />
                        : <Trophy size={pi === 1 ? 28 : 20} style={{ color }} />}
                    </div>
                    <div className="text-[11px] sm:text-xs font-semibold mb-1.5"
                      style={{ color: pi === 1 ? "#FFD700" : "var(--txt)" }}>
                      {p.name.split(" ")[0]}
                    </div>
                    <div className="flex flex-col items-center justify-end rounded-t-[10px]"
                      style={{ height, background: `${color}22`, border: `1px solid ${color}55`, padding: "8px 4px" }}>
                      <div className="text-[11px] font-mono font-semibold" style={{ color }}>${p.salary.toLocaleString()}</div>
                      <div className="text-[9px] font-mono mt-1" style={{ color: "var(--txt2)" }}>#{idx + 1}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Full List */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="text-center py-16" style={{ color: "var(--txt2)" }}>Loading…</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <Trophy size={40} color="var(--txt3)" style={{ margin: "0 auto 12px" }} />
            <div style={{ color: "var(--txt2)", fontSize: 14 }}>
              {threshold > 0
                ? `No users have earned $${threshold.toLocaleString()}+ yet.`
                : "No leaderboard data yet."}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((p, i) => {
              const avatar = p.adminAvatarUrl ?? p.avatarUrl;
              return (
                <div key={p.id}
                  className="flex items-center gap-3 rounded-2xl p-4 sm:p-5"
                  style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
                  <div className="flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{ width: 34, height: 34, background: i < 3 ? "rgba(255,215,0,.1)" : "var(--s2)", fontWeight: 700, fontSize: 13 }}>
                    {i < 3
                      ? <Trophy size={16} style={{ color: podiumColors[i] }} />
                      : <span style={{ color: "var(--txt2)" }}>{i + 1}</span>}
                  </div>
                  <div className="flex items-center justify-center rounded-xl flex-shrink-0 overflow-hidden"
                    style={{ width: 38, height: 38, background: "var(--s2)" }}>
                    {avatar
                      ? <Image src={avatar} alt={p.name} width={38} height={38} className="w-full h-full object-cover" unoptimized />
                      : <User size={18} color="var(--txt3)" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm sm:text-base font-semibold truncate">{p.name}</div>
                    <div className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--txt2)" }}>
                      {p.country} · {p.tier} · {p.jobsDone.toLocaleString()} jobs
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm sm:text-base font-mono font-semibold" style={{ color: "#00E5A0" }}>
                      ${p.salary.toLocaleString()}
                    </div>
                    <div className="text-[9px] font-mono mt-0.5" style={{ color: p.tier === "Permanent" ? "#00E5A0" : "#FFB800" }}>
                      {p.tier}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="h-8" />
      </div>
    </div>
  );
}

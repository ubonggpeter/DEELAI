"use client";
import Image from "next/image";
import { Bell, Flame, Star, Tag, Mic, Shield, DollarSign, ChevronRight, Users, Timer, LogIn, Briefcase, User as UserIcon, Landmark, KeyRound, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { JOBS } from "@/lib/data";
import { User } from "@/lib/types";
import Bar from "@/components/atoms/Bar";
import Stars from "@/components/atoms/Stars";

interface ActivityLog {
  id: string; type: string; title: string; detail: string; amount: number | null; createdAt: string;
}
const LOG_ICON: Record<string, React.ElementType> = {
  login: LogIn, job_submitted: Briefcase, job_rejected: Briefcase,
  profile_changed: UserIcon, bank_saved: Landmark,
  password_changed: KeyRound, avatar_uploaded: ImageIcon,
};
const LOG_COLOR: Record<string, string> = {
  login: "#00D4FF", job_submitted: "#00E5A0", job_rejected: "#FF4D6D",
  profile_changed: "#8B5CF6", bank_saved: "#F59E0B",
  password_changed: "#F97316", avatar_uploaded: "#EC4899",
};
function fmt(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface Props {
  user: User;
  setScreen: (s: any) => void;
  notifCount: number;
  setMenuOpen: (v: boolean) => void;
}

const jobIconMap: Record<string, React.ReactNode> = {
  annotation:    <Tag   size={24} color="#00D4FF" />,
  transcription: <Mic   size={24} color="#8B5CF6" />,
  moderation:    <Shield size={24} color="#FFB800" />,
};

export default function ActivityScreen({ user, setScreen, notifCount, setMenuOpen }: Props) {
  const [feed, setFeed] = useState<ActivityLog[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  useEffect(() => {
    fetch("/api/auth/activity?limit=6")
      .then(r => r.json())
      .then((d: { logs: ActivityLog[] }) => { setFeed(d.logs ?? []); setLoadingFeed(false); })
      .catch(() => setLoadingFeed(false));
  }, []);

  return (
    <div className="animate-fadeUp min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(175deg,#1448D0 0%,#0E38B0 40%,#0A2888 100%)",
          paddingBottom: 80,
        }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            top: -80, right: -80, width: 360, height: 360,
            background: "radial-gradient(circle,rgba(130,180,255,.18) 0%,transparent 70%)",
          }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 pt-5 sm:pt-7">
          {/* Top bar */}
          <div className="flex justify-between items-center mb-6">
            {/* Logo — hidden on md+ since sidebar shows it */}
            <div className="flex items-center gap-2.5 md:hidden">
              <div
                className="flex items-center justify-center rounded-[10px]"
                style={{ width: 34, height: 34, background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.22)" }}
              >
                <Star size={15} fill="#FFD700" stroke="#FFD700" />
              </div>
              <span className="font-black text-xl tracking-tight text-white" style={{ fontFamily: "system-ui,sans-serif" }}>
                DEEL<span style={{ color: "#7DDDFF" }}>Ai</span>
              </span>
            </div>
            {/* Page title on desktop */}
            <h1 className="hidden md:block text-2xl lg:text-3xl font-black text-white" style={{ fontFamily: "system-ui,sans-serif" }}>
              Dashboard
            </h1>

            <div className="flex items-center gap-2.5">
              <button
                className="relative flex items-center justify-center rounded-xl min-w-[44px] min-h-[44px]"
                style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)" }}
                onClick={() => setScreen("notifications")}
                aria-label="Notifications"
              >
                <Bell size={18} color="#fff" />
                {notifCount > 0 && (
                  <span
                    className="absolute flex items-center justify-center font-mono font-bold text-white rounded-full"
                    style={{ top: -4, right: -4, width: 18, height: 18, background: "#FF4D6D", fontSize: 9, border: "2px solid #0A1830" }}
                  >
                    {notifCount}
                  </span>
                )}
              </button>
              {/* Hamburger — mobile only */}
              <button
                className="md:hidden flex flex-col items-center justify-center gap-[4px] rounded-xl min-w-[44px] min-h-[44px]"
                style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)" }}
                onClick={() => setMenuOpen(true)}
                aria-label="Menu"
              >
                {[0,1,2].map(i => <div key={i} style={{ width: 16, height: 2, background: "#fff", borderRadius: 2 }} />)}
              </button>
            </div>
          </div>

          {/* User + salary row — side by side on lg+ */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:gap-12">
            {/* User */}
            <div className="flex items-center gap-3 sm:gap-4 mb-5 lg:mb-0">
              <div
                className="flex items-center justify-center shrink-0 overflow-hidden"
                style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(0,0,0,.28)", border: "2px solid rgba(255,255,255,.18)" }}
              >
                {user.avatarUrl
                  ? <Image src={user.avatarUrl} alt={user.name} width={56} height={56} className="w-full h-full object-cover" unoptimized />
                  : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: "rgba(255,255,255,.58)", marginBottom: 2 }}>Welcome back,</p>
                <p className="font-bold text-white text-xl sm:text-2xl leading-tight truncate" style={{ fontFamily: "system-ui,sans-serif" }}>
                  {user.name}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-xs font-mono" style={{ color: "rgba(255,255,255,.48)", letterSpacing: 1 }}>
                  {user.level}
                  <span className="inline-block w-[5px] h-[5px] rounded-full" style={{ background: "#00E5A0" }} />
                </div>
              </div>
              <div className="text-right shrink-0">
                <div
                  className="inline-block font-bold font-mono text-white text-[10px] tracking-[1px] mb-1.5"
                  style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.22)", borderRadius: 8, padding: "5px 13px" }}
                >
                  ACTIVE
                </div>
                <div className="flex items-center gap-1 justify-end text-xs font-mono font-semibold" style={{ color: "#FFB800" }}>
                  <Flame size={12} fill="#FFB800" stroke="#FFB800" className="animate-streak" />
                  {user.streak} day streak
                </div>
              </div>
            </div>

            {/* Salary */}
            <div className="lg:ml-auto">
              <p className="text-[11px] font-mono tracking-[2px] uppercase mb-1" style={{ color: "rgba(255,255,255,.52)" }}>
                Your Current Salary
              </p>
              <p className="font-black text-white leading-none" style={{ fontFamily: "system-ui,sans-serif", fontSize: "clamp(40px, 8vw, 72px)", letterSpacing: -2 }}>
                <span className="text-[22px] align-top inline-block mt-3">$</span>
                {Math.floor(user.salary).toLocaleString()}
              </p>
              <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,.48)" }}>Jul 2026 · Monthly salary · Keep pushing</p>
            </div>
          </div>

          {/* Daily limit bar */}
          {!user.isPermanent && (
            <div className="mt-5 rounded-xl p-3 sm:p-4" style={{ background: "rgba(0,0,0,.2)" }}>
              <div className="flex justify-between items-center mb-2">
                <span className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,.55)" }}>
                  <Timer size={12} /> Daily job limit
                </span>
                <span className="text-xs font-mono font-semibold" style={{ color: "#FFB800" }}>{user.jobsToday}/15 jobs</span>
              </div>
              <Bar pct={Math.round((user.jobsToday / 15) * 100)} color="#FFB800" h={5} />
              <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,.35)" }}>Upgrade to Permanent for unlimited jobs</p>
            </div>
          )}
        </div>
      </div>

      {/* ── FLOATING CARD ────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
        <div
          className="relative -mt-14 sm:-mt-16 rounded-2xl sm:rounded-3xl overflow-hidden"
          style={{
            background: "#111B2E",
            boxShadow: "0 -2px 0 rgba(255,255,255,.04),0 20px 60px rgba(0,0,0,.6)",
            zIndex: 2,
          }}
        >
          <div className="p-5 sm:p-6 lg:p-8">
            <h2 className="font-bold text-white mb-2 text-base sm:text-lg leading-snug" style={{ fontFamily: "system-ui,sans-serif" }}>
              At <span style={{ color: "#60CCFF" }}>DEELAI</span>, every job you complete puts real money in your wallet.
            </h2>
            <p className="text-sm sm:text-base mb-5 leading-relaxed" style={{ color: "var(--txt2)" }}>
              We have identified 3 high-impact AI jobs our top earners stack daily. The more streams you activate, the faster your income scales.
            </p>

            {/* Jobs — stacked on mobile, 3-col on lg */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-4">
              {JOBS.map((j, idx) => (
                <div
                  key={j.id}
                  className="flex items-center gap-3 sm:gap-4 lg:flex-col lg:items-start lg:rounded-xl lg:p-4"
                  style={{
                    paddingTop: 14, paddingBottom: 14,
                    borderBottom: idx < JOBS.length - 1 ? "1px solid rgba(255,255,255,.07)" : "none",
                    cursor: j.locked ? "not-allowed" : "pointer",
                    opacity: j.locked ? 0.5 : 1,
                    ...(idx < JOBS.length - 1 ? {} : { borderBottom: "none" }),
                  }}
                  onClick={() => !j.locked && setScreen("workspace")}
                >
                  <div
                    className="flex items-center justify-center shrink-0 rounded-xl"
                    style={{ width: 52, height: 52, background: j.dim, border: `1px solid ${j.color}25` }}
                  >
                    {jobIconMap[j.id]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white mb-1 text-sm sm:text-base" style={{ fontFamily: "system-ui,sans-serif" }}>{j.title}</p>
                    <p className="text-xs sm:text-sm leading-snug mb-1.5" style={{ color: "var(--txt2)" }}>{j.sub}</p>
                    <div className="flex items-center gap-1.5">
                      <Stars n={j.stars} />
                      <span className="text-xs font-semibold" style={{ color: j.tagC }}>{j.tag}</span>
                    </div>
                  </div>
                  <div
                    className="shrink-0 text-center rounded-xl"
                    style={{ background: j.color, padding: "10px 14px", boxShadow: `0 4px 18px ${j.color}44`, minWidth: 72 }}
                  >
                    <p className="font-black text-white text-base leading-none" style={{ fontFamily: "system-ui,sans-serif" }}>{j.rate}</p>
                    <p className="text-[9px] font-mono mt-0.5" style={{ color: "rgba(255,255,255,.65)" }}>{j.rateUnit}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setScreen("workspace")}
              className="w-full flex items-center justify-center gap-3 font-bold text-white mt-5 rounded-xl min-h-[52px]"
              style={{
                background: "linear-gradient(135deg,#00D68A,#00B872)",
                border: "none", cursor: "pointer",
                fontSize: "clamp(15px,2vw,17px)",
                boxShadow: "0 6px 24px rgba(0,214,138,.35)",
                fontFamily: "system-ui,sans-serif",
              }}
            >
              <DollarSign size={20} />
              Start Earning Now
              <span className="ml-auto flex items-center justify-center w-8 h-8 rounded-full" style={{ background: "rgba(255,255,255,.2)" }}>
                <ChevronRight size={16} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── STREAK BANNER ────────────────────────────────────────────── */}
      {user.streak >= 3 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 mt-4">
          <div
            className="flex items-center gap-3 rounded-xl p-4"
            style={{ background: "linear-gradient(135deg,rgba(255,184,0,.1),rgba(255,77,109,.1))", border: "1px solid rgba(255,184,0,.25)" }}
          >
            <Flame size={24} fill="#FFB800" stroke="#FFB800" className="animate-streak shrink-0" />
            <div>
              <p className="text-sm font-bold" style={{ color: "#FFB800" }}>{user.streak}-Day Streak! +10% Bonus Active</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--txt2)" }}>Keep working daily to maintain your streak bonus</p>
            </div>
          </div>
        </div>
      )}

      {/* ── RECENT ACTIVITY ──────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white text-base sm:text-lg" style={{ fontFamily: "system-ui,sans-serif" }}>
            Recent Activity
          </h2>
          <button onClick={() => setScreen("history")}
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: "#00D4FF", background: "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.2)", borderRadius: 8, padding: "5px 10px" }}>
            View All <ChevronRight size={12} />
          </button>
        </div>

        {loadingFeed ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={22} className="animate-spin" style={{ color: "var(--txt3)" }} />
          </div>
        ) : feed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <AlertCircle size={28} style={{ color: "var(--txt3)" }} />
            <p className="text-sm" style={{ color: "var(--txt3)" }}>No activity yet — complete your first job to see logs here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {feed.map((log) => {
              const Icon = LOG_ICON[log.type] ?? Briefcase;
              const color = LOG_COLOR[log.type] ?? "#7D8BAA";
              return (
                <div key={log.id} className="flex items-center gap-3 rounded-xl p-3 sm:p-4"
                  style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
                  <div className="flex items-center justify-center shrink-0 rounded-xl"
                    style={{ width: 42, height: 42, background: `${color}14`, border: `1px solid ${color}30` }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{log.title}</p>
                    {log.detail && <p className="text-xs mt-0.5 truncate" style={{ color: "var(--txt2)" }}>{log.detail}</p>}
                    <p className="text-xs mt-0.5" style={{ color: "var(--txt3)" }}>{fmt(log.createdAt)}</p>
                  </div>
                  {log.amount != null && (
                    <span className="font-mono font-bold text-sm shrink-0" style={{ color: "#00E5A0" }}>+${log.amount.toFixed(2)}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div className="h-6" />
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { Copy, Check, User } from "lucide-react";
import { User as UserType } from "@/lib/types";

interface Props {
  user: UserType;
}

const recruits = [
  { name: "Fatima Bello", level: "Associate", status: "Working", earned: "$12.40", joined: "2 days ago", online: true },
  { name: "Chukwudi Eze", level: "Permanent", status: "Working", earned: "$89.00", joined: "3 weeks ago", online: true },
  { name: "Amina Yusuf", level: "Associate", status: "In Training", earned: "$0.00", joined: "5 days ago", online: false },
  { name: "Tunde Adeyemi", level: "Associate", status: "Working", earned: "$27.80", joined: "1 week ago", online: true },
  { name: "Ngozi Okafor", level: "Associate", status: "Inactive", earned: "$3.20", joined: "2 weeks ago", online: false },
];

const steps = [
  { n: "1", t: "Share your recruit link", d: "Send it to anyone who is ready to earn with AI" },
  { n: "2", t: "They join and complete training", d: "Your recruit onboards and completes the certification" },
  { n: "3", t: "They activate their Lens", d: "Once certified and live on the platform" },
  { n: "4", t: "You earn $40/month", d: "Per active recruit — passive income, every month" },
];

function statusStyle(status: string) {
  if (status === "Working") return { background: "rgba(0,229,160,.1)", color: "#00E5A0" };
  if (status === "In Training") return { background: "rgba(0,212,255,.1)", color: "var(--cyan)" };
  return { background: "rgba(74,84,112,.2)", color: "var(--txt3)" };
}

export default function RecruitScreen({ user }: Props) {
  const [copied, setCopied] = useState(false);
  const link = `deelai.uk/recruit/${user.refCode}`;
  const working = recruits.filter(r => r.status === "Working").length;

  function copyLink() {
    navigator.clipboard?.writeText(`https://${link}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="animate-fadeUp">
      {/* ── Header band ── */}
      <div
        className="rounded-b-3xl mb-6"
        style={{ background: "linear-gradient(150deg,#0A1230,#0E1845,#08142A)" }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="font-black text-2xl sm:text-3xl mb-1" style={{ fontFamily: "system-ui,sans-serif" }}>
            Recruit Network
          </h1>
          <p className="text-sm sm:text-base mb-5" style={{ color: "var(--txt2)" }}>
            Bring talent to DEELAi. Earn $40/month per active recruit.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {([
              [recruits.length, "RECRUITED", "#00D4FF"],
              [working, "WORKING", "#00E5A0"],
              ["$120", "RECRUIT PAY", "#FFB800"],
            ] as [number | string, string, string][]).map(([v, l, c]) => (
              <div key={l} className="rounded-xl p-3 sm:p-4" style={{ background: `${c}0D`, border: `1px solid ${c}22` }}>
                <div className="font-mono text-[9px] sm:text-[10px] tracking-widest mb-1" style={{ color: "var(--txt2)" }}>{l}</div>
                <div className="font-black text-2xl sm:text-3xl" style={{ fontFamily: "system-ui,sans-serif", color: c }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Recruit link */}
          <div className="rounded-xl p-3 sm:p-4" style={{ background: "rgba(0,212,255,.06)", border: "1px solid rgba(0,212,255,.2)" }}>
            <div className="font-mono text-[9px] tracking-widest mb-2" style={{ color: "var(--txt2)" }}>YOUR RECRUIT LINK</div>
            <div className="flex gap-2 items-center">
              <div className="flex-1 font-mono text-xs sm:text-sm truncate" style={{ color: "var(--cyan)" }}>{link}</div>
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 font-semibold font-mono text-xs transition-all min-h-[36px] px-3 sm:px-4 rounded-lg shrink-0 cursor-pointer"
                style={{
                  border: "1px solid rgba(0,212,255,.35)",
                  background: copied ? "rgba(0,229,160,.12)" : "rgba(0,212,255,.1)",
                  color: copied ? "#00E5A0" : "var(--cyan)",
                  whiteSpace: "nowrap",
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Desktop: two-column; Mobile: stacked */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-10">

          {/* How it works */}
          <div className="mb-8 lg:mb-0">
            <h2 className="font-bold text-base sm:text-lg mb-4" style={{ fontFamily: "system-ui,sans-serif" }}>
              How It Works
            </h2>
            <div className="space-y-4">
              {steps.map(s => (
                <div key={s.n} className="flex gap-3 items-start">
                  <div
                    className="flex items-center justify-center shrink-0 font-bold font-mono text-sm"
                    style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: "var(--cyan-d)", border: "1px solid rgba(0,212,255,.3)",
                      color: "var(--cyan)",
                    }}
                  >
                    {s.n}
                  </div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base text-white">{s.t}</div>
                    <div className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--txt2)" }}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recruits list */}
          <div>
            <h2 className="font-bold text-base sm:text-lg mb-4" style={{ fontFamily: "system-ui,sans-serif" }}>
              Your Recruits
            </h2>
            <div className="space-y-2.5">
              {recruits.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl p-3 sm:p-4 transition-colors"
                  style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}
                >
                  <div className="relative shrink-0">
                    <div
                      className="flex items-center justify-center rounded-xl"
                      style={{ width: 40, height: 40, background: "var(--s2)" }}
                    >
                      <User size={18} color="var(--txt2)" />
                    </div>
                    {r.online && (
                      <div
                        className="absolute"
                        style={{ bottom: 0, right: 0, width: 9, height: 9, borderRadius: "50%", background: "#00E5A0", border: "1.5px solid var(--s1)" }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-white">{r.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--txt2)" }}>
                      <span style={{ color: r.level === "Permanent" ? "#00E5A0" : "#FFB800" }}>{r.level}</span>
                      {" · "}{r.joined}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-semibold text-xs sm:text-sm" style={{ color: "#00E5A0" }}>{r.earned}</div>
                    <div
                      className="text-center mt-1 rounded-full text-[10px] px-2 py-0.5"
                      style={statusStyle(r.status)}
                    >
                      {r.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

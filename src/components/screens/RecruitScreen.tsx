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

export default function RecruitScreen({ user }: Props) {
  const [copied, setCopied] = useState(false);
  const link = `deelai.uk/recruit/${user.refCode}`;
  const working = recruits.filter(r => r.status === "Working").length;

  function copyLink() {
    navigator.clipboard?.writeText(`https://${link}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function statusStyle(status: string) {
    if (status === "Working") return { background: "rgba(0,229,160,.1)", color: "#00E5A0" };
    if (status === "In Training") return { background: "rgba(0,212,255,.1)", color: "var(--cyan)" };
    return { background: "rgba(74,84,112,.2)", color: "var(--txt3)" };
  }

  return (
    <div className="animate-fadeUp">
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(150deg,#0A1230,#0E1845,#08142A)",
          padding: "26px 18px 24px",
          borderRadius: "0 0 24px 24px",
          marginBottom: 20,
        }}
      >
        <div
          className="font-black mb-1"
          style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 22 }}
        >
          Recruit Network
        </div>
        <div style={{ fontSize: 13, color: "var(--txt2)", marginBottom: 18 }}>
          Bring talent to DEELAi. Earn $40/month per active recruit.
        </div>

        {/* Stats */}
        <div className="flex gap-2 mb-[18px]">
          {([
            [recruits.length, "RECRUITED", "#00D4FF"],
            [working, "WORKING", "#00E5A0"],
            ["$120", "RECRUIT PAY", "#FFB800"],
          ] as [number | string, string, string][]).map(([v, l, c]) => (
            <div
              key={l}
              className="flex-1 rounded-xl p-3"
              style={{ background: `${c}0D`, border: `1px solid ${c}22` }}
            >
              <div className="font-mono" style={{ fontSize: 9, color: "var(--txt2)", letterSpacing: 1 }}>{l}</div>
              <div
                className="font-black mt-1"
                style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 24, color: c }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>

        {/* Recruit link */}
        <div
          style={{
            background: "rgba(0,212,255,.06)", border: "1px solid rgba(0,212,255,.2)",
            borderRadius: 12, padding: "12px 14px",
          }}
        >
          <div className="font-mono" style={{ fontSize: 9, color: "var(--txt2)", letterSpacing: 1, marginBottom: 6 }}>
            YOUR RECRUIT LINK
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex-1 font-mono truncate" style={{ fontSize: 12, color: "var(--cyan)" }}>{link}</div>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 font-semibold font-mono transition-all"
              style={{
                padding: "7px 14px", borderRadius: 8,
                border: "1px solid rgba(0,212,255,.35)",
                background: copied ? "rgba(0,229,160,.12)" : "rgba(0,212,255,.1)",
                color: copied ? "#00E5A0" : "var(--cyan)",
                fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 18px" }}>
        {/* How it works */}
        <div
          className="font-bold mb-3"
          style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 15 }}
        >
          How It Works
        </div>
        {steps.map(s => (
          <div key={s.n} className="flex gap-3 mb-3.5 items-start">
            <div
              className="flex items-center justify-center flex-shrink-0 font-bold font-mono"
              style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "var(--cyan-d)", border: "1px solid rgba(0,212,255,.3)",
                color: "var(--cyan)", fontSize: 13,
              }}
            >
              {s.n}
            </div>
            <div>
              <div className="font-semibold" style={{ fontSize: 14 }}>{s.t}</div>
              <div style={{ fontSize: 12, color: "var(--txt2)", marginTop: 2 }}>{s.d}</div>
            </div>
          </div>
        ))}

        {/* Recruits list */}
        <div
          className="font-bold mt-2 mb-3"
          style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 15 }}
        >
          Your Recruits
        </div>
        {recruits.map((r, i) => (
          <div
            key={i}
            className="flex items-center gap-3"
            style={{
              background: "var(--s1)", border: "1px solid var(--b1)",
              borderRadius: 12, padding: "12px 14px", marginBottom: 8,
            }}
          >
            <div className="relative flex-shrink-0">
              <div
                className="flex items-center justify-center"
                style={{ width: 38, height: 38, borderRadius: 10, background: "var(--s2)" }}
              >
                <User size={17} color="var(--txt2)" />
              </div>
              {r.online && (
                <div
                  className="absolute"
                  style={{
                    bottom: 0, right: 0, width: 9, height: 9,
                    borderRadius: "50%", background: "#00E5A0",
                    border: "1.5px solid var(--s1)",
                  }}
                />
              )}
            </div>
            <div className="flex-1">
              <div className="font-semibold" style={{ fontSize: 13 }}>{r.name}</div>
              <div style={{ fontSize: 11, color: "var(--txt2)", marginTop: 2 }}>
                <span style={{ color: r.level === "Permanent" ? "#00E5A0" : "#FFB800" }}>{r.level}</span>
                {" · "}{r.joined}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono font-semibold" style={{ fontSize: 12, color: "#00E5A0" }}>{r.earned}</div>
              <div
                className="text-center mt-0.5 rounded-full"
                style={{ fontSize: 10, padding: "2px 8px", ...statusStyle(r.status) }}
              >
                {r.status}
              </div>
            </div>
          </div>
        ))}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

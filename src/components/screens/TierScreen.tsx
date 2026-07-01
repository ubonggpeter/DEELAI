"use client";
import { ArrowLeft, Rocket, X, Check } from "lucide-react";
import Bar from "@/components/atoms/Bar";
import { User } from "@/lib/types";

interface Props {
  user: User;
  onBack: () => void;
}

export default function TierScreen({ user, onBack }: Props) {
  const jobsNeeded = Math.max(0, 1000 - user.jobsDone);
  const accNeeded = Math.max(0, 98 - user.accuracy).toFixed(1);
  const pct = Math.min(100, Math.round((user.jobsDone / 1000) * 100));

  return (
    <div className="animate-fadeUp" style={{ background: "var(--bg)", minHeight: "100%" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(145deg,#1A0A30,#2A1050)",
          padding: "24px 18px 24px",
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
          <div style={{ fontWeight: 800, fontSize: 20 }}>Tier Upgrade</div>
        </div>
        <div className="text-center">
          <Rocket size={48} style={{ color: "#8B5CF6", margin: "0 auto 8px" }} />
          <div style={{ fontWeight: 700, fontSize: 18, color: "#8B5CF6", marginBottom: 4 }}>
            Upgrade to Permanent Staff
          </div>
          <div style={{ fontSize: 13, color: "var(--txt2)", lineHeight: 1.6 }}>
            Permanent Staff earn more, work unlimited hours,
            <br />
            and unlock all 3 AI job streams.
          </div>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* Comparison */}
        <div className="flex gap-2 mb-5">
          {/* Associate */}
          <div
            className="flex-1 rounded-2xl p-4"
            style={{
              background: "rgba(255,184,0,.07)",
              border: "1px solid rgba(255,184,0,.25)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#FFB800",
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: 1,
                marginBottom: 10,
              }}
            >
              ASSOCIATE
            </div>
            {["3 hr/day limit", "$850/mo cap", "1 job stream", "Basic support"].map((f) => (
              <div key={f} className="flex items-center gap-2 mb-2">
                <X size={12} style={{ color: "#FF4D6D", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "var(--txt2)" }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Permanent */}
          <div
            className="flex-1 rounded-2xl p-4"
            style={{
              background: "rgba(139,92,246,.07)",
              border: "1px solid rgba(139,92,246,.35)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#8B5CF6",
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: 1,
                marginBottom: 10,
              }}
            >
              PERMANENT ⭐
            </div>
            {["Unlimited hours", "$3,000+/mo", "All 3 streams", "Priority support"].map((f) => (
              <div key={f} className="flex items-center gap-2 mb-2">
                <Check size={12} style={{ color: "#00E5A0", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "var(--txt)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Your Progress</div>

        {/* Jobs bar */}
        <div
          className="rounded-2xl p-4 mb-3"
          style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}
        >
          <div className="flex justify-between mb-2">
            <span style={{ fontSize: 13, fontWeight: 500 }}>Jobs Completed</span>
            <span
              style={{
                fontSize: 13,
                fontFamily: "monospace",
                color: user.jobsDone >= 1000 ? "#00E5A0" : "var(--cyan)",
              }}
            >
              {user.jobsDone.toLocaleString()} / 1,000
            </span>
          </div>
          <Bar pct={pct} color={user.jobsDone >= 1000 ? "#00E5A0" : "var(--cyan)"} />
          <div style={{ fontSize: 11, color: "var(--txt2)", marginTop: 6 }}>
            {jobsNeeded > 0 ? `${jobsNeeded} more jobs needed` : "✓ Requirement met"}
          </div>
        </div>

        {/* Accuracy bar */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}
        >
          <div className="flex justify-between mb-2">
            <span style={{ fontSize: 13, fontWeight: 500 }}>Accuracy Score</span>
            <span
              style={{
                fontSize: 13,
                fontFamily: "monospace",
                color: user.accuracy >= 98 ? "#00E5A0" : "var(--cyan)",
              }}
            >
              {user.accuracy}% / 98%
            </span>
          </div>
          <Bar pct={Math.min(100, (user.accuracy / 98) * 100)} color={user.accuracy >= 98 ? "#00E5A0" : "#8B5CF6"} />
          <div style={{ fontSize: 11, color: "var(--txt2)", marginTop: 6 }}>
            {parseFloat(accNeeded) > 0 ? `${accNeeded}% accuracy improvement needed` : "✓ Requirement met"}
          </div>
        </div>

        {/* Info banner */}
        <div
          className="rounded-2xl p-4 mb-6 text-center"
          style={{
            background: "rgba(139,92,246,.08)",
            border: "1px solid rgba(139,92,246,.25)",
          }}
        >
          <div style={{ fontSize: 13, color: "var(--txt2)", lineHeight: 1.6 }}>
            Keep completing annotation jobs accurately. Once both requirements are met, your tier upgrades{" "}
            <strong style={{ color: "#8B5CF6" }}>automatically</strong>.
          </div>
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

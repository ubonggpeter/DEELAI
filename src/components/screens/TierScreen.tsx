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
  const accNeeded  = Math.max(0, 98 - user.accuracy).toFixed(1);
  const pct        = Math.min(100, Math.round((user.jobsDone / 1000) * 100));

  return (
    <div className="animate-fadeUp w-full" style={{ background: "var(--bg)", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(145deg,#1A0A30,#2A1050)" }} className="rounded-b-3xl mb-5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={onBack}
              className="flex items-center justify-center w-9 h-9 rounded-xl min-h-[44px] min-w-[44px]"
              style={{ background: "var(--b1)", color: "var(--txt2)", border: "none", cursor: "pointer" }}>
              <ArrowLeft size={18} />
            </button>
            <div className="text-xl sm:text-2xl font-black text-white">Tier Upgrade</div>
          </div>
          <div className="text-center">
            <Rocket size={52} className="mx-auto mb-3" style={{ color: "#8B5CF6" }} />
            <div className="text-lg sm:text-xl font-bold mb-2" style={{ color: "#8B5CF6" }}>
              Upgrade to Permanent Staff
            </div>
            <div className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--txt2)" }}>
              Permanent Staff earn more, work unlimited hours, and unlock all 3 AI job streams.
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Comparison Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl p-4 sm:p-5"
            style={{ background: "rgba(255,184,0,.07)", border: "1px solid rgba(255,184,0,.25)" }}>
            <div className="text-[10px] font-mono font-bold tracking-widest mb-4" style={{ color: "#FFB800" }}>
              ASSOCIATE
            </div>
            {["3 hr/day limit", "$850/mo cap", "1 job stream", "Basic support"].map((f) => (
              <div key={f} className="flex items-center gap-2 mb-2.5">
                <X size={13} style={{ color: "#FF4D6D", flexShrink: 0 }} />
                <span className="text-sm" style={{ color: "var(--txt2)" }}>{f}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-4 sm:p-5"
            style={{ background: "rgba(139,92,246,.07)", border: "1px solid rgba(139,92,246,.35)" }}>
            <div className="text-[10px] font-mono font-bold tracking-widest mb-4" style={{ color: "#8B5CF6" }}>
              PERMANENT ★
            </div>
            {["Unlimited hours", "$3,000+/mo", "All 3 streams", "Priority support"].map((f) => (
              <div key={f} className="flex items-center gap-2 mb-2.5">
                <Check size={13} style={{ color: "#00E5A0", flexShrink: 0 }} />
                <span className="text-sm text-white">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="text-sm sm:text-base font-bold mb-4 text-white">Your Progress</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {/* Jobs Bar */}
          <div className="rounded-2xl p-4 sm:p-5" style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">Jobs Completed</span>
              <span className="text-sm font-mono" style={{ color: user.jobsDone >= 1000 ? "#00E5A0" : "var(--cyan)" }}>
                {user.jobsDone.toLocaleString()} / 1,000
              </span>
            </div>
            <Bar pct={pct} color={user.jobsDone >= 1000 ? "#00E5A0" : "var(--cyan)"} />
            <div className="text-xs mt-2" style={{ color: "var(--txt2)" }}>
              {jobsNeeded > 0 ? `${jobsNeeded} more jobs needed` : "Requirement met"}
            </div>
          </div>

          {/* Accuracy Bar */}
          <div className="rounded-2xl p-4 sm:p-5" style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">Accuracy Score</span>
              <span className="text-sm font-mono" style={{ color: user.accuracy >= 98 ? "#00E5A0" : "var(--cyan)" }}>
                {user.accuracy}% / 98%
              </span>
            </div>
            <Bar pct={Math.min(100, (user.accuracy / 98) * 100)} color={user.accuracy >= 98 ? "#00E5A0" : "#8B5CF6"} />
            <div className="text-xs mt-2" style={{ color: "var(--txt2)" }}>
              {parseFloat(accNeeded) > 0 ? `${accNeeded}% improvement needed` : "Requirement met"}
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="rounded-2xl p-4 sm:p-5 text-center"
          style={{ background: "rgba(139,92,246,.08)", border: "1px solid rgba(139,92,246,.25)" }}>
          <div className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--txt2)" }}>
            Keep completing annotation jobs accurately. Once both requirements are met, your tier upgrades{" "}
            <strong style={{ color: "#8B5CF6" }}>automatically</strong>.
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}

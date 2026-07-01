"use client";
import { ArrowLeft, Calendar, CheckCircle, Clock, Lightbulb } from "lucide-react";

interface Props {
  onBack: () => void;
}

const schedule = [
  { date: "Friday, May 23, 2026", status: "Upcoming", amt: "$14,750", color: "#FFB800" },
  { date: "Friday, May 16, 2026", status: "Paid",     amt: "$13,200", color: "#00E5A0" },
  { date: "Friday, May 9, 2026",  status: "Paid",     amt: "$12,800", color: "#00E5A0" },
  { date: "Friday, May 2, 2026",  status: "Paid",     amt: "$11,500", color: "#00E5A0" },
  { date: "Friday, Apr 25, 2026", status: "Paid",     amt: "$10,900", color: "#00E5A0" },
];

export default function PayoutScreen({ onBack }: Props) {
  return (
    <div className="animate-fadeUp w-full" style={{ background: "var(--bg)", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(145deg,#081428,#0C1E40)" }} className="rounded-b-3xl mb-5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={onBack}
              className="flex items-center justify-center w-9 h-9 rounded-xl min-h-[44px] min-w-[44px]"
              style={{ background: "var(--b1)", color: "var(--txt2)", border: "none", cursor: "pointer" }}>
              <ArrowLeft size={18} />
            </button>
            <div className="text-xl sm:text-2xl font-black text-white">Payout Schedule</div>
          </div>

          {/* Info Box */}
          <div className="text-center rounded-2xl p-4 sm:p-6"
            style={{ background: "rgba(0,229,160,.08)", border: "1px solid rgba(0,229,160,.25)" }}>
            <Calendar size={36} className="mx-auto mb-2" style={{ color: "#00E5A0" }} />
            <div className="text-base sm:text-lg font-bold mb-1.5" style={{ color: "#00E5A0" }}>Every Friday</div>
            <div className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--txt2)" }}>
              Salaries are processed every Friday by 5PM GMT. Funds arrive within 24 hours.
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="text-sm sm:text-base font-bold mb-4 text-white">Payout History</div>

        <div className="flex flex-col gap-2 mb-4">
          {schedule.map((s, i) => (
            <div key={i}
              className="flex items-center gap-3 rounded-2xl p-3 sm:p-4"
              style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
              <div className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{ width: 44, height: 44,
                  background: s.status === "Upcoming" ? "rgba(255,184,0,.1)" : "rgba(0,229,160,.1)",
                  color: s.color }}>
                {s.status === "Upcoming" ? <Clock size={20} /> : <CheckCircle size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm sm:text-base font-semibold truncate">{s.date}</div>
                <div className="text-xs font-semibold mt-0.5" style={{ color: s.color }}>{s.status}</div>
              </div>
              <div className="font-mono font-bold text-sm sm:text-base flex-shrink-0" style={{ color: s.color }}>
                {s.amt}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-4 sm:p-5 flex gap-3 items-start"
          style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
          <Lightbulb size={18} style={{ color: "#FFB800", flexShrink: 0, marginTop: 1 }} />
          <div className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--txt2)" }}>
            <strong className="text-white">Tip:</strong> Complete more annotation jobs before Thursday midnight to maximise your Friday payout.
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}

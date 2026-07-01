"use client";
import { ArrowLeft, Calendar, CheckCircle, Clock } from "lucide-react";

interface Props {
  onBack: () => void;
}

const schedule = [
  { date: "Friday, May 23, 2026", status: "Upcoming", amt: "$14,750", color: "#FFB800" },
  { date: "Friday, May 16, 2026", status: "Paid", amt: "$13,200", color: "#00E5A0" },
  { date: "Friday, May 9, 2026", status: "Paid", amt: "$12,800", color: "#00E5A0" },
  { date: "Friday, May 2, 2026", status: "Paid", amt: "$11,500", color: "#00E5A0" },
  { date: "Friday, Apr 25, 2026", status: "Paid", amt: "$10,900", color: "#00E5A0" },
];

export default function PayoutScreen({ onBack }: Props) {
  return (
    <div className="animate-fadeUp" style={{ background: "var(--bg)", minHeight: "100%" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(145deg,#081428,#0C1E40)",
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
          <div style={{ fontWeight: 800, fontSize: 20 }}>Payout Schedule</div>
        </div>

        {/* Info Box */}
        <div
          className="text-center rounded-2xl p-4"
          style={{
            background: "rgba(0,229,160,.08)",
            border: "1px solid rgba(0,229,160,.25)",
          }}
        >
          <Calendar size={32} style={{ color: "#00E5A0", margin: "0 auto 8px" }} />
          <div style={{ fontWeight: 700, fontSize: 17, color: "#00E5A0" }}>Every Friday</div>
          <div style={{ fontSize: 13, color: "var(--txt2)", marginTop: 4 }}>
            Salaries are processed every Friday by 5PM GMT. Funds arrive within 24 hours.
          </div>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Payout History</div>

        {schedule.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl mb-2"
            style={{
              padding: 14,
              background: "var(--s1)",
              border: "1px solid var(--b1)",
            }}
          >
            <div
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{
                width: 42,
                height: 42,
                background: s.status === "Upcoming" ? "rgba(255,184,0,.1)" : "rgba(0,229,160,.1)",
                color: s.color,
              }}
            >
              {s.status === "Upcoming" ? <Clock size={18} /> : <CheckCircle size={18} />}
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 13, fontWeight: 600 }}>{s.date}</div>
              <div style={{ fontSize: 11, color: s.color, marginTop: 2, fontWeight: 600 }}>{s.status}</div>
            </div>
            <div style={{ fontFamily: "monospace", fontWeight: 700, color: s.color, fontSize: 14 }}>{s.amt}</div>
          </div>
        ))}

        <div
          className="rounded-2xl p-4 mt-2 mb-6"
          style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}
        >
          <div style={{ fontSize: 12, color: "var(--txt2)", lineHeight: 1.7 }}>
            💡 <strong style={{ color: "#fff" }}>Tip:</strong> Complete more annotation jobs before Thursday midnight
            to maximise your Friday payout.
          </div>
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

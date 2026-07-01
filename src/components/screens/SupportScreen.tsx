"use client";
import { useState } from "react";
import { ArrowLeft, MessageCircle, Mail, Phone, ChevronDown } from "lucide-react";

interface Props {
  onBack: () => void;
}

const faqs = [
  { q: "When is my salary paid?", a: "Salaries are processed every Friday by 5PM GMT. Funds typically arrive within 24 hours, depending on your bank." },
  { q: "What is the Annotation Lens?", a: "The Virtual Annotation Lens is a one-time $3.80 tool that activates your annotation workspace and calibrates your precision settings for AI-grade accuracy." },
  { q: "How do I upgrade to Permanent Staff?", a: "Complete 1,000 annotation jobs with a minimum 98% accuracy score. Upgrades are processed automatically once both thresholds are met." },
  { q: "How do I withdraw my salary?", a: "Go to Wallet → Withdraw. Choose your preferred method (Bank Transfer, USDT, or PayPal). The minimum withdrawal amount is $10." },
  { q: "Why was my job rejected?", a: "Jobs are rejected for inaccurate bounding boxes, wrong labels, or missing objects. Review the feedback provided, correct your work, and resubmit." },
];

const contactCards = [
  { Icon: MessageCircle, label: "Live Chat", sub: "Online", color: "#00E5A0" },
  { Icon: Mail, label: "Email", sub: "24hr reply", color: "#00D4FF" },
  { Icon: Phone, label: "Call", sub: "9AM–6PM GMT", color: "#8B5CF6" },
];

export default function SupportScreen({ onBack }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="animate-fadeUp" style={{ background: "var(--bg)", minHeight: "100%" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(145deg,#081428,#0C1E40)",
          padding: "24px 18px 20px",
          borderRadius: "0 0 24px 24px",
          marginBottom: 20,
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: "var(--b1)", color: "var(--txt2)", border: "none", cursor: "pointer" }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ fontWeight: 800, fontSize: 20 }}>Help & Support</div>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* Contact Cards */}
        <div className="flex gap-2 mb-5">
          {contactCards.map(({ Icon, label, sub, color }) => (
            <div
              key={label}
              className="flex-1 flex flex-col items-center text-center rounded-2xl cursor-pointer"
              style={{ padding: "14px 10px", background: "var(--s1)", border: "1px solid var(--b2)" }}
            >
              <Icon size={22} style={{ color, marginBottom: 6 }} />
              <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: 10, color: "#00E5A0", marginTop: 2, fontFamily: "monospace" }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Frequently Asked Questions</div>
        {faqs.map((f, i) => (
          <div
            key={i}
            className="rounded-2xl mb-2 overflow-hidden"
            style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}
          >
            <div
              onClick={() => setOpen(open === i ? null : i)}
              className="flex items-center justify-between cursor-pointer"
              style={{ padding: "14px 16px" }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, flex: 1, paddingRight: 10 }}>{f.q}</div>
              <ChevronDown
                size={18}
                style={{
                  color: "var(--cyan)",
                  transition: "transform .2s",
                  transform: open === i ? "rotate(180deg)" : "none",
                  flexShrink: 0,
                }}
              />
            </div>
            {open === i && (
              <div
                style={{
                  padding: "0 16px 14px",
                  fontSize: 13,
                  color: "var(--txt2)",
                  lineHeight: 1.7,
                  borderTop: "1px solid var(--b1)",
                }}
              >
                {f.a}
              </div>
            )}
          </div>
        ))}

        {/* Contact Email */}
        <div
          className="rounded-2xl p-4 text-center mt-4 mb-6"
          style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}
        >
          <div style={{ fontSize: 13, color: "var(--txt2)" }}>Still need help? Email us at</div>
          <div style={{ fontSize: 14, color: "var(--cyan)", fontFamily: "monospace", marginTop: 4 }}>
            support@deelai.uk
          </div>
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

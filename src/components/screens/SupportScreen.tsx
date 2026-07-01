"use client";
import { useState } from "react";
import { ArrowLeft, MessageCircle, Mail, Phone, ChevronDown } from "lucide-react";

interface Props {
  onBack: () => void;
}

const faqs = [
  { q: "When is my salary paid?",            a: "Salaries are processed every Friday by 5PM GMT. Funds typically arrive within 24 hours, depending on your bank." },
  { q: "What is the Annotation Lens?",       a: "The Virtual Annotation Lens is a one-time $3.80 tool that activates your annotation workspace and calibrates your precision settings for AI-grade accuracy." },
  { q: "How do I upgrade to Permanent Staff?", a: "Complete 1,000 annotation jobs with a minimum 98% accuracy score. Upgrades are processed automatically once both thresholds are met." },
  { q: "How do I withdraw my salary?",       a: "Go to Wallet → Withdraw. Choose your preferred method (Bank Transfer, USDT, or PayPal). The minimum withdrawal amount is $10." },
  { q: "Why was my job rejected?",           a: "Jobs are rejected for inaccurate bounding boxes, wrong labels, or missing objects. Review the feedback provided, correct your work, and resubmit." },
];

const contactCards = [
  { Icon: MessageCircle, label: "Live Chat", sub: "Online",       color: "#00E5A0" },
  { Icon: Mail,          label: "Email",     sub: "24hr reply",   color: "#00D4FF" },
  { Icon: Phone,         label: "Call",      sub: "9AM–6PM GMT",  color: "#8B5CF6" },
];

export default function SupportScreen({ onBack }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="animate-fadeUp w-full" style={{ background: "var(--bg)", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(145deg,#081428,#0C1E40)" }} className="rounded-b-3xl mb-5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <button onClick={onBack}
              className="flex items-center justify-center w-9 h-9 rounded-xl min-h-[44px] min-w-[44px]"
              style={{ background: "var(--b1)", color: "var(--txt2)", border: "none", cursor: "pointer" }}>
              <ArrowLeft size={18} />
            </button>
            <div className="text-xl sm:text-2xl font-black text-white">Help & Support</div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Contact Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          {contactCards.map(({ Icon, label, sub, color }) => (
            <div key={label}
              className="flex flex-col items-center text-center rounded-2xl cursor-pointer p-3 sm:p-5"
              style={{ background: "var(--s1)", border: "1px solid var(--b2)" }}>
              <Icon size={24} style={{ color, marginBottom: 8 }} />
              <div className="text-sm sm:text-base font-semibold">{label}</div>
              <div className="text-[10px] sm:text-xs font-mono mt-1" style={{ color: "#00E5A0" }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="text-sm sm:text-base font-bold mb-3 text-white">Frequently Asked Questions</div>
        <div className="flex flex-col gap-2 mb-5">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-2xl overflow-hidden"
              style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
              <div onClick={() => setOpen(open === i ? null : i)}
                className="flex items-center justify-between cursor-pointer p-4 sm:p-5 min-h-[52px]">
                <div className="text-sm sm:text-base font-semibold flex-1 pr-3">{f.q}</div>
                <ChevronDown size={18} style={{
                  color: "var(--cyan)", flexShrink: 0,
                  transition: "transform .2s",
                  transform: open === i ? "rotate(180deg)" : "none",
                }} />
              </div>
              {open === i && (
                <div className="text-xs sm:text-sm leading-relaxed px-4 sm:px-5 pb-4 sm:pb-5"
                  style={{ color: "var(--txt2)", borderTop: "1px solid var(--b1)", paddingTop: 12 }}>
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Email */}
        <div className="rounded-2xl p-4 sm:p-5 text-center"
          style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
          <div className="text-xs sm:text-sm mb-1" style={{ color: "var(--txt2)" }}>Still need help? Email us at</div>
          <div className="text-sm sm:text-base font-mono" style={{ color: "var(--cyan)" }}>support@deelai.uk</div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}

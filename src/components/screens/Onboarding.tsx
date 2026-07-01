"use client";
import { useState } from "react";
import { Globe, Tag, Banknote, Microscope, LucideIcon } from "lucide-react";
import { SmallGlobe } from "@/components/atoms/Globe";

interface Slide {
  title: string;
  body: string;
  color: string;
  Icon: LucideIcon;
}

const slides: Slide[] = [
  {
    title: "Welcome to DEELAI",
    body: "The world's premier AI-powered remote job platform connecting global talent to the world's leading AI companies. Work from anywhere. Earn in dollars.",
    color: "#00D4FF",
    Icon: Globe,
  },
  {
    title: "3 High-Paying AI Jobs",
    body: "Image Annotation, Voice Transcription and Content Intelligence. One platform. Multiple income streams. All from your phone.",
    color: "#8B5CF6",
    Icon: Tag,
  },
  {
    title: "Real Dollar Salary",
    body: "Top workers worldwide earn $14,000+ monthly. Salaries paid every Friday, directly to your bank. No cap. No limit. Just your effort.",
    color: "#00E5A0",
    Icon: Banknote,
  },
  {
    title: "Train. Certify. Earn.",
    body: "Free training modules. Pass the quiz. Activate your Annotation Lens. Start earning within 24 hours of signing up.",
    color: "#FFB800",
    Icon: Microscope,
  },
];

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const s = slides[step];
  const { Icon } = s;

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-between z-[999] overflow-hidden animate-fadeIn"
      style={{
        background: "linear-gradient(160deg,#060A12 0%,#0A1428 100%)",
        padding: "36px 20px 28px",
      }}
    >
      {/* Radial blob */}
      <div
        className="absolute pointer-events-none transition-all duration-500"
        style={{
          top: -100,
          left: "50%",
          transform: "translateX(-50%)",
          width: 360,
          height: 360,
          background: `radial-gradient(circle,${s.color}14 0%,transparent 70%)`,
        }}
      />

      {/* Logo */}
      <div className="flex items-center gap-2 z-10 mb-1">
        <div
          className="flex items-center justify-center rounded-[9px] font-black text-white text-base"
          style={{
            width: 34,
            height: 34,
            background: "linear-gradient(135deg,#00D4FF,#0055DD)",
            boxShadow: "0 4px 16px rgba(0,212,255,.4)",
            fontFamily: "-apple-system-ui-serif,'SF Pro Display','Segoe UI',sans-serif",
          }}
        >
          D
        </div>
        <span
          className="font-black text-xl text-white tracking-tight"
          style={{ fontFamily: "-apple-system-ui-serif,'SF Pro Display','Segoe UI',sans-serif" }}
        >
          DEEL<span style={{ color: "#00D4FF" }}>Ai</span>
        </span>
      </div>

      {/* Globe + content */}
      <div className="flex flex-col items-center gap-0 z-10 text-center mt-[-8px]">
        <SmallGlobe color={s.color} />

        {/* Icon box */}
        <div
          className="flex items-center justify-center rounded-[14px] relative z-[2]"
          style={{
            width: 52,
            height: 52,
            background: `${s.color}20`,
            border: `2px solid ${s.color}50`,
            marginTop: -18,
            marginBottom: 14,
            boxShadow: `0 4px 20px ${s.color}40`,
          }}
        >
          <Icon size={24} color={s.color} />
        </div>

        <h2
          className="font-black text-white leading-tight mb-2.5 px-3"
          style={{
            fontSize: 24,
            fontFamily: "-apple-system-ui-serif,'SF Pro Display','Segoe UI',sans-serif",
          }}
        >
          {s.title}
        </h2>
        <p className="text-sm leading-relaxed max-w-[290px] px-2" style={{ color: "var(--txt2)" }}>
          {s.body}
        </p>
      </div>

      {/* Dots + buttons */}
      <div className="w-full max-w-[340px] z-10 pb-1">
        <div className="flex justify-center gap-2 mb-[18px]">
          {slides.map((_, i) => (
            <div
              key={i}
              className="rounded transition-all duration-[350ms]"
              style={{
                width: i === step ? 28 : 7,
                height: 7,
                background: i === step ? s.color : "var(--s3)",
              }}
            />
          ))}
        </div>

        <button
          onClick={() => (step < slides.length - 1 ? setStep(step + 1) : onDone())}
          className="w-full rounded-[14px] border-none font-black text-[17px] tracking-[0.2px]"
          style={{
            padding: 16,
            cursor: "pointer",
            background: `linear-gradient(135deg,${s.color},${s.color}CC)`,
            color: s.color === "#FFB800" ? "#000" : "#fff",
            boxShadow: `0 6px 28px ${s.color}44`,
            fontFamily: "-apple-system-ui-serif,'SF Pro Display','Segoe UI',sans-serif",
          }}
        >
          {step < slides.length - 1 ? "Continue →" : "Get Started →"}
        </button>

        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-3 w-full text-center text-[13px] bg-transparent border-none block"
            style={{ color: "var(--txt2)", cursor: "pointer" }}
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}

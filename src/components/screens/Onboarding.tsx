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
  { title: "Welcome to DEELAI", body: "The world's premier AI-powered remote job platform connecting global talent to the world's leading AI companies. Work from anywhere. Earn in dollars.", color: "#00D4FF", Icon: Globe },
  { title: "3 High-Paying AI Jobs", body: "Image Annotation, Voice Transcription and Content Intelligence. One platform. Multiple income streams. All from your phone.", color: "#8B5CF6", Icon: Tag },
  { title: "Real Dollar Salary", body: "Top workers worldwide earn $14,000+ monthly. Salaries paid every Friday, directly to your bank. No cap. No limit. Just your effort.", color: "#00E5A0", Icon: Banknote },
  { title: "Train. Certify. Earn.", body: "Free training modules. Pass the quiz. Activate your Annotation Lens. Start earning within 24 hours of signing up.", color: "#FFB800", Icon: Microscope },
];

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const s = slides[step];
  const { Icon } = s;

  return (
    <div
      className="fixed inset-0 overflow-hidden animate-fadeIn"
      style={{ background: "linear-gradient(160deg,#060A12 0%,#0A1428 100%)" }}
    >
      {/* Desktop: side-by-side | Mobile: stacked */}
      <div className="flex flex-col md:flex-row h-full">

        {/* ── Left / Content pane ── */}
        <div className="flex flex-col justify-between flex-1 md:flex-none md:w-1/2 lg:w-2/5 relative z-10 p-6 sm:p-8 md:p-10 lg:p-14 order-2 md:order-1">
          {/* Blob (mobile only) */}
          <div
            className="md:hidden absolute pointer-events-none transition-all duration-500"
            style={{
              top: -80, left: "50%", transform: "translateX(-50%)",
              width: 320, height: 320,
              background: `radial-gradient(circle,${s.color}14 0%,transparent 70%)`,
            }}
          />

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-4 md:mb-0 z-10">
            <div
              className="flex items-center justify-center rounded-[10px] font-black text-white shrink-0"
              style={{
                width: 36, height: 36,
                background: "linear-gradient(135deg,#00D4FF,#0055DD)",
                boxShadow: "0 4px 16px rgba(0,212,255,.4)",
                fontSize: 17,
              }}
            >
              D
            </div>
            <span className="font-black text-xl sm:text-2xl text-white tracking-tight">
              DEEL<span style={{ color: "#00D4FF" }}>Ai</span>
            </span>
          </div>

          {/* Mobile globe (shown inline on mobile between logo and content) */}
          <div className="md:hidden flex flex-col items-center my-4 z-10">
            <SmallGlobe color={s.color} />
            <div
              className="flex items-center justify-center rounded-2xl relative z-[2] -mt-5 mb-4"
              style={{
                width: 52, height: 52,
                background: `${s.color}20`, border: `2px solid ${s.color}50`,
                boxShadow: `0 4px 20px ${s.color}40`,
              }}
            >
              <Icon size={24} color={s.color} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 md:flex md:flex-col md:justify-center z-10">
            {/* Desktop icon */}
            <div
              className="hidden md:flex items-center justify-center rounded-2xl mb-6"
              style={{
                width: 60, height: 60,
                background: `${s.color}20`, border: `2px solid ${s.color}50`,
                boxShadow: `0 6px 28px ${s.color}40`,
              }}
            >
              <Icon size={30} color={s.color} />
            </div>

            <h2
              className="font-black text-2xl sm:text-3xl md:text-4xl text-white leading-tight mb-3 md:mb-4"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              {s.title}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed md:max-w-sm" style={{ color: "var(--txt2)" }}>
              {s.body}
            </p>
          </div>

          {/* Dots + Buttons */}
          <div className="z-10 pt-6 md:pt-8">
            <div className="flex gap-2 mb-5">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-[350ms]"
                  style={{ width: i === step ? 28 : 7, height: 7, background: i === step ? s.color : "var(--s3)" }}
                />
              ))}
            </div>
            <button
              onClick={() => step < slides.length - 1 ? setStep(step + 1) : onDone()}
              className="w-full font-black text-base sm:text-lg tracking-wide rounded-2xl border-none min-h-[52px] sm:min-h-[56px]"
              style={{
                cursor: "pointer",
                background: `linear-gradient(135deg,${s.color},${s.color}CC)`,
                color: s.color === "#FFB800" ? "#000" : "#fff",
                boxShadow: `0 6px 28px ${s.color}44`,
              }}
            >
              {step < slides.length - 1 ? "Continue →" : "Get Started →"}
            </button>
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="mt-3 w-full text-center text-sm bg-transparent border-none min-h-[44px]"
                style={{ color: "var(--txt2)", cursor: "pointer" }}
              >
                ← Back
              </button>
            )}
          </div>
        </div>

        {/* ── Right / Globe pane (desktop only) ── */}
        <div
          className="hidden md:flex flex-1 items-center justify-center relative order-1 md:order-2"
          style={{ background: `radial-gradient(ellipse at center,${s.color}18 0%,transparent 65%)` }}
        >
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-500"
            style={{ background: `radial-gradient(ellipse at center,${s.color}10 0%,transparent 60%)` }}
          />
          <div className="flex flex-col items-center gap-4 z-10">
            <SmallGlobe color={s.color} />
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{
                width: 64, height: 64,
                background: `${s.color}20`, border: `2px solid ${s.color}50`,
                boxShadow: `0 8px 32px ${s.color}50`,
              }}
            >
              <Icon size={32} color={s.color} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

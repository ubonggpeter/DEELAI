"use client";
import { useState } from "react";
import { ArrowLeft, Bell, ShieldCheck, Lock, Mail, Key, Trash2, ChevronRight } from "lucide-react";

interface Props {
  onBack: () => void;
}

function Toggle({ val, fn }: { val: boolean; fn: () => void }) {
  return (
    <div
      onClick={fn}
      className="relative flex-shrink-0 cursor-pointer transition-colors duration-200 rounded-full"
      style={{
        width: 46,
        height: 26,
        background: val ? "var(--cyan)" : "var(--s3)",
      }}
    >
      <div
        className="absolute top-[3px] w-5 h-5 rounded-full bg-white transition-all duration-200"
        style={{ left: val ? 22 : 3 }}
      />
    </div>
  );
}

export default function SettingsScreen({ onBack }: Props) {
  const [notif, setNotif] = useState(true);
  const [bio, setBio] = useState(false);
  const [twofa, setTwofa] = useState(true);

  const toggleRows = [
    { Icon: Bell, title: "Push Notifications", desc: "Get alerts for job approvals & payouts", val: notif, fn: () => setNotif(!notif) },
    { Icon: ShieldCheck, title: "Biometric Login", desc: "Use fingerprint or Face ID to log in", val: bio, fn: () => setBio(!bio) },
    { Icon: Lock, title: "Two-Factor Auth", desc: "Extra security for withdrawals", val: twofa, fn: () => setTwofa(!twofa) },
  ];

  const accountRows = [
    { Icon: Mail, label: "Change Email" },
    { Icon: Key, label: "Change Password" },
    { Icon: Trash2, label: "Delete Account" },
  ];

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
          <div style={{ fontWeight: 800, fontSize: 20 }}>Settings</div>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* Toggle Rows */}
        {toggleRows.map(({ Icon, title, desc, val, fn }) => (
          <div
            key={title}
            className="flex items-center gap-3 rounded-2xl mb-3"
            style={{ padding: 16, background: "var(--s1)", border: "1px solid var(--b1)" }}
          >
            <Icon size={22} style={{ color: "var(--txt2)", flexShrink: 0 }} />
            <div className="flex-1">
              <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
              <div style={{ fontSize: 12, color: "var(--txt2)", marginTop: 2 }}>{desc}</div>
            </div>
            <Toggle val={val} fn={fn} />
          </div>
        ))}

        {/* Account Section */}
        <div style={{ fontWeight: 700, fontSize: 14, marginTop: 20, marginBottom: 12 }}>Account</div>
        {accountRows.map(({ Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-2xl mb-2 cursor-pointer"
            style={{ padding: "15px 16px", background: "var(--s1)", border: "1px solid var(--b1)" }}
          >
            <Icon size={20} style={{ color: "var(--txt2)", flexShrink: 0 }} />
            <span style={{ fontSize: 14, flex: 1 }}>{label}</span>
            <ChevronRight size={16} style={{ color: "var(--txt3)" }} />
          </div>
        ))}

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

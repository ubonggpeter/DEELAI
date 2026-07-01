"use client";
import { useState } from "react";
import { ArrowLeft, Bell, ShieldCheck, Lock, Mail, Key, Trash2, ChevronRight } from "lucide-react";

interface Props {
  onBack: () => void;
}

function Toggle({ val, fn }: { val: boolean; fn: () => void }) {
  return (
    <div onClick={fn}
      className="relative flex-shrink-0 cursor-pointer transition-colors duration-200 rounded-full"
      style={{ width: 46, height: 26, background: val ? "var(--cyan)" : "var(--s3)" }}>
      <div className="absolute top-[3px] w-5 h-5 rounded-full bg-white transition-all duration-200"
        style={{ left: val ? 22 : 3 }} />
    </div>
  );
}

export default function SettingsScreen({ onBack }: Props) {
  const [notif, setNotif] = useState(true);
  const [bio,   setBio]   = useState(false);
  const [twofa, setTwofa] = useState(true);

  const toggleRows = [
    { Icon: Bell,        title: "Push Notifications", desc: "Get alerts for job approvals & payouts", val: notif, fn: () => setNotif(!notif) },
    { Icon: ShieldCheck, title: "Biometric Login",     desc: "Use fingerprint or Face ID to log in",  val: bio,   fn: () => setBio(!bio) },
    { Icon: Lock,        title: "Two-Factor Auth",     desc: "Extra security for withdrawals",         val: twofa, fn: () => setTwofa(!twofa) },
  ];

  const accountRows = [
    { Icon: Mail,   label: "Change Email" },
    { Icon: Key,    label: "Change Password" },
    { Icon: Trash2, label: "Delete Account" },
  ];

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
            <div className="text-xl sm:text-2xl font-black text-white">Settings</div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Toggle Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {toggleRows.map(({ Icon, title, desc, val, fn }) => (
            <div key={title}
              className="flex items-center gap-3 rounded-2xl p-4 sm:p-5"
              style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
              <Icon size={22} style={{ color: "var(--txt2)", flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{title}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--txt2)" }}>{desc}</div>
              </div>
              <Toggle val={val} fn={fn} />
            </div>
          ))}
        </div>

        {/* Account Section */}
        <div className="text-sm sm:text-base font-bold mb-3 text-white">Account</div>
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
          {accountRows.map(({ Icon, label }, i) => (
            <div key={label}
              className="flex items-center gap-3 cursor-pointer p-4 sm:p-5 transition-colors"
              style={{ borderBottom: i < accountRows.length - 1 ? "1px solid var(--b1)" : "none" }}>
              <Icon size={20} style={{ color: "var(--txt2)", flexShrink: 0 }} />
              <span className="text-sm sm:text-base flex-1">{label}</span>
              <ChevronRight size={16} style={{ color: "var(--txt3)" }} />
            </div>
          ))}
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}

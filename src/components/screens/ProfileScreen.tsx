"use client";
import { ArrowLeft, User, Globe, Calendar, Share2, CreditCard, Microscope, Flame } from "lucide-react";
import { User as UserType } from "@/lib/types";

interface Props {
  user: UserType;
  onBack: () => void;
}

export default function ProfileScreen({ user, onBack }: Props) {
  const stats = [
    { label: "SALARY",   value: `$${user.salary.toLocaleString()}`,  color: "#00E5A0" },
    { label: "JOBS",     value: user.jobsDone.toLocaleString(),       color: "#00D4FF" },
    { label: "ACCURACY", value: `${user.accuracy}%`,                  color: "#FFB800" },
    { label: "STREAK",   value: `${user.streak}d`,                    color: "#FF4D6D", icon: <Flame size={12} /> },
  ];

  const infoRows = [
    { Icon: Globe,      label: "Location",     value: "Worldwide · Remote" },
    { Icon: Globe,      label: "Platform",     value: "deelai.uk" },
    { Icon: Calendar,   label: "Member Since", value: "January 2026" },
    { Icon: Share2,     label: "Recruit Code", value: user.refCode },
    { Icon: CreditCard, label: "Payout",       value: "Bank Transfer — GTBank" },
  ];

  return (
    <div className="animate-fadeUp w-full" style={{ background: "var(--bg)", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(145deg,#081428,#0C1E40)" }} className="rounded-b-3xl mb-5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 text-center relative">
          <button
            onClick={onBack}
            className="absolute top-6 left-4 sm:left-6 lg:left-8 flex items-center justify-center w-9 h-9 rounded-xl min-h-[44px] min-w-[44px]"
            style={{ background: "var(--b1)", color: "var(--txt2)" }}
          >
            <ArrowLeft size={18} />
          </button>

          <div className="text-xl sm:text-2xl font-black mb-6 text-white">My Profile</div>

          {/* Avatar */}
          <div
            className="flex items-center justify-center mx-auto mb-3 rounded-3xl w-20 h-20 sm:w-24 sm:h-24"
            style={{ background: "linear-gradient(135deg,#1a3060,#0d2040)", border: "3px solid rgba(0,212,255,.4)", color: "var(--txt2)" }}
          >
            <User size={38} className="sm:w-11 sm:h-11" />
          </div>

          <div className="text-2xl sm:text-3xl font-bold text-white">{user.name}</div>
          <div className="text-xs font-mono tracking-widest mt-1" style={{ color: "var(--txt2)" }}>{user.level}</div>

          <div className="flex justify-center gap-2 mt-3 flex-wrap">
            <span
              className="rounded-lg px-3 py-1.5 text-[11px] font-mono font-bold tracking-wider border"
              style={user.isPermanent
                ? { background: "rgba(0,229,160,.15)", borderColor: "rgba(0,229,160,.4)", color: "#00E5A0" }
                : { background: "rgba(255,184,0,.15)", borderColor: "rgba(255,184,0,.4)", color: "#FFB800" }}
            >
              {user.isPermanent ? "PERMANENT STAFF" : "ASSOCIATE STAFF"}
            </span>
            {user.kycDone && (
              <span className="rounded-lg px-3 py-1.5 text-[11px] font-mono font-bold border"
                style={{ background: "rgba(0,229,160,.15)", borderColor: "rgba(0,229,160,.4)", color: "#00E5A0" }}>
                ✓ VERIFIED
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {stats.map(({ label, value, color, icon }) => (
            <div key={label} className="rounded-xl text-center p-3 sm:p-4"
              style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
              <div className="text-[9px] font-mono tracking-widest mb-1.5" style={{ color: "var(--txt2)" }}>{label}</div>
              <div className="flex items-center justify-center gap-1 font-bold text-sm sm:text-base" style={{ color }}>
                {icon}{value}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop two-col: info left, lens right */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
          {/* Info List */}
          <div className="rounded-2xl overflow-hidden mb-5 lg:mb-0"
            style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
            {infoRows.map(({ Icon, label, value }, i) => (
              <div key={label} className="flex items-center gap-3 p-4 sm:p-5"
                style={{ borderBottom: i < infoRows.length - 1 ? "1px solid var(--b1)" : "none" }}>
                <Icon size={16} style={{ color: "var(--txt3)", flexShrink: 0 }} />
                <span className="text-sm flex-1" style={{ color: "var(--txt2)" }}>{label}</span>
                <span className="text-sm font-medium text-white truncate max-w-[140px]">{value}</span>
              </div>
            ))}
          </div>

          {/* Lens Banner */}
          {user.lensActivated ? (
            <div className="flex items-start gap-3 rounded-2xl p-4 sm:p-5 h-fit"
              style={{ background: "rgba(0,212,255,.06)", border: "1px solid rgba(0,212,255,.22)" }}>
              <Microscope size={24} style={{ color: "var(--cyan)", flexShrink: 0 }} />
              <div>
                <div className="font-semibold text-sm sm:text-base mb-1" style={{ color: "var(--cyan)" }}>Annotation Lens Active</div>
                <div className="text-xs sm:text-sm" style={{ color: "var(--txt2)" }}>Permanent tool · Activated May 17, 2026</div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-4 sm:p-5 h-fit"
              style={{ background: "rgba(255,184,0,.06)", border: "1px solid rgba(255,184,0,.2)" }}>
              <div className="text-xs sm:text-sm" style={{ color: "var(--txt2)" }}>
                Complete training and activate your Annotation Lens to unlock all annotation jobs.
              </div>
            </div>
          )}
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}

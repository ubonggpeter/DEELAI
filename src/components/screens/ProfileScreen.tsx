"use client";
import {
  ArrowLeft, User, Globe, Calendar, Share2, CreditCard, Microscope, Flame,
} from "lucide-react";
import { User as UserType } from "@/lib/types";

interface Props {
  user: UserType;
  onBack: () => void;
}

export default function ProfileScreen({ user, onBack }: Props) {
  const stats = [
    { label: "SALARY", value: `$${user.salary.toLocaleString()}`, color: "#00E5A0" },
    { label: "JOBS", value: user.jobsDone.toLocaleString(), color: "#00D4FF" },
    { label: "ACCURACY", value: `${user.accuracy}%`, color: "#FFB800" },
    { label: "STREAK", value: `${user.streak}d`, color: "#FF4D6D", icon: <Flame size={12} /> },
  ];

  const infoRows = [
    { Icon: Globe, label: "Location", value: "Worldwide · Remote" },
    { Icon: Globe, label: "Platform", value: "deelai.uk" },
    { Icon: Calendar, label: "Member Since", value: "January 2026" },
    { Icon: Share2, label: "Recruit Code", value: user.refCode },
    { Icon: CreditCard, label: "Payout", value: "Bank Transfer — GTBank" },
  ];

  return (
    <div className="animate-fadeUp" style={{ background: "var(--bg)", minHeight: "100%" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(145deg,#081428,#0C1E40)",
          padding: "24px 18px 28px",
          borderRadius: "0 0 24px 24px",
          marginBottom: 20,
          textAlign: "center",
          position: "relative",
        }}
      >
        <button
          onClick={onBack}
          className="absolute flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ top: 24, left: 18, background: "var(--b1)", color: "var(--txt2)", border: "none", cursor: "pointer" }}
        >
          <ArrowLeft size={18} />
        </button>

        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 24 }}>My Profile</div>

        {/* Avatar */}
        <div
          className="flex items-center justify-center mx-auto mb-3 rounded-3xl"
          style={{
            width: 82, height: 82,
            background: "linear-gradient(135deg,#1a3060,#0d2040)",
            border: "3px solid rgba(0,212,255,.4)",
            color: "var(--txt2)",
          }}
        >
          <User size={38} />
        </div>

        <div style={{ fontWeight: 700, fontSize: 22 }}>{user.name}</div>
        <div style={{ fontSize: 12, color: "var(--txt2)", fontFamily: "monospace", letterSpacing: 1, marginTop: 4 }}>
          {user.level}
        </div>

        <div className="flex justify-center gap-2 mt-3 flex-wrap">
          <span
            className="rounded-lg px-3 py-1 text-[11px] font-mono font-bold tracking-wider border"
            style={
              user.isPermanent
                ? { background: "rgba(0,229,160,.15)", border: "1px solid rgba(0,229,160,.4)", color: "#00E5A0" }
                : { background: "rgba(255,184,0,.15)", border: "1px solid rgba(255,184,0,.4)", color: "#FFB800" }
            }
          >
            {user.isPermanent ? "PERMANENT STAFF" : "ASSOCIATE STAFF"}
          </span>
          {user.kycDone && (
            <span
              className="rounded-lg px-3 py-1 text-[11px] font-mono font-bold"
              style={{ background: "rgba(0,229,160,.15)", border: "1px solid rgba(0,229,160,.4)", color: "#00E5A0" }}
            >
              ✓ VERIFIED
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* Stats Row */}
        <div className="flex gap-2 mb-5">
          {stats.map(({ label, value, color, icon }) => (
            <div
              key={label}
              className="flex-1 rounded-xl text-center"
              style={{ background: "var(--s1)", border: "1px solid var(--b1)", padding: "10px 8px" }}
            >
              <div style={{ fontSize: 8, color: "var(--txt2)", fontFamily: "monospace", letterSpacing: 1 }}>{label}</div>
              <div
                className="flex items-center justify-center gap-1 mt-1"
                style={{ fontWeight: 700, color, fontSize: 13 }}
              >
                {icon}
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Info List */}
        <div
          className="rounded-2xl overflow-hidden mb-5"
          style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}
        >
          {infoRows.map(({ Icon, label, value }, i) => (
            <div
              key={label}
              className="flex items-center gap-3"
              style={{
                padding: "14px 16px",
                borderBottom: i < infoRows.length - 1 ? "1px solid var(--b1)" : "none",
              }}
            >
              <Icon size={16} style={{ color: "var(--txt3)", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "var(--txt2)", flex: 1 }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Lens Banner */}
        {user.lensActivated && (
          <div
            className="flex items-center gap-3 rounded-2xl mb-5"
            style={{
              background: "rgba(0,212,255,.06)",
              border: "1px solid rgba(0,212,255,.22)",
              padding: "14px 16px",
            }}
          >
            <Microscope size={24} style={{ color: "var(--cyan)", flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--cyan)" }}>Annotation Lens Active</div>
              <div style={{ fontSize: 12, color: "var(--txt2)", marginTop: 2 }}>
                Permanent tool · Activated May 17, 2026
              </div>
            </div>
          </div>
        )}

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

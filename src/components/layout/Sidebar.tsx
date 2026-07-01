"use client";
import {
  Zap, GraduationCap, Tag, Users, CreditCard,
  Bell, User, TrendingUp, Settings, LogOut, ShieldCheck,
  LucideIcon,
} from "lucide-react";
import { Screen } from "@/lib/types";
import { SUPER_ADMIN_EMAIL } from "@/lib/adminConfig";

interface SidebarProps {
  screen: Screen;
  setScreen: (s: Screen) => void;
  user: { name: string; level: string; salary: number; email?: string };
  notifCount: number;
  onMenuOpen: () => void;
}

const NAV: { id: Screen; Icon: LucideIcon; label: string }[] = [
  { id: "activity",  Icon: Zap,          label: "Activity"  },
  { id: "training",  Icon: GraduationCap, label: "Training"  },
  { id: "workspace", Icon: Tag,           label: "Work"      },
  { id: "recruit",   Icon: Users,         label: "Recruit"   },
  { id: "wallet",    Icon: CreditCard,    label: "Wallet"    },
];

const SECONDARY: { id: Screen; Icon: LucideIcon; label: string }[] = [
  { id: "notifications", Icon: Bell,        label: "Notifications" },
  { id: "profile",       Icon: User,        label: "Profile"       },
  { id: "tier",          Icon: TrendingUp,  label: "Tier Upgrade"  },
  { id: "settings",      Icon: Settings,    label: "Settings"      },
];

export default function Sidebar({ screen, setScreen, user, notifCount, onMenuOpen }: SidebarProps) {
  return (
    <aside
      className="hidden md:flex flex-col shrink-0 border-r overflow-y-auto"
      style={{
        width: 240,
        background: "#080E1A",
        borderColor: "rgba(255,255,255,.08)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b" style={{ borderColor: "rgba(255,255,255,.06)" }}>
        <div
          className="flex items-center justify-center rounded-[10px] font-black text-white text-[18px] shrink-0"
          style={{
            width: 38, height: 38,
            background: "linear-gradient(135deg,#00D4FF,#0055DD)",
            boxShadow: "0 4px 16px rgba(0,212,255,.35)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          D
        </div>
        <span className="font-black text-[20px] text-white tracking-tight" style={{ fontFamily: "system-ui, sans-serif" }}>
          DEEL<span style={{ color: "#00D4FF" }}>Ai</span>
        </span>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-col gap-1 px-3 pt-4">
        <p className="text-[10px] font-mono tracking-[1px] px-3 pb-2" style={{ color: "var(--txt3)" }}>MAIN MENU</p>
        {NAV.map(({ id, Icon, label }) => {
          const active = screen === id;
          return (
            <button
              key={id}
              onClick={() => setScreen(id)}
              className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-left transition-all duration-150 border"
              style={{
                background: active ? "rgba(0,212,255,.1)" : "transparent",
                borderColor: active ? "rgba(0,212,255,.25)" : "transparent",
                color: active ? "var(--cyan)" : "var(--txt2)",
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[13px] font-medium">{label}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "var(--cyan)" }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Secondary nav */}
      <nav className="flex flex-col gap-1 px-3 pt-5">
        <p className="text-[10px] font-mono tracking-[1px] px-3 pb-2" style={{ color: "var(--txt3)" }}>ACCOUNT</p>
        {SECONDARY.map(({ id, Icon, label }) => {
          const active = screen === id;
          return (
            <button
              key={id}
              onClick={() => setScreen(id)}
              className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-left transition-all duration-150 relative border"
              style={{
                background: active ? "rgba(0,212,255,.1)" : "transparent",
                borderColor: active ? "rgba(0,212,255,.25)" : "transparent",
                color: active ? "var(--cyan)" : "var(--txt2)",
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[13px] font-medium">{label}</span>
              {id === "notifications" && notifCount > 0 && (
                <span
                  className="ml-auto flex items-center justify-center text-[9px] font-mono font-bold text-white rounded-full"
                  style={{ width: 18, height: 18, background: "#FF4D6D", minWidth: 18 }}
                >
                  {notifCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Admin link — shown for admin email */}
      {user.email === SUPER_ADMIN_EMAIL && (
        <nav className="flex flex-col gap-1 px-3 pt-5">
          <p className="text-[10px] font-mono tracking-[1px] px-3 pb-2" style={{ color: "var(--txt3)" }}>ADMIN</p>
          <a
            href="/admin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-left border no-underline transition-all duration-150"
            style={{
              background: "rgba(139,92,246,.1)",
              borderColor: "rgba(139,92,246,.25)",
              color: "#8B5CF6",
              textDecoration: "none",
            }}
          >
            <ShieldCheck size={18} strokeWidth={2} />
            <span className="text-[13px] font-semibold">Admin Panel</span>
          </a>
        </nav>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* User card */}
      <div className="mx-3 mb-4 rounded-xl p-3 border" style={{ background: "rgba(255,255,255,.03)", borderColor: "rgba(255,255,255,.06)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{ width: 36, height: 36, background: "rgba(0,212,255,.12)", border: "1px solid rgba(0,212,255,.25)" }}
          >
            <User size={18} color="var(--cyan)" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-white truncate">{user.name}</div>
            <div className="text-[10px] font-mono truncate" style={{ color: "var(--txt3)" }}>{user.level}</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] font-mono mb-0.5" style={{ color: "var(--txt3)" }}>SALARY</div>
            <div className="text-[13px] font-bold" style={{ color: "var(--green)" }}>${user.salary.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <button
            onClick={onMenuOpen}
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{ width: 32, height: 32, background: "rgba(255,77,109,.1)", border: "1px solid rgba(255,77,109,.2)", color: "#FF4D6D" }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

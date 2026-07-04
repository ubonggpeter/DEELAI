"use client";
import Image from "next/image";
import {
  User,
  Trophy,
  Bell,
  TrendingUp,
  IdCard,
  Calendar,
  Settings,
  Shield,
  MessageCircle,
  ChevronRight,
  LogOut,
  Flame,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";
import { User as UserType, Screen } from "@/lib/types";
import { SUPER_ADMIN_EMAIL } from "@/lib/adminConfig";

interface MenuItem {
  Icon: LucideIcon;
  label: string;
  screen: Screen;
}

const MENU_ITEMS: MenuItem[] = [
  { Icon: User, label: "My Profile", screen: "profile" },
  { Icon: Trophy, label: "Leaderboard", screen: "leaderboard" },
  { Icon: Bell, label: "Notifications", screen: "notifications" },
  { Icon: TrendingUp, label: "Tier Upgrade", screen: "tier" },
  { Icon: IdCard, label: "ID Verification", screen: "kyc" },
  { Icon: Calendar, label: "Payout Schedule", screen: "payout" },
  { Icon: Settings, label: "Settings", screen: "settings" },
  { Icon: Shield, label: "Terms & Privacy", screen: "terms" },
  { Icon: MessageCircle, label: "Help & Support", screen: "support" },
];

export default function SlideMenu({
  user,
  open,
  onClose,
  setScreen,
  onLogout,
}: {
  user: UserType;
  open: boolean;
  onClose: () => void;
  setScreen: (s: Screen) => void;
  onLogout?: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[500]" onClick={onClose}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fadeIn"
        style={{ background: "rgba(0,0,0,.6)" }}
      />

      {/* Drawer */}
      <div
        className="absolute top-0 right-0 bottom-0 flex flex-col overflow-y-auto animate-slideRight"
        style={{
          width: "78%",
          maxWidth: 300,
          background: "#0C1220",
          borderLeft: "1px solid var(--b2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 pb-6 pt-9"
          style={{
            background: "linear-gradient(145deg,#0A1830,#0E2040)",
            borderBottom: "1px solid var(--b1)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex items-center justify-center rounded-[16px] overflow-hidden"
              style={{
                width: 54,
                height: 54,
                background: "linear-gradient(135deg,#00D4FF22,#0055DD22)",
                border: "2px solid rgba(0,212,255,.3)",
              }}
            >
              {user.avatarUrl
                ? <Image src={user.avatarUrl} alt={user.name} width={54} height={54} className="w-full h-full object-cover" unoptimized />
                : <User size={26} color="#00D4FF" />}
            </div>
            <div>
              <div
                className="font-bold text-[17px] text-white"
                style={{ fontFamily: "-apple-system-ui-serif,'SF Pro Display','Segoe UI',sans-serif" }}
              >
                {user.name}
              </div>
              <div
                className="text-[11px] mt-0.5 tracking-[1px]"
                style={{ color: "var(--txt2)", fontFamily: "monospace" }}
              >
                {user.level}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <div
              className="flex-1 rounded-[10px] p-2"
              style={{
                background: "rgba(0,229,160,.08)",
                border: "1px solid rgba(0,229,160,.2)",
              }}
            >
              <div
                className="text-[9px] tracking-[1px]"
                style={{ color: "var(--txt2)", fontFamily: "monospace" }}
              >
                SALARY
              </div>
              <div
                className="font-bold text-[14px] mt-0.5"
                style={{
                  color: "#00E5A0",
                  fontFamily: "-apple-system-ui-serif,'SF Pro Display','Segoe UI',sans-serif",
                }}
              >
                ${user.salary.toLocaleString()}
              </div>
            </div>
            <div
              className="flex-1 rounded-[10px] p-2"
              style={{
                background: "rgba(0,212,255,.08)",
                border: "1px solid rgba(0,212,255,.2)",
              }}
            >
              <div
                className="text-[9px] tracking-[1px]"
                style={{ color: "var(--txt2)", fontFamily: "monospace" }}
              >
                STREAK
              </div>
              <div
                className="flex items-center gap-1 font-bold text-[14px] mt-0.5"
                style={{
                  color: "var(--cyan)",
                  fontFamily: "-apple-system-ui-serif,'SF Pro Display','Segoe UI',sans-serif",
                }}
              >
                <Flame size={12} color="#FFB800" />
                {user.streak} days
              </div>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="py-3 flex-1">
          {MENU_ITEMS.map(({ Icon, label, screen }) => (
            <div
              key={screen}
              className="flex items-center gap-3.5 px-5 py-3.5 cursor-pointer"
              style={{ borderBottom: "1px solid var(--b1)" }}
              onClick={() => {
                setScreen(screen);
                onClose();
              }}
            >
              <Icon size={20} color="var(--txt2)" />
              <span className="text-[14px] font-medium flex-1 text-white">{label}</span>
              <ChevronRight size={14} color="var(--txt3)" />
            </div>
          ))}
        </div>

        {/* Admin Panel link — for super admin AND sub-admins */}
        {(user.email === SUPER_ADMIN_EMAIL || user.isAdmin) && (
          <a
            href="/admin/dashboard"
            className="flex items-center gap-3.5 px-5 py-3.5"
            style={{ borderBottom: "1px solid var(--b1)", textDecoration:"none", background:"rgba(139,92,246,.06)" }}
            onClick={onClose}
          >
            <ShieldCheck size={20} color="#8B5CF6" />
            <span className="text-[14px] font-semibold flex-1" style={{ color:"#8B5CF6" }}>Admin Panel</span>
            <ChevronRight size={14} color="#8B5CF6" />
          </a>
        )}

        {/* Logout */}
        <div className="p-5">
          <button
            onClick={() => { onClose(); onLogout?.(); }}
            className="w-full py-3.5 rounded-[12px] flex items-center justify-center gap-2 font-semibold text-[14px] cursor-pointer"
            style={{
              border: "1px solid rgba(255,77,109,.3)",
              background: "rgba(255,77,109,.08)",
              color: "#FF4D6D",
              fontFamily: "-apple-system-ui-serif,'SF Pro Display','Segoe UI',sans-serif",
            }}
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

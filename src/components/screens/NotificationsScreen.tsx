"use client";
import { ArrowLeft, Bell, CheckCircle, Users, Flame, Calendar, Target, Search } from "lucide-react";
import { Notification } from "@/lib/types";

const iconMap: Record<string, React.ReactNode> = {
  check:    <CheckCircle size={20} />,
  users:    <Users size={20} />,
  flame:    <Flame size={20} />,
  calendar: <Calendar size={20} />,
  target:   <Target size={20} />,
  search:   <Search size={20} />,
};

interface Props {
  notifs: Notification[];
  setNotifs: (n: Notification[]) => void;
  onBack: () => void;
}

export default function NotificationsScreen({ notifs, setNotifs, onBack }: Props) {
  const unread = notifs.filter((n) => !n.read).length;
  const markRead = (id: number) => setNotifs(notifs.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAll  = () => setNotifs(notifs.map((n) => ({ ...n, read: true })));

  return (
    <div className="animate-fadeUp w-full" style={{ background: "var(--bg)", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(145deg,#081428,#0C1E40)" }} className="rounded-b-3xl mb-5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-5">
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={onBack}
              className="flex items-center justify-center w-9 h-9 rounded-xl min-h-[44px] min-w-[44px] transition-colors"
              style={{ background: "var(--b1)", color: "var(--txt2)" }}
            >
              <ArrowLeft size={18} />
            </button>
            <div className="text-xl sm:text-2xl font-black flex-1 text-white">Notifications</div>
            {unread > 0 && (
              <button
                onClick={markAll}
                className="text-xs sm:text-sm font-mono min-h-[44px] px-3 bg-transparent border-none cursor-pointer"
                style={{ color: "var(--cyan)" }}
              >
                Mark all read
              </button>
            )}
          </div>
          {unread > 0 && (
            <div className="text-xs sm:text-sm pl-12" style={{ color: "var(--txt2)" }}>
              {unread} unread notification{unread > 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* List */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {notifs.map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className="flex gap-3 rounded-2xl cursor-pointer transition-all"
              style={{
                padding: "14px 16px",
                background: n.read ? "var(--s1)" : "rgba(0,212,255,.05)",
                border: `1px solid ${n.read ? "var(--b1)" : "rgba(0,212,255,.15)"}`,
              }}
            >
              <div
                className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{ width: 42, height: 42, background: `${n.color}18`, border: `1px solid ${n.color}30`, color: n.color }}
              >
                {iconMap[n.type] ?? <Bell size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm sm:text-base font-semibold truncate">{n.title}</span>
                  {!n.read && (
                    <span className="rounded-full flex-shrink-0" style={{ width: 6, height: 6, background: "var(--cyan)" }} />
                  )}
                </div>
                <div className="text-xs sm:text-sm leading-relaxed mb-1" style={{ color: "var(--txt2)" }}>{n.body}</div>
                <div className="text-[10px] font-mono" style={{ color: "var(--txt3)" }}>{n.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="h-8" />
      </div>
    </div>
  );
}

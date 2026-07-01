"use client";
import { ArrowLeft, Bell, CheckCircle, Users, Flame, Calendar, Target, Search } from "lucide-react";
import { Notification } from "@/lib/types";

const iconMap: Record<string, React.ReactNode> = {
  check: <CheckCircle size={20} />,
  users: <Users size={20} />,
  flame: <Flame size={20} />,
  calendar: <Calendar size={20} />,
  target: <Target size={20} />,
  search: <Search size={20} />,
};

interface Props {
  notifs: Notification[];
  setNotifs: (n: Notification[]) => void;
  onBack: () => void;
}

export default function NotificationsScreen({ notifs, setNotifs, onBack }: Props) {
  const unread = notifs.filter((n) => !n.read).length;

  const markRead = (id: number) =>
    setNotifs(notifs.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAll = () => setNotifs(notifs.map((n) => ({ ...n, read: true })));

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
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ background: "var(--b1)", color: "var(--txt2)" }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ fontWeight: 800, fontSize: 20, flex: 1 }}>Notifications</div>
          {unread > 0 && (
            <button
              onClick={markAll}
              style={{ color: "var(--cyan)", fontSize: 12, fontFamily: "monospace", background: "none", border: "none", cursor: "pointer" }}
            >
              Mark all read
            </button>
          )}
        </div>
        {unread > 0 && (
          <div style={{ fontSize: 12, color: "var(--txt2)", marginLeft: 44 }}>
            {unread} unread notification{unread > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* List */}
      <div style={{ padding: "0 16px" }}>
        {notifs.map((n) => (
          <div
            key={n.id}
            onClick={() => markRead(n.id)}
            className="flex gap-3 rounded-2xl mb-2 cursor-pointer transition-all"
            style={{
              padding: 14,
              background: n.read ? "var(--s1)" : "rgba(0,212,255,.05)",
              border: `1px solid ${n.read ? "var(--b1)" : "rgba(0,212,255,.15)"}`,
            }}
          >
            {/* Icon */}
            <div
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{
                width: 42,
                height: 42,
                background: `${n.color}18`,
                border: `1px solid ${n.color}30`,
                color: n.color,
              }}
            >
              {iconMap[n.type] ?? <Bell size={20} />}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: 13, fontWeight: 600 }}>{n.title}</span>
                {!n.read && (
                  <span
                    className="rounded-full flex-shrink-0"
                    style={{ width: 6, height: 6, background: "var(--cyan)" }}
                  />
                )}
              </div>
              <div style={{ fontSize: 12, color: "var(--txt2)", lineHeight: 1.5, marginBottom: 4 }}>
                {n.body}
              </div>
              <div style={{ fontSize: 10, color: "var(--txt3)", fontFamily: "monospace" }}>{n.time}</div>
            </div>
          </div>
        ))}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

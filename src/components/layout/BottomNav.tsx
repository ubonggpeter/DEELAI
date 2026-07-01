"use client";
import { Zap, GraduationCap, Tag, Users, CreditCard, LucideIcon } from "lucide-react";
import { Screen } from "@/lib/types";

interface NavItem {
  id: Screen;
  Icon: LucideIcon;
  label: string;
}

const NAV: NavItem[] = [
  { id: "activity", Icon: Zap, label: "Activity" },
  { id: "training", Icon: GraduationCap, label: "Training" },
  { id: "workspace", Icon: Tag, label: "Work" },
  { id: "recruit", Icon: Users, label: "Recruit" },
  { id: "wallet", Icon: CreditCard, label: "Wallet" },
];

export default function BottomNav({
  screen,
  setScreen,
}: {
  screen: Screen;
  setScreen: (s: Screen) => void;
}) {
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 flex z-[100]"
      style={{
        background: "rgba(6,10,18,.97)",
        backdropFilter: "blur(24px)",
        borderTop: "1px solid var(--b2)",
        padding: "8px 0 14px",
      }}
    >
      {NAV.map(({ id, Icon, label }) => {
        const active = screen === id;
        return (
          <button
            key={id}
            onClick={() => setScreen(id)}
            className="flex-1 flex flex-col items-center gap-[3px] bg-transparent border-none cursor-pointer transition-colors duration-200"
            style={{ color: active ? "var(--cyan)" : "var(--txt3)" }}
          >
            <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
            <span
              className="text-[9px] tracking-[0.5px]"
              style={{
                fontFamily: "monospace",
                fontWeight: active ? 600 : 400,
              }}
            >
              {label}
            </span>
            {active && (
              <div
                className="rounded"
                style={{ width: 16, height: 2, background: "var(--cyan)", marginTop: 1 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

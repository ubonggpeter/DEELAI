"use client";

export default function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-[0.4px] border"
      style={{
        background: `${color}1E`,
        color,
        borderColor: `${color}44`,
      }}
    >
      {label}
    </span>
  );
}

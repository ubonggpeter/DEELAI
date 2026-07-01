"use client";

interface BarProps {
  pct: number;
  color?: string;
  h?: number;
}

export default function Bar({ pct, color = "var(--cyan)", h = 4 }: BarProps) {
  return (
    <div
      className="rounded overflow-hidden"
      style={{ height: h, background: "var(--s3)" }}
    >
      <div
        className="h-full rounded transition-[width] duration-500 ease-in-out"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

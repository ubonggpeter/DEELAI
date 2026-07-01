"use client";

export default function LiveDot({ color = "#00E5A0" }: { color?: string }) {
  return (
    <span
      className="inline-block w-[7px] h-[7px] rounded-full mr-[5px] animate-liveBlip"
      style={{ background: color }}
    />
  );
}

"use client";

export default function Spinner() {
  return (
    <div
      className="w-[22px] h-[22px] rounded-full animate-spin-custom"
      style={{
        border: "2.5px solid var(--cyan)",
        borderTopColor: "transparent",
      }}
    />
  );
}
